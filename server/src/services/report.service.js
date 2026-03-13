import ExcelJS from "exceljs";
import * as cheerio from "cheerio";
import { parseMsbteResultHtml } from "./msbteParse.service.js";

/**
 * Extracts the result class (e.g., DISTINCTION) from raw MSBTE HTML
 */
function extractResultClassFromRawHtml(rawHtml) {
  const html = String(rawHtml || "");
  if (!html) return null;

  try {
    const $ = cheerio.load(html);
    const dv = $("#dvTotal0");
    if (dv.length) {
      const keywordRe = /(distinction|\bclass\b|\bpass\b|\bfail\b|\bkt\b|atkt)/i;
      const candidates = dv
        .find("td[colspan='4'] strong, td[colspan=4] strong")
        .toArray()
        .map((el) => String($(el).text() || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim())
        .filter(Boolean);

      const best = candidates.find((t) => keywordRe.test(t));
      return best || null;
    }
  } catch { /* ignore */ }

  const dvIdx = html.toLowerCase().indexOf("id=\"dvtotal0\"");
  const dvIdx2 = dvIdx >= 0 ? dvIdx : html.toLowerCase().indexOf("id='dvtotal0'");
  if (dvIdx2 >= 0) {
    const divEnd = html.toLowerCase().indexOf("</div>", dvIdx2);
    const slice = html.slice(dvIdx2, divEnd > dvIdx2 ? divEnd + "</div>".length : Math.min(html.length, dvIdx2 + 12000));
    const keywordRe = /(distinction|\bclass\b|\bpass\b|\bfail\b|\bkt\b|atkt)/i;
    const candidates = Array.from(slice.matchAll(/colspan\s*=\s*"?4"?[^>]*>\s*<strong[^>]*>([^<]+)<\/strong>/gi))
      .map((m) => (m && m[1] ? String(m[1]).trim() : ""))
      .filter(Boolean);
    const best = candidates.find((t) => keywordRe.test(t));
    if (best) return best;
    const strongMatches = Array.from(slice.matchAll(/<strong[^>]*>([^<]+)<\/strong>/gi))
      .map((m) => (m && m[1] ? String(m[1]).trim() : ""))
      .filter(Boolean);
    const lastKeyword = [...strongMatches].reverse().find((t) => keywordRe.test(t));
    if (lastKeyword) return lastKeyword;
  }
  return null;
}

/**
 * Determines the effective result class using stored data, HTML parsing, or percentage
 */
const getEffectiveResultClass = (r) => {
  const rawResultClass = String(r?.resultClass || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  if (rawResultClass && /(distinction|\bclass\b|\bkt\b|atkt)/i.test(rawResultClass)) return rawResultClass;
  if (r?.rawHtml) {
    try {
      const parsed = parseMsbteResultHtml(r.rawHtml);
      if (parsed?.resultClass) return String(parsed.resultClass).trim();
    } catch { /* ignore */ }
    const extracted = extractResultClassFromRawHtml(r.rawHtml);
    if (extracted) return extracted;
  }
  const p = typeof r?.percentage === "number" ? r.percentage : Number.NaN;
  if (Number.isFinite(p)) {
    if (p >= 75) return "FIRST CLASS WITH DISTINCTION";
    if (p >= 60) return "FIRST CLASS";
    if (p >= 50) return "SECOND CLASS";
    if (p >= 40) return "PASS CLASS";
  }
  return rawResultClass || null;
};

/**
 * Format A: Summary Analysis
 */
function buildAnalysisWorksheet(wb, batch) {
  const sheet = wb.addWorksheet("Format A");
  const results = batch.results || [];
  const appeared = results.filter((r) => r.fetchedAt && !r.errorMessage).length || results.length;
  const pass = results.filter((r) => String(r.resultStatus || "").toLowerCase() === "pass").length;
  const fail = results.filter((r) => String(r.resultStatus || "").toLowerCase() === "fail").length;

  const normalize = (s) => String(s || "").replace(/\s+/g, " ").trim().toLowerCase();
  const classText = (r) => normalize(getEffectiveResultClass(r));

  const atkt = results.filter((r) => {
    const c = classText(r);
    return c === "kt" || c.includes("atkt") || c.includes(" kt");
  }).length;

  const firstDist = results.filter((r) => {
    const c = classText(r);
    return c.includes("distinction");
  }).length;

  const first = results.filter(r => {
    const c = classText(r);
    return c.includes("first class") && !c.includes("distinction");
  }).length;

  const second = results.filter(r => classText(r).includes("second class")).length;
  const passClass = results.filter(r => classText(r).includes("pass class")).length;

  const passPct = appeared > 0 ? ((pass / appeared) * 100).toFixed(2) : 0;
  const passWithAtktPct = appeared > 0 ? (((pass + atkt) / appeared) * 100).toFixed(2) : 0;

  sheet.getRow(1).height = 20;
  sheet.mergeCells("A1:A3"); sheet.getCell("A1").value = "Class/Year";
  sheet.mergeCells("B1:B3"); sheet.getCell("B1").value = "Registered";
  sheet.mergeCells("C1:C3"); sheet.getCell("C1").value = "Appeared";
  sheet.mergeCells("D1:D3"); sheet.getCell("D1").value = "Distinction";
  sheet.mergeCells("E1:G1"); sheet.getCell("E1").value = "Passed";
  sheet.getCell("E2").value = "1st Class"; sheet.getCell("F2").value = "2nd Class"; sheet.getCell("G2").value = "Pass Class";
  sheet.mergeCells("H1:H3"); sheet.getCell("H1").value = "Pass (Direct)";
  sheet.mergeCells("I1:I3"); sheet.getCell("I1").value = "With ATKT";
  sheet.mergeCells("J1:J3"); sheet.getCell("J1").value = "Total Passed";
  sheet.mergeCells("K1:K3"); sheet.getCell("K1").value = "Failed";
  sheet.mergeCells("L1:L3"); sheet.getCell("L1").value = "Passing %";
  sheet.mergeCells("M1:M3"); sheet.getCell("M1").value = "% With ATKT";

  const row = sheet.getRow(5);
  row.getCell(3).value = appeared;
  row.getCell(4).value = firstDist;
  row.getCell(5).value = first;
  row.getCell(6).value = second;
  row.getCell(7).value = passClass;
  row.getCell(8).value = pass;
  row.getCell(9).value = atkt;
  row.getCell(10).value = pass + atkt;
  row.getCell(11).value = fail;
  row.getCell(12).value = `${passPct}%`;
  row.getCell(13).value = `${passWithAtktPct}%`;

  [1, 2, 3, 4, 5].forEach(r => {
    const row = sheet.getRow(r);
    row.font = { bold: r < 5 };
    row.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    for (let c = 1; c <= 13; c++) row.getCell(c).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });
  sheet.columns = Array(13).fill({ width: 12 });
}

/**
 * Format B: Toppers
 */
function buildFormatBWorksheet(wb, batch) {
  const sheet = wb.addWorksheet("Format B");
  const top3 = (batch.results || [])
    .filter(r => typeof r.percentage === "number")
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3);

  sheet.mergeCells("A1:E1"); sheet.getCell("A1").value = "List of Toppers";
  sheet.getRow(1).font = { bold: true, size: 14 };
  sheet.getRow(1).alignment = { horizontal: 'center' };
  
  const headers = ["Sr. No.", "Name of Student", "Marks", "Out of", "Percentage"];
  sheet.addRow(headers).font = { bold: true };
  
  for (let i = 0; i < 3; i++) {
    const r = top3[i];
    sheet.addRow([i + 1, r?.name || "", r?.totalMarks || "", 850, r?.percentage ? r.percentage.toFixed(2) + "%" : ""]);
  }
  
  sheet.columns = [{ width: 8 }, { width: 30 }, { width: 12 }, { width: 12 }, { width: 15 }];
  sheet.eachRow(r => r.eachCell(c => c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }));
}

/**
 * Format C: Subject Wise Analysis
 */
function buildFormatCWorksheet(wb, batch) {
  const sheet = wb.addWorksheet("Format C");
  const subjects = new Set();
  batch.results.forEach(r => r.subjectMarks && Object.keys(r.subjectMarks).forEach(s => subjects.add(s)));

  sheet.addRow(["Sr.", "Subject", "Appeared", "Passed", "Distinction", "1st Class", "2nd Class", "Pass Class", "% Passing"]).font = { bold: true };
  
  let sr = 1;
  subjects.forEach(subj => {
    let app = 0, p = 0, d = 0, f = 0, s = 0, pc = 0;
    batch.results.forEach(r => {
      const sm = r.subjectMarks?.[subj];
      if (!sm || !sm.totalMax) return;
      app++;
      const pct = (sm.totalObt / sm.totalMax) * 100;
      const isKt = typeof sm.totalObt === 'string' && sm.totalObt.includes('*');
      if (!isKt && pct >= 40) {
        p++;
        if (pct >= 75) d++;
        else if (pct >= 60) f++;
        else if (pct >= 50) s++;
        else pc++;
      }
    });
    if (app > 0) {
      sheet.addRow([sr++, subj, app, p, d, f, s, pc, ((p / app) * 100).toFixed(2) + "%"]);
    }
  });
  
  sheet.columns = [{ width: 6 }, { width: 25 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 15 }];
  sheet.eachRow(r => r.eachCell(c => c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }));
}

/**
 * Pass Students Report
 */
function buildPassStudentsWorksheet(wb, batch) {
  const sheet = wb.addWorksheet("Pass Students");
  const pass = (batch.results || []).filter(r => String(r.resultStatus || "").toLowerCase() === "pass");

  sheet.addRow(["Sr. No.", "Enrollment No.", "Name of Student", "Total Marks", "Percentage"]).font = { bold: true };
  pass.forEach((r, i) => {
    sheet.addRow([i + 1, r.enrollmentNumber || "", r.name || "", r.totalMarks ?? "", r.percentage ? r.percentage.toFixed(2) + "%" : ""]);
  });
  sheet.columns = [{ width: 8 }, { width: 18 }, { width: 35 }, { width: 12 }, { width: 15 }];
  sheet.eachRow(r => r.eachCell(c => c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }));
}

/**
 * Fail Students Report
 */
function buildFailStudentsWorksheet(wb, batch) {
  const sheet = wb.addWorksheet("Fail Students");
  const fail = (batch.results || []).filter(r => String(r.resultStatus || "").toLowerCase() === "fail" || String(r.resultStatus || "").toLowerCase() === "unknown" || r.errorMessage);

  sheet.addRow(["Sr. No.", "Enrollment No.", "Name of Student", "Status", "Remarks"]).font = { bold: true };
  fail.forEach((r, i) => {
    sheet.addRow([i + 1, r.enrollmentNumber || "", r.name || "", r.resultStatus || "Unknown", r.errorMessage || ""]);
  });
  sheet.columns = [{ width: 8 }, { width: 18 }, { width: 35 }, { width: 15 }, { width: 25 }];
  sheet.eachRow(r => r.eachCell(c => c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }));
}

/**
 * KT Analysis Report
 */
function buildKtAnalysisWorksheet(wb, batch) {
  const sheet = wb.addWorksheet("KT Analysis");
  
  sheet.addRow(["Sr. No.", "Enrollment No.", "Name of Student", "Failed Subjects (KT)", "Total KTs"]).font = { bold: true };
  let sr = 1;
  (batch.results || []).forEach(r => {
    const ktSubjects = [];
    const sm = r.subjectMarks;
    if (sm && typeof sm === "object") {
      for (const [subj, entry] of Object.entries(sm)) {
        if (entry && Object.values(entry).some(v => typeof v === "string" && v.includes("*"))) {
          ktSubjects.push(subj);
        }
      }
    }
    const cText = getEffectiveResultClass(r) || "";
    if (ktSubjects.length > 0 || cText.toLowerCase().includes("kt")) {
      sheet.addRow([sr++, r.enrollmentNumber || "", r.name || "", ktSubjects.join(", ") || "Unknown", ktSubjects.length]);
    }
  });
  sheet.columns = [{ width: 8 }, { width: 18 }, { width: 35 }, { width: 40 }, { width: 10 }];
  sheet.eachRow(r => r.eachCell(c => c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }));
}

/**
 * Comprehensive Summary Report
 */
function buildComprehensiveSummaryWorksheet(wb, batch) {
  const sheet = wb.addWorksheet("Comprehensive Summary");
  const results = batch.results || [];
  const app = results.filter(r => r.fetchedAt && !r.errorMessage).length || results.length;
  const pass = results.filter(r => String(r.resultStatus || "").toLowerCase() === "pass").length;
  const fail = results.filter(r => String(r.resultStatus || "").toLowerCase() === "fail").length;
  
  let totalKTs = 0;
  let droppedCount = 0;
  results.forEach(r => {
    let kt = 0;
    if (r.subjectMarks) {
      Object.values(r.subjectMarks).forEach(entry => {
        if (entry && Object.values(entry).some(v => typeof v === "string" && v.includes("*"))) kt++;
      });
    }
    totalKTs += kt;
    if (kt >= 4) droppedCount++;
  });
  
  const passRate = app > 0 ? ((pass / app) * 100).toFixed(2) : 0;

  sheet.mergeCells("A1:B1");
  sheet.getCell("A1").value = "Batch Comprehensive Academic Summary";
  sheet.getCell("A1").font = { bold: true, size: 14 };
  sheet.getCell("A1").alignment = { horizontal: "center" };
  
  sheet.addRow([]);
  
  const data = [
    ["Total Students Analyzed", app],
    ["Total Passed", pass],
    ["Total Failed", fail],
    ["Aggregate Pass Percentage", `${passRate}%`],
    ["Critical Backlog Students (4+ KTs)", droppedCount],
    ["Total Subject Failures (KTs)", totalKTs]
  ];
  
  data.forEach(d => {
    const r = sheet.addRow(d);
    r.getCell(1).font = { bold: true };
    r.getCell(2).alignment = { horizontal: "left" };
  });
  
  sheet.getColumn(1).width = 40;
  sheet.getColumn(2).width = 20;
}

/**
 * Generate all reports
 */
export const generateReports = async (batch) => {
  const reports = {};
  
  // 1. Pass Students
  const wbPass = new ExcelJS.Workbook(); buildPassStudentsWorksheet(wbPass, batch);
  reports.pass_students = await wbPass.xlsx.writeBuffer();

  // 2. Fail Students
  const wbFail = new ExcelJS.Workbook(); buildFailStudentsWorksheet(wbFail, batch);
  reports.fail_students = await wbFail.xlsx.writeBuffer();

  // 3. KT Analysis
  const wbKt = new ExcelJS.Workbook(); buildKtAnalysisWorksheet(wbKt, batch);
  reports.kt_analysis = await wbKt.xlsx.writeBuffer();

  // 4. Full Consolidated (A, B, C)
  const wbFull = new ExcelJS.Workbook();
  buildAnalysisWorksheet(wbFull, batch);
  buildFormatBWorksheet(wbFull, batch);
  buildFormatCWorksheet(wbFull, batch);
  reports.full_consolidated = await wbFull.xlsx.writeBuffer();

  // 5. Format A
  const wbA = new ExcelJS.Workbook(); buildAnalysisWorksheet(wbA, batch);
  reports.format_a = await wbA.xlsx.writeBuffer();

  // 6. Format B
  const wbB = new ExcelJS.Workbook(); buildFormatBWorksheet(wbB, batch);
  reports.format_b = await wbB.xlsx.writeBuffer();

  // 7. Format C
  const wbC = new ExcelJS.Workbook(); buildFormatCWorksheet(wbC, batch);
  reports.format_c = await wbC.xlsx.writeBuffer();

  // 8. Comprehensive Summary
  const wbComp = new ExcelJS.Workbook(); buildComprehensiveSummaryWorksheet(wbComp, batch);
  reports.comprehensive_summary = await wbComp.xlsx.writeBuffer();

  return reports;
};


