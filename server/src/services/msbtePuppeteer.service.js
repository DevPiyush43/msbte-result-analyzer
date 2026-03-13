/**
 * MSBTE Result Fetcher — HTTP-based (no Puppeteer / no browser)
 *
 * Why: Render.com (and most PaaS providers) do not ship a Chrome binary.
 * Puppeteer would crash on /fetch/start with a 500 error, and
 * long-running browser sessions exceed Render's 30-second HTTP timeout.
 *
 * How it works:
 *  1. GET the MSBTE result page to grab the ASP.NET __VIEWSTATE + CAPTCHA image.
 *  2. Return the CAPTCHA image (base64 PNG) to the frontend.
 *  3. The teacher types the CAPTCHA text and presses "Continue".
 *  4. POST the form with enrollment number + CAPTCHA; save the HTML result.
 *  5. Repeat for every remaining enrollment in the batch.
 *
 * A job is a plain JS object stored in a Map (ephemeral in-process).
 * If the server restarts the job is lost — that is acceptable because
 * the teacher simply presses "Start" again; already-fetched records are
 * preserved in MongoDB and skipped automatically.
 */

import { ResultBatch } from "../models/ResultBatch.js";
import { parseMsbteResultHtml } from "./msbteParse.service.js";
import { env } from "../config/env.js";
import { Settings } from "../models/Settings.js";

// ---------------------------------------------------------------------------
// Lightweight HTTP helper (uses Node's built-in fetch, available in Node 18+)
// Falls back to node-fetch if present, otherwise errors with a clear message.
// ---------------------------------------------------------------------------

let _fetch;
async function getFetch() {
  if (_fetch) return _fetch;
  if (typeof globalThis.fetch === "function") {
    _fetch = globalThis.fetch.bind(globalThis);
    return _fetch;
  }
  // Older Node — try node-fetch
  try {
    const mod = await import("node-fetch");
    _fetch = mod.default || mod;
    return _fetch;
  } catch {
    throw new Error(
      "No fetch implementation found. Use Node 18+ or install node-fetch."
    );
  }
}

// ---------------------------------------------------------------------------
// ASP.NET ViewState / form helpers
// ---------------------------------------------------------------------------

function extractHidden(html, name) {
  // Match  <input type="hidden" name="NAME" value="VALUE" ...>  in any order
  const re = new RegExp(
    `<input[^>]+name=["']${name}["'][^>]*value=["']([^"']*)["']`,
    "i"
  );
  let m = html.match(re);
  if (m) return m[1];
  // Also try value before name
  const re2 = new RegExp(
    `<input[^>]+value=["']([^"']*)["'][^>]*name=["']${name}["']`,
    "i"
  );
  m = html.match(re2);
  return m ? m[1] : "";
}

function extractAllHidden(html) {
  const out = {};
  const re =
    /<input[^>]+type=["']hidden["'][^>]*/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const tag = match[0];
    const nameM = tag.match(/name=["']([^"']*)["']/i);
    const valueM = tag.match(/value=["']([^"']*)["']/i);
    if (nameM) out[nameM[1]] = valueM ? valueM[1] : "";
  }
  return out;
}

// Extract the src of the CAPTCHA image from the HTML
function extractCaptchaSrc(html) {
  // common patterns: id="imgCaptcha", src containing "captcha" or ".aspx"
  const patterns = [
    /<img[^>]+id=["']imgCaptcha["'][^>]*src=["']([^"']+)["']/i,
    /<img[^>]+src=["']([^"']*captcha[^"']*)["']/i,
    /<img[^>]+src=["']([^"']*\.aspx[^"']*)["'][^>]*id=["'][^"']*captcha/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return m[1];
  }
  return null;
}

// Resolve a (possibly relative) URL against a base URL
function resolveUrl(base, relative) {
  if (!relative) return null;
  if (/^https?:\/\//i.test(relative)) return relative;
  try {
    return new URL(relative, base).href;
  } catch {
    const baseNoPath = base.replace(/\/[^/]*$/, "");
    return `${baseNoPath}/${relative.replace(/^\//, "")}`;
  }
}

// ---------------------------------------------------------------------------
// MsBteFetchJob — one per batch
// ---------------------------------------------------------------------------

class MsBteFetchJob {
  constructor({ batchId, teacherId }) {
    this.batchId = batchId;
    this.teacherId = teacherId;

    this.status = "idle";
    this.currentIndex = 0;
    this.total = 0;
    this.currentEnrollment = null;
    this.lastError = null;

    // State preserved between GET and POST
    this._cookies = "";
    this._hiddenFields = {};
    this._captchaImgUrl = null;
    this._captchaPngBase64 = null; // cached after fetch
    this._baseUrl = env.MSBTE_RESULT_URL || "";
  }

  // -------------------------------------------------------------------------
  // Public API expected by fetch.controller.js
  // -------------------------------------------------------------------------

  getState() {
    return {
      batchId: this.batchId,
      status: this.status,
      currentIndex: this.currentIndex,
      total: this.total,
      currentEnrollment: this.currentEnrollment,
      lastError: this.lastError,
    };
  }

  async getCaptchaPngBase64() {
    if (this._captchaPngBase64) return this._captchaPngBase64;
    if (!this._captchaImgUrl) {
      const err = new Error("CAPTCHA image URL not available. Try refreshing.");
      err.statusCode = 404;
      throw err;
    }
    this._captchaPngBase64 = await this._fetchImageAsBase64(this._captchaImgUrl);
    return this._captchaPngBase64;
  }

  async refreshCaptcha() {
    // Re-GET the page to obtain a fresh CAPTCHA image
    await this._loadFormPage();
  }

  async continueAfterCaptcha({ captcha } = {}) {
    const value = String(captcha || "").trim();
    if (!value) {
      const err = new Error("CAPTCHA is empty");
      err.statusCode = 409;
      err.code = "CAPTCHA_EMPTY";
      throw err;
    }

    if (this.status !== "ready_for_captcha") {
      const err = new Error("Job is not waiting for CAPTCHA");
      err.statusCode = 400;
      throw err;
    }

    this.status = "submitting";

    try {
      await this._submitAndSave(value);
    } catch (e) {
      if (e?.code === "CAPTCHA_EMPTY") {
        this.status = "ready_for_captcha";
        this.lastError = null;
        return;
      }
      
      // If it's a captcha failure, we stay in ready_for_captcha
      if (this.status === "ready_for_captcha") return;

      // Mark current enrollment as errored and advance
      this.lastError = e?.message || "Fetch failed";
      await this._saveError(this.lastError);
      this.currentIndex++;
    }

    // Move to next enrollment
    await this._prepareCurrent();
  }

  async skipCurrentToFailedQueue() {
    if (this.status !== "ready_for_captcha" || !this.currentEnrollment) {
      throw new Error("No active enrollment to skip");
    }

    await ResultBatch.updateOne(
      { _id: this.batchId },
      { 
        $addToSet: { failedQueue: this.currentEnrollment },
        $set: { "results.$[res].errorMessage": "Skipped to failed queue" }
      },
      { arrayFilters: [{ "res.enrollmentNumber": this.currentEnrollment }] }
    );

    this.currentIndex++;
    await this._prepareCurrent();
  }

  async close() {
    // Nothing to close for HTTP-based fetcher
    this.status = "idle";
  }

  // -------------------------------------------------------------------------
  // Init — called once by msbteJobService.start()
  // -------------------------------------------------------------------------

  async init() {
    // Try to get dynamic MSBTE URL from settings
    try {
      const setting = await Settings.findOne({ key: "MSBTE_RESULT_URL" });
      if (setting && setting.value) {
        this._baseUrl = setting.value;
      }
    } catch (e) {
      console.error("Error loading MSBTE_RESULT_URL from settings:", e);
    }

    if (!this._baseUrl) {
      const err = new Error("MSBTE_RESULT_URL is not set (check Admin Settings)");
      err.statusCode = 500;
      throw err;
    }

    const batch = await ResultBatch.findOne({
      _id: this.batchId,
      teacherId: this.teacherId,
    });
    if (!batch) {
      const err = new Error("Batch not found");
      err.statusCode = 404;
      throw err;
    }

    this.total = batch.results.length;

    await ResultBatch.updateOne(
      { _id: this.batchId, teacherId: this.teacherId },
      { $set: { status: "fetching" } }
    );

    await this._prepareCurrent();
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  /** Advance currentIndex past already-fetched records, GET the form page. */
  async _prepareCurrent() {
    const batch = await ResultBatch.findOne({
      _id: this.batchId,
      teacherId: this.teacherId,
    }).lean();

    if (!batch) return;

    // Check if we are done with the main list
    if (this.currentIndex >= batch.results.length) {
      // Check if we have anything in failedQueue to retry
      const toRetry = batch.results.find(r => 
        batch.failedQueue.includes(r.enrollmentNumber) && 
        (r.retryAttempts || 0) < 3 && 
        !r.fetchedAt
      );

      if (toRetry) {
        this.status = "retrying";
        this.currentEnrollment = toRetry.enrollmentNumber;
        await this._loadFormPage();
        this.status = "ready_for_captcha";
        return;
      }

      this.status = "completed";
      await ResultBatch.updateOne(
        { _id: this.batchId, teacherId: this.teacherId },
        { $set: { status: "completed" } }
      );
      
      const batchFinal = await ResultBatch.findById(this.batchId).lean();
      const successCount = batchFinal.results.filter(r => r.fetchedAt && !r.errorMessage).length;
      const failCount = batchFinal.results.length - successCount;

      await ExtractionLog.updateOne(
        { batchId: this.batchId, teacherId: this.teacherId, status: "STARTED" },
        { 
          $set: { 
            status: "COMPLETED", 
            endTime: new Date(),
            successCount,
            failCount
          } 
        }
      );
      return;
    }

    // Normal processing
    while (this.currentIndex < batch.results.length) {
      const r = batch.results[this.currentIndex];
      if (!r || r.fetchedAt) {
        this.currentIndex++;
        continue;
      }
      this.currentEnrollment = r.enrollmentNumber;
      break;
    }

    if (this.currentIndex >= batch.results.length) {
      return this._prepareCurrent(); // check for retries
    }

    // GET the form page to capture viewstate + CAPTCHA
    await this._loadFormPage();
    this.status = "ready_for_captcha";
  }

  /** GET the MSBTE result page, extract hidden fields + CAPTCHA src */
  async _loadFormPage() {
    const f = await getFetch();

    const resp = await f(this._baseUrl, {
      method: "GET",
      headers: this._buildHeaders(),
      redirect: "follow",
    });

    if (!resp.ok) {
      throw new Error(
        `MSBTE page returned HTTP ${resp.status}. Check MSBTE_RESULT_URL.`
      );
    }

    // Persist cookies for subsequent POST
    const setCookie = resp.headers.get("set-cookie") || "";
    if (setCookie) this._cookies = this._extractCookieString(setCookie);

    const html = await resp.text();

    this._hiddenFields = extractAllHidden(html);

    const captchaSrcRaw = extractCaptchaSrc(html);
    this._captchaImgUrl = captchaSrcRaw
      ? resolveUrl(this._baseUrl, captchaSrcRaw)
      : null;
    this._captchaPngBase64 = null; // invalidate cache
  }

  /**
   * Build the POST body, submit, parse the result HTML, and persist to MongoDB.
   */
  async _submitAndSave(captchaText) {
    const f = await getFetch();

    // Determine which submit button / mode the MSBTE page uses
    // (1 = Seat No, 2 = Enrollment No)
    let modeValue = process.env.MSBTE_MODE_VALUE || "1";
    
    // If the enrollment looks like a seat number (usually 6 digits), 
    // we can try to be smart, but better to check the batch data.
    if (this.currentEnrollment && this.currentEnrollment.length > 8) {
      modeValue = "2"; // Likely an enrollment number
    }

    const formData = new URLSearchParams();

    // Include all hidden ASP.NET fields (ViewState, EventValidation, etc.)
    for (const [k, v] of Object.entries(this._hiddenFields)) {
      formData.set(k, v);
    }

    // Enrollment / seat selector
    const modeSelectName =
      process.env.MSBTE_MODE_SELECT_NAME || "ddlEnrollOrSeatNo";
    const enrollInputName =
      process.env.MSBTE_ENROLL_INPUT_NAME || "txtEnrollOrSeatNo";
    const captchaInputName =
      process.env.MSBTE_CAPTCHA_INPUT_NAME || "txtCaptchaHot";
    const submitBtnName =
      process.env.MSBTE_SUBMIT_BTN_NAME || "btnShowResult";

    formData.set(modeSelectName, modeValue);
    formData.set(enrollInputName, this.currentEnrollment);
    formData.set(captchaInputName, captchaText);
    
    // ASP.NET Image buttons often expect .x and .y coordinates
    formData.set(submitBtnName + ".x", "0");
    formData.set(submitBtnName + ".y", "0");

    const resp = await f(this._baseUrl, {
      method: "POST",
      headers: {
        ...this._buildHeaders(),
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: this._baseUrl,
      },
      body: formData.toString(),
      redirect: "follow",
    });

    // Persist cookies from POST response too
    const setCookie = resp.headers.get("set-cookie") || "";
    if (setCookie) this._cookies = this._extractCookieString(setCookie);

    const html = await resp.text();

    // Check if CAPTCHA was wrong (page will still contain the CAPTCHA form)
    const lowerHtml = html.toLowerCase();
    const captchaFailed =
      lowerHtml.includes("invalid captcha") ||
      lowerHtml.includes("please enter valid captcha") ||
      lowerHtml.includes("incorrect captcha");

    if (captchaFailed) {
      // Reload fresh CAPTCHA and ask user to retry (don't count this as enrollment error)
      await this._loadFormPage();
      this.status = "ready_for_captcha";
      this.lastError = "Invalid CAPTCHA — please try again";
      return;
    }

    const parsed = parseMsbteResultHtml(html);

    await ResultBatch.updateOne(
      {
        _id: this.batchId,
        teacherId: this.teacherId,
        "results.enrollmentNumber": this.currentEnrollment,
      },
      {
        $set: {
          "results.$.rawHtml": html,
          "results.$.fetchedAt": new Date(),
          "results.$.errorMessage": parsed.ok
            ? null
            : parsed.errorMessage || "Parse failed",
          "results.$.retryAttempts": this.status === "retrying" ? 1 : 0, // Placeholder, simple increment is better
          ...(parsed.name ? { "results.$.name": parsed.name } : {}),
          ...(parsed.enrollmentNumber
            ? { "results.$.marksheetEnrollmentNumber": parsed.enrollmentNumber }
            : {}),
          ...(parsed.seatNumber
            ? { "results.$.seatNumber": parsed.seatNumber }
            : {}),
          ...(typeof parsed.totalMarks === "number"
            ? { "results.$.totalMarks": parsed.totalMarks }
            : {}),
          ...(typeof parsed.percentage === "number"
            ? { "results.$.percentage": parsed.percentage }
            : {}),
          ...(parsed.resultStatus
            ? { "results.$.resultStatus": parsed.resultStatus }
            : {}),
          ...(parsed.resultClass
            ? { "results.$.resultClass": parsed.resultClass }
            : {}),
          ...(parsed.subjectMarks
            ? { "results.$.subjectMarks": parsed.subjectMarks }
            : {}),
        },
        $pull: { failedQueue: this.currentEnrollment }
      }
    );

    // If we were retrying, we don't increment currentIndex because retries 
    // are picked up by find() in _prepareCurrent based on failedQueue.
    if (this.status !== "retrying") {
      this.currentIndex++;
    }
    this.lastError = null;

    // Reload form page for next enrollment (gets fresh CAPTCHA)
    await this._loadFormPage();
  }

  async _saveError(message) {
    await ResultBatch.updateOne(
      {
        _id: this.batchId,
        teacherId: this.teacherId,
        "results.enrollmentNumber": this.currentEnrollment,
      },
      {
        $set: {
          "results.$.errorMessage": message,
          "results.$.fetchedAt": new Date(),
        },
        $push: { errors: `${this.currentEnrollment}: ${message}` },
      }
    );
  }

  async _fetchImageAsBase64(url) {
    const f = await getFetch();
    const resp = await f(url, {
      headers: {
        ...this._buildHeaders(),
        Accept: "image/*,*/*",
        Referer: this._baseUrl,
      },
    });
    if (!resp.ok) {
      throw new Error(`Failed to fetch CAPTCHA image: HTTP ${resp.status}`);
    }
    const buf = await resp.arrayBuffer();
    return Buffer.from(buf).toString("base64");
  }

  _buildHeaders() {
    return {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Connection: "keep-alive",
      ...(this._cookies ? { Cookie: this._cookies } : {}),
    };
  }

  /** Parse Set-Cookie header(s) into a single Cookie header value string */
  _extractCookieString(setCookieHeader) {
    // setCookieHeader may be a comma-joined string from node-fetch or a single cookie
    const parts = setCookieHeader
      .split(/,(?=\s*\w+=)/) // split on comma that precedes name=value
      .map((c) => c.split(";")[0].trim())
      .filter(Boolean);

    // Merge with existing cookies
    const existing = {};
    if (this._cookies) {
      for (const pair of this._cookies.split(";")) {
        const [k, ...vs] = pair.trim().split("=");
        if (k) existing[k.trim()] = vs.join("=");
      }
    }
    for (const pair of parts) {
      const [k, ...vs] = pair.split("=");
      if (k) existing[k.trim()] = vs.join("=");
    }
    return Object.entries(existing)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }
}

// ---------------------------------------------------------------------------
// Job registry
// ---------------------------------------------------------------------------

const jobs = new Map();

import { ExtractionLog } from "../models/ExtractionLog.js";

export const msbteJobService = {
  async start({ batchId, teacherId }) {
    const key = `${teacherId}:${batchId}`;

    if (jobs.has(key)) return jobs.get(key);

    const job = new MsBteFetchJob({ batchId, teacherId });
    jobs.set(key, job);

    try {
      await job.init();
      
      const batch = await ResultBatch.findById(batchId);
      await ExtractionLog.create({
        teacherId,
        batchId,
        totalRequested: batch.results.length,
        seatRange: batch.results.length > 0 ? `${batch.results[0].enrollmentNumber} - ${batch.results[batch.results.length-1].enrollmentNumber}` : "N/A"
      });

      return job;
    } catch (e) {
      jobs.delete(key);
      throw e;
    }
  },

  get({ batchId, teacherId }) {
    return jobs.get(`${teacherId}:${batchId}`) || null;
  },

  async stop({ batchId, teacherId }) {
    const key = `${teacherId}:${batchId}`;
    const job = jobs.get(key);
    if (!job) return;
    await job.close();
    jobs.delete(key);
    
    await ResultBatch.updateOne(
      { _id: batchId, teacherId },
      {
        $set: { status: "failed" },
        $push: { errors: "Job stopped by user" },
      }
    );

    await ExtractionLog.updateOne(
      { batchId, teacherId, status: "STARTED" },
      { $set: { status: "FAILED", endTime: new Date() } }
    );
  },
};
