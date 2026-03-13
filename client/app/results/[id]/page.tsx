"use client";

import Link from "next/link";
import * as React from "react";
import { useParams } from "next/navigation";
import {
  BarChart3,
  Download,
  FileSearch,
  Filter,
  GraduationCap,
  IdCard,
  Search,
  Percent,
  Play,
  RefreshCw,
  RotateCcw,
  Square,
  Trophy,
  Eye,
  Activity,
  Zap,
  ChevronRight,
  ChevronDown,
  Sparkles,
  AlertCircle,
  Database,
  History,
  Terminal,
  ArrowLeft,
  Box,
  Lock
} from "lucide-react";

import { Protected } from "@/components/Protected";
import { useAuth } from "@/components/AuthProvider";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { FadeIn, FadeInStagger, FadeInStaggerItem } from "@/components/Animated";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type FetchState = {
  batchId: string;
  status:
    | "not_started"
    | "idle"
    | "ready_for_captcha"
    | "submitting"
    | "completed"
    | "failed";
  currentIndex?: number;
  total?: number;
  currentEnrollment?: string | null;
  lastError?: string | null;
};

type BatchAnalytics = {
  totals: {
    totalStudents: number;
    pass: number;
    fail: number;
    passRate: number;
    dropped: number;
    totalKTs: number;
  };
  topper: {
    name: string | null;
    percentage: number | null;
    enrollmentNumber: string | null;
    seatNumber: string | null;
  };
  classDistribution: Array<{ label: string; value: number }>;
  subjectAverages: Array<{ subject: string; avgPercentage: number | null; samples: number }>;
};

type StudentResult = {
  enrollmentNumber: string;
  marksheetEnrollmentNumber?: string;
  name?: string;
  seatNumber?: string;
  percentage?: number;
  resultStatus?: "Pass" | "Fail" | "Unknown";
  resultClass?: string;
  fetchedAt?: string;
  errorMessage?: string;
  subjectMarks?: Record<
    string,
    {
      faThMax?: number | string | null;
      faThObt?: number | string | null;
      saThMax?: number | string | null;
      saThObt?: number | string | null;
      totalMax?: number | string | null;
      totalObt?: number | string | null;
      faPrMax?: number | string | null;
      faPrObt?: number | string | null;
      saPrMax?: number | string | null;
      saPrObt?: number | string | null;
      slaMax?: number | string | null;
      slaObt?: number | string | null;
      credits?: number | string | null;
    }
  >;
};

type Batch = {
  id: string;
  uploadDate: string;
  totalStudents: number;
  status: "created" | "fetching" | "completed" | "failed";
  results: StudentResult[];
  errors: string[];
};

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const batchId = params.id;

  const { user, loading: authLoading } = useAuth();

  const [batch, setBatch] = React.useState<Batch | null>(null);
  const [state, setState] = React.useState<FetchState | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "Pass" | "Fail" | "Unknown" | "Error">(
    "all"
  );
  const [sortKey, setSortKey] = React.useState<"enrollment" | "percentage_desc" | "percentage_asc">(
    "enrollment"
  );
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const [analytics, setAnalytics] = React.useState<BatchAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = React.useState(true);

  const [captchaPngBase64, setCaptchaPngBase64] = React.useState<string | null>(null);
  const [captchaText, setCaptchaText] = React.useState<string>("");
  const [captchaError, setCaptchaError] = React.useState<string | null>(null);

  const isJobActive =
    Boolean(state?.status) &&
    state?.status !== "not_started" &&
    state?.status !== "idle" &&
    state?.status !== "completed" &&
    state?.status !== "failed";
  const isSubmitting = busy !== null || state?.status === "submitting";

  function clearFilters() {
    setQuery("");
    setStatusFilter("all");
    setSortKey("enrollment");
  }

  async function loadBatch() {
    try {
      const res = await api.get(`/batches/${batchId}`);
      setBatch(res.data.batch);
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      throw err;
    }
  }

  async function refreshAll() {
    setError(null);
    setBusy("refresh");
    try {
      await Promise.all([loadBatch(), loadState(), loadAnalytics()]);
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || "Refresh failed";
      setError(message);
    } finally {
      setBusy(null);
    }
  }

  async function loadAnalytics() {
    setLoadingAnalytics(true);
    try {
      const res = await api.get(`/batches/${batchId}/analytics`);
      setAnalytics(res.data || null);
    } catch {
      setAnalytics(null);
    } finally {
      setLoadingAnalytics(false);
    }
  }

  async function reparse() {
    setError(null);
    setBusy("reparse");
    try {
      await api.post(`/batches/${batchId}/reparse`);
      await loadBatch();
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || "Re-parse failed";
      setError(message);
    } finally {
      setBusy(null);
    }
  }

  async function resetFailedUnknown() {
    setError(null);
    setBusy("reset");
    try {
      // Ensure any existing puppeteer job is closed so start() relaunches the MSBTE flow.
      try {
        await api.post(`/batches/${batchId}/fetch/stop`);
      } catch {
        // ignore
      }

      await api.post(`/batches/${batchId}/reset`, { includeUnknown: true });
      await loadBatch();

      // Restart fetch flow so reset records actually get re-fetched.
      const res = await api.post(`/batches/${batchId}/fetch/start`);
      setState(res.data.state);
      await Promise.all([loadBatch(), loadState(), loadAnalytics()]);
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || "Reset failed";
      setError(message);
    } finally {
      setBusy(null);
    }
  }

  async function downloadExcel() {
    setError(null);
    setBusy("download");
    try {
      const res = await api.get(`/batches/${batchId}/export.xlsx`, { responseType: "blob" });
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `msbte_batch_${batchId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || "Download failed";
      setError(message);
    } finally {
      setBusy(null);
    }
  }

  async function loadState() {
    try {
      const res = await api.get(`/batches/${batchId}/fetch/status`);
      setState(res.data.state);
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      throw err;
    }
  }

  async function loadCaptcha(opts?: { refresh?: boolean }) {
    setCaptchaError(null);
    try {
      const res = await api.get(`/batches/${batchId}/fetch/captcha`, {
        params: opts?.refresh ? { refresh: 1 } : undefined,
      });
      setCaptchaPngBase64(res.data.pngBase64 || null);
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || "Failed to load CAPTCHA";
      setCaptchaError(message);
      setCaptchaPngBase64(null);
    }
  }

  React.useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        if (!authLoading && user) {
          await Promise.all([loadBatch(), loadState()]);
        }
      } finally {
        setLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId, authLoading, user]);

  React.useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;
    let consecutive429 = 0;
    let tick = 0;

    const run = async () => {
      if (cancelled) return;

      const status = state?.status;
      const isActive = status && status !== "idle" && status !== "completed" && status !== "failed";

      // Poll state more frequently only while the fetch job is running.
      // Refresh full batch less often because it can be large.
      const baseDelayMs = isActive ? 3500 : 15000;
      const backoffMs = Math.min(consecutive429 * 5000, 30000);
      const delayMs = baseDelayMs + backoffMs;

      try {
        await loadState();
      } catch (err: any) {
        if (err?.response?.status === 429) {
          consecutive429++;
        }
      }

      // Refresh batch occasionally (and more often while active), but not every tick.
      tick++;
      const shouldRefreshBatch = isActive ? tick % 2 === 0 : tick % 4 === 0;
      if (shouldRefreshBatch) {
        try {
          await loadBatch();
          consecutive429 = 0;
        } catch (err: any) {
          if (err?.response?.status === 429) {
            consecutive429++;
          }
        }
      }

      if (!cancelled) {
        setTimeout(run, delayMs);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId, authLoading, user, state?.status]);

  React.useEffect(() => {
    if (authLoading || !user) return;
    loadAnalytics().catch(() => null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId, authLoading, user]);

  React.useEffect(() => {
    if (authLoading || !user) return;
    if (state?.status === "ready_for_captcha") {
      loadCaptcha({ refresh: true }).catch(() => null);
    } else {
      setCaptchaPngBase64(null);
      setCaptchaText("");
      setCaptchaError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.status, authLoading, user, batchId]);

  async function start() {
    setError(null);
    setBusy("start");
    try {
      const res = await api.post(`/batches/${batchId}/fetch/start`);
      setState(res.data.state);
      await loadBatch();
      setCaptchaText("");
      setCaptchaPngBase64(null);
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || "Failed to start";
      setError(message);
    } finally {
      setBusy(null);
    }
  }

  async function cont() {
    setError(null);
    setCaptchaError(null);
    setBusy("continue");
    try {
      const res = await api.post(`/batches/${batchId}/fetch/continue`, {
        captcha: captchaText,
      });
      setState(res.data.state);
      await loadBatch();
      if (res.data?.info === "captcha_empty") {
        setCaptchaError("Enter CAPTCHA to continue.");
      }
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || "Failed to continue";
      setError(message);
    } finally {
      setBusy(null);
    }
  }

  async function stop() {
    setError(null);
    setBusy("stop");
    try {
      await api.post(`/batches/${batchId}/fetch/stop`);
      await Promise.all([loadBatch(), loadState()]);
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || "Failed to stop";
      setError(message);
    } finally {
      setBusy(null);
    }
  }

  const doneCount = React.useMemo(() => {
    if (!batch) return 0;
    return batch.results.filter((r) => r.fetchedAt || r.errorMessage).length;
  }, [batch]);

  const filteredResults = React.useMemo(() => {
    const list = [...(batch?.results || [])];

    const q = query.trim().toLowerCase();
    const matchesQuery = (r: StudentResult) => {
      if (!q) return true;
      return (
        r.enrollmentNumber?.toLowerCase().includes(q) ||
        (r.marksheetEnrollmentNumber || "").toLowerCase().includes(q) ||
        (r.name || "").toLowerCase().includes(q) ||
        (r.seatNumber || "").toLowerCase().includes(q)
      );
    };

    const matchesStatus = (r: StudentResult) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "Error") return Boolean(r.errorMessage);
      return (r.resultStatus || "Unknown") === statusFilter;
    };

    const filtered = list.filter((r) => matchesQuery(r) && matchesStatus(r));

    filtered.sort((a, b) => {
      if (sortKey === "enrollment") {
        return String(a.enrollmentNumber).localeCompare(String(b.enrollmentNumber));
      }
      const ap = typeof a.percentage === "number" ? a.percentage : -1;
      const bp = typeof b.percentage === "number" ? b.percentage : -1;
      if (sortKey === "percentage_asc") return ap - bp;
      return bp - ap;
    });

    return filtered;
  }, [batch?.results, query, sortKey, statusFilter]);

  return (
    <Protected>
      <AppShell>
        <PageHeader
          title={
            <div className="flex items-center gap-6">
               <div className="h-16 w-16 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(var(--primary),0.2)] backdrop-blur-3xl group hover:scale-110 transition-all duration-700">
                <Database className="h-8 w-8" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-4xl text-foreground tracking-tight">Batch Details</span>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm" />
                  Live Extraction View
                </p>
              </div>
            </div>
          }
          subtitle={`Dataset ID: ${batchId}`}
          backHref="/results"
          actions={
            <div className="flex items-center gap-6">
               <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Extraction Status</span>
                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4,5,6,7].map(i => (
                      <div key={i} className={cn("h-1 w-3 rounded-full", i < 6 ? "bg-primary/40" : "bg-muted")} />
                    ))}
                  </div>
               </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshAll} 
                disabled={busy !== null}
                className="h-14 rounded-2xl px-8 font-bold uppercase tracking-widest text-[9px] border-border bg-white hover:bg-accent text-foreground transition-all shadow-sm group"
              >
                <RefreshCw className={cn("mr-3 h-4 w-4 text-primary group-hover:rotate-180 transition-transform duration-700", busy === "refresh" && "animate-spin")} />
                Refresh Data
              </Button>
              <Button 
                size="sm" 
                onClick={downloadExcel} 
                disabled={busy !== null}
                className="h-14 rounded-2xl px-10 font-bold uppercase tracking-widest text-[10px] bg-primary text-white hover:bg-primary/90 transition-all shadow-lg active:scale-95 group"
              >
                <Download className="mr-3 h-4 w-4" />
                {busy === "download" ? "Downloading..." : "Export Excel"}
              </Button>
            </div>
          }
        />

        <main className="mx-auto max-w-7xl px-8 py-16 lg:px-12 relative z-10">
          {loading ? (
            <div className="py-40 flex flex-col items-center justify-center gap-10">
               <div className="h-24 w-24 rounded-[2rem] border-2 border-primary/20 bg-primary/5 flex items-center justify-center relative">
                  <RefreshCw className="h-10 w-10 animate-spin text-primary" />
                  <div className="absolute inset-0 rounded-[2rem] border-2 border-primary animate-ping opacity-20" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 animate-pulse">Reconstructing Node Data Trajectory...</p>
            </div>
          ) : (
            <div className="grid gap-12">
              {(isSubmitting || isJobActive) && (
                <FadeIn>
                  <div className="relative overflow-hidden rounded-[3rem] border border-border bg-white p-12 shadow-xl group">
                    <div className="absolute top-[-10%] right-[-10%] h-[20rem] w-[20rem] bg-primary/5 blur-[80px] pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-10 relative z-10">
                      <div className="flex items-center gap-8">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg group-hover:rotate-6 transition-transform duration-500">
                          <Zap className={cn("h-8 w-8", (isSubmitting || isJobActive) && "animate-pulse")} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-2xl font-display font-black text-foreground tracking-tight">
                            {isSubmitting ? "Starting Extraction..." : "Extraction in Progress"}
                          </h3>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Communicating with MSBTE Servers</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-5xl font-display font-black text-primary tabular-nums tracking-tighter leading-none">
                          {Math.round((doneCount / (batch?.totalStudents || 1)) * 100)}%
                        </span>
                        <div className="mt-4 flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                           <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                           <span>
                            {doneCount} / {batch?.totalStudents || 0} Students Processed
                           </span>
                        </div>
                      </div>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-accent border border-border p-[1px] relative z-10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((doneCount / (batch?.totalStudents || 1)) * 100)}%` }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-primary shadow-[0_0_20px_rgba(var(--primary),0.4)]"
                      />
                    </div>
                  </div>
                </FadeIn>
              )}

              {error && (
                <FadeIn>
                  <div className="p-8 rounded-2xl border border-rose-100 bg-rose-50 text-rose-600 font-bold uppercase tracking-widest text-[11px] flex items-center gap-6 shadow-md">
                    <div className="h-12 w-12 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                       <p className="opacity-60 mb-1">System Error</p>
                       <p className="text-foreground">{error}</p>
                    </div>
                  </div>
                </FadeIn>
              )}

              <div className="grid gap-12 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-border shadow-2xl rounded-[3rem] bg-white overflow-hidden group">
                  <CardHeader className="border-b border-border bg-accent/30 px-10 py-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                         <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                          <Terminal className="h-6 w-6" />
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="text-xl font-display font-black text-foreground tracking-tight">Extraction Management</h3>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Manage automation and data integrity</p>
                        </div>
                      </div>
                      <div className="h-8 px-4 rounded-lg border border-border bg-white flex items-center gap-2">
                         <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Connected</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10">
                    <div className="grid gap-10 md:grid-cols-2">
                       <div className="space-y-8">
                        <div className="p-8 rounded-3xl border border-border bg-accent/20 shadow-sm relative overflow-hidden group/status-card">
                          <div className="relative z-10">
                            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-6 flex items-center gap-3">
                              <Activity className="h-4 w-4 text-primary" />
                              Process Status
                            </div>
                            <div className="flex items-center gap-5">
                              <div className={cn(
                                "h-4 w-4 rounded-full shadow-sm",
                                state?.status === "completed" ? "bg-emerald-500" : 
                                state?.status === "failed" ? "bg-rose-500" : 
                                state?.status === "ready_for_captcha" ? "bg-amber-500 animate-pulse" :
                                "bg-primary animate-pulse"
                              )} />
                              <span className="text-xl font-display font-black text-foreground uppercase tracking-wider leading-none">{state?.status?.replace(/_/g, " ") || "Idle"}</span>
                            </div>
                            {state?.currentEnrollment && (
                              <div className="mt-8 flex items-center gap-4 text-[10px] font-bold text-muted-foreground px-5 py-3 rounded-xl bg-white border border-border">
                                <Search className="h-4 w-4 text-primary opacity-50" />
                                <span className="uppercase tracking-widest opacity-60">Scanning:</span>
                                <span className="text-foreground font-mono">{state.currentEnrollment}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button 
                            onClick={start} 
                            disabled={busy !== null || isJobActive}
                            size="lg"
                            className="h-16 rounded-2xl font-bold uppercase tracking-widest text-[11px] px-8 bg-primary text-white hover:bg-primary/90 transition-all shadow-lg hover:-translate-y-0.5 active:scale-95 group flex-1"
                          >
                            <Play className="mr-3 h-4 w-4 fill-current" />
                            {busy === "start" ? "Starting..." : "Start Extraction"}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={stop} 
                            disabled={busy !== null || !isJobActive}
                            size="lg"
                            className="h-16 rounded-2xl font-bold uppercase tracking-widest text-[11px] px-8 border-border bg-white text-rose-600 hover:bg-rose-50 transition-all active:scale-95"
                          >
                            <Square className="mr-3 h-4 w-4 fill-current" />
                            Stop
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="p-8 rounded-3xl border border-border bg-accent/20 shadow-sm relative overflow-hidden group/persist">
                          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-6 flex items-center gap-3">
                            <History className="h-4 w-4 text-primary" />
                            History Actions
                          </div>
                          <div className="flex flex-col gap-3">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={reparse} 
                              disabled={busy !== null} 
                              className="rounded-xl h-12 px-6 text-[10px] font-bold uppercase tracking-widest justify-start hover:bg-white text-muted-foreground hover:text-primary transition-all border border-transparent hover:border-border group/btn"
                            >
                              <div className="h-7 w-7 rounded-lg bg-primary/5 flex items-center justify-center mr-4 group-hover/btn:bg-primary/10 transition-colors">
                                <RotateCcw className={cn("h-4 w-4 transition-transform group-hover/btn:rotate-180 duration-500", busy === "reparse" && "animate-spin")} />
                              </div>
                              Reparse Results
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={resetFailedUnknown} 
                              disabled={busy !== null} 
                              className="rounded-xl h-12 px-6 text-[10px] font-bold uppercase tracking-widest justify-start hover:bg-white text-muted-foreground hover:text-primary transition-all border border-transparent hover:border-border group/btn"
                            >
                               <div className="h-7 w-7 rounded-lg bg-primary/5 flex items-center justify-center mr-4 group-hover/btn:bg-primary/10 transition-colors">
                                <RefreshCw className={cn("h-4 w-4 transition-transform group-hover/btn:rotate-180 duration-500", busy === "reset" && "animate-spin")} />
                              </div>
                              Retry Failed Students
                            </Button>
                          </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-5">
                           <IdCard className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                           <div className="space-y-1">
                              <h6 className="text-[11px] font-black uppercase tracking-widest text-primary">Teacher Directives</h6>
                              <p className="text-[11px] text-muted-foreground leading-relaxed font-bold">Only restart the extraction if you notice missing student percentages or seat numbers.</p>
                           </div>
                        </div>
                      </div>
                    </div>

                    {state?.status === "ready_for_captcha" && (
                      <FadeIn className="mt-12 pt-12 border-t border-border">
                        <div className="rounded-[3rem] border border-primary/20 bg-primary/5 p-12 shadow-inner relative overflow-hidden group/captcha">
                          <div className="flex flex-col lg:flex-row gap-16 items-center relative z-10">
                            <div className="flex-1 space-y-8">
                              <div className="flex items-center gap-6">
                                 <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-md">
                                  <Lock className="h-8 w-8 text-primary" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-2xl font-display font-black text-foreground tracking-tight uppercase">CAPTCHA Verification</h4>
                                  <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed max-w-lg">
                                    Manual verification required to bypass security checks and continue.
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="relative flex-1 w-full">
                                  <input
                                    value={captchaText}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCaptchaText(e.target.value)}
                                    placeholder="Enter CAPTCHA Code..."
                                    className="h-16 w-full rounded-xl border border-border bg-white px-8 text-lg font-black tracking-widest uppercase focus:outline-none focus:ring-4 focus:ring-primary/10 shadow-sm transition-all text-foreground"
                                    autoFocus
                                  />
                                </div>
                                <Button 
                                  onClick={cont} 
                                  disabled={busy !== null || !captchaText.trim()}
                                  className="h-16 w-full sm:w-auto rounded-xl px-12 font-bold uppercase tracking-widest text-[12px] bg-primary text-white hover:bg-primary/90 shadow-lg transition-all active:scale-95"
                                >
                                  Submit Code
                                  <ChevronRight className="ml-3 h-4 w-4" />
                                </Button>
                              </div>
                              {captchaError && (
                                <FadeIn>
                                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5" />
                                    {captchaError}
                                  </div>
                                </FadeIn>
                              )}
                            </div>

                            <div className="shrink-0 relative">
                                {captchaPngBase64 ? (
                                  <div className="relative p-6 bg-white rounded-3xl border border-border shadow-md">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      alt="captcha"
                                      src={`data:image/png;base64,${captchaPngBase64}`}
                                      className="h-20 w-auto rounded-lg select-none"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-32 w-64 bg-accent/50 animate-pulse rounded-3xl flex flex-col items-center justify-center gap-3 border border-border">
                                    <RefreshCw className="h-6 w-6 text-primary opacity-20 animate-spin" />
                                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Loading CAPTCHA...</p>
                                  </div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => loadCaptcha({ refresh: true })}
                                  disabled={busy !== null}
                                  className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-white text-foreground border border-border shadow-lg hover:bg-accent transition-all active:scale-90"
                                >
                                  <RefreshCw className={cn("h-5 w-5", busy === "refresh" && "animate-spin")} />
                                </Button>
                            </div>
                          </div>
                        </div>
                      </FadeIn>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border shadow-2xl rounded-[3rem] bg-white overflow-hidden h-full group">
                  <CardHeader className="border-b border-border bg-accent/30 px-10 py-8">
                    <div className="flex items-center gap-6">
                       <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                        <BarChart3 className="h-6 w-6" />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-xl font-display font-black text-foreground tracking-tight">Batch Statistics</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Real-time performance metrics</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10">
                    {loadingAnalytics ? (
                      <div className="space-y-8">
                        {[1, 2, 3].map(i => <div key={i} className="h-28 bg-accent/20 border border-border animate-pulse rounded-[2rem]" />)}
                      </div>
                    ) : !analytics ? (
                      <div className="py-20 text-center flex flex-col items-center justify-center gap-8 opacity-40">
                         <div className="h-20 w-20 rounded-[2rem] border border-border flex items-center justify-center">
                           <Box className="h-10 w-10 text-muted-foreground" />
                         </div>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Calculating Statistics...</p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <StatCard
                          tone="indigo"
                          label="Pass Rate"
                          value={`${analytics.totals.passRate}%`}
                          hint="Overall success percentage"
                          className="p-8 rounded-[2.5rem] border-border bg-accent/10 shadow-sm"
                        />
                        <StatCard
                          tone="red"
                          label="KT Count"
                          value={analytics.totals.totalKTs}
                          hint="Students with failed subjects"
                          className="p-8 rounded-[2.5rem] border-border bg-accent/10 shadow-sm"
                        />
                        <div className="pt-10 mt-6 border-t border-border">
                          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-8 px-2 flex items-center gap-3">
                             <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                             Class Distribution
                          </div>
                          <div className="space-y-3">
                            {analytics.classDistribution.slice(0, 4).map((it) => (
                              <div key={it.label} className="flex items-center justify-between p-5 px-8 rounded-2xl bg-accent/10 border border-border hover:bg-white hover:shadow-md transition-all group/cluster">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground">{it.label}</span>
                                <div className="flex items-center gap-4">
                                  <span className="text-xl font-display font-black text-foreground group-hover:text-primary transition-colors">{it.value}</span>
                                  <span className="text-[9px] text-primary/60 font-black tracking-widest uppercase">Students</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {analytics && analytics.topper.name && (
                <FadeIn delay={0.4} className="mt-12">
                   <Card className="border-border shadow-2xl rounded-[3rem] overflow-hidden bg-primary text-white relative group">
                    <div className="absolute top-[-20%] right-[-10%] h-[30rem] w-[30rem] rounded-full bg-white/10 blur-[100px] transition-all duration-700" />
                    
                    <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/10">
                      <div className="lg:w-1/3 p-10 relative z-10 flex flex-col justify-center border-b lg:border-b-0 border-white/10">
                        <div className="flex items-center gap-5 mb-8">
                           <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                            <Trophy className="h-6 w-6 text-amber-300 group-hover:scale-110 transition-transform duration-700" />
                          </div>
                          <div className="space-y-0.5">
                            <h3 className="text-xl font-display font-black text-white tracking-tight leading-none">Top Performer</h3>
                            <p className="text-[9px] uppercase font-bold tracking-widest text-white/60">Academic Excellence</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                          <div className="h-24 w-24 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-8 ring-1 ring-white/20 relative shadow-xl">
                             <Sparkles className="h-12 w-12 text-white" />
                          </div>
                          
                          <div className="space-y-4 w-full">
                             <h4 className="text-3xl font-display font-black text-white tracking-tight leading-tight">{analytics.topper.name}</h4>
                             <div className="inline-flex items-center px-6 py-2.5 rounded-xl bg-white text-primary text-[11px] font-black uppercase tracking-widest shadow-lg">
                              {analytics.topper.percentage}% Percentage
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="lg:w-2/3 p-10 relative z-10">
                         <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 h-full">
                            <div className="space-y-6 flex flex-col justify-center">
                               <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col">
                                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-2 leading-none">Enrollment No.</p>
                                  <p className="text-lg font-display font-black text-white tracking-tight">{analytics.topper.enrollmentNumber || "-"}</p>
                               </div>
                               <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col">
                                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-2 leading-none">Seat Number</p>
                                  <p className="text-lg font-display font-black text-white tracking-tight">{analytics.topper.seatNumber || "-"}</p>
                               </div>
                            </div>

                            <div className="lg:col-span-1 flex flex-col justify-center space-y-8 border-white/10 lg:border-l lg:pl-8">
                               <div className="space-y-4">
                                  <h5 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Status Verification</h5>
                                  <div className="space-y-3">
                                     {['Data Quality: Accurate', 'Verification: Complete', 'Performance: Excellent'].map(it => (
                                       <div key={it} className="flex items-center gap-3">
                                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                          <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">{it}</span>
                                       </div>
                                     ))}
                                  </div>
                                </div>

                                <div className="pt-8 border-t border-white/10 flex items-center justify-between">
                                  <div className="flex flex-col">
                                     <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Batch Rank</span>
                                     <span className="text-[11px] font-black text-emerald-300 tracking-widest uppercase">Rank 01 / {analytics.totals.totalStudents}</span>
                                  </div>
                                  <Link href={`/results/${batchId}/students/${analytics.topper.enrollmentNumber}`}>
                                    <Button variant="ghost" className="h-12 bg-white/10 text-white hover:bg-white/20 rounded-xl px-6 gap-3 font-bold text-[10px] uppercase tracking-widest transition-all">
                                        View Profile
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                </div>
                            </div>
                            
                            <div className="hidden lg:flex flex-col items-center justify-center p-8 bg-white/5 border border-white/10 rounded-3xl shadow-inner relative overflow-hidden group/viz">
                               <div className="h-24 w-24 rounded-full border-4 border-white/10 border-t-white animate-spin duration-3000 relative flex items-center justify-center">
                                  <div className="h-16 w-16 rounded-full border-4 border-white/20 border-b-white animate-spin reverse duration-2000 flex items-center justify-center">
                                     <Activity className="h-6 w-6 text-white opacity-40" />
                                  </div>
                               </div>
                               <p className="mt-6 text-[8px] font-bold text-white/40 uppercase tracking-[0.3em] text-center">Advanced Data Processing</p>
                            </div>
                         </div>
                      </div>
                    </div>
                  </Card>
                </FadeIn>
              )}

              <Card className="border-border shadow-2xl rounded-[3rem] bg-white overflow-hidden mt-12">
                <CardHeader className="border-b border-border bg-accent/30 px-10 py-8 group/header">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                       <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm group-hover/header:rotate-6 transition-transform duration-500">
                        <FileSearch className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-display font-black text-foreground tracking-tight">Student Results</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Comprehensive list of processed student data</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="hidden lg:flex flex-col items-end">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Data Quality</span>
                        <div className="h-1.5 w-32 bg-accent rounded-full mt-2 overflow-hidden border border-border">
                           <div className="h-full w-full bg-emerald-500/40" />
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="rounded-xl h-12 px-6 font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all border border-transparent hover:border-primary/20 active:scale-95">
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-10 bg-accent/10 border-b border-border relative">
                    <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-6 items-end">
                      <div className="md:col-span-2 lg:col-span-3 relative group/input">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2 mb-3 block">Search Student</label>
                        <Search className="absolute left-6 bottom-5 h-5 w-5 text-muted-foreground group-focus-within/input:text-primary transition-colors z-10" />
                        <input
                          value={query}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                          placeholder="Search enrollment or seat number..."
                          className="w-full h-16 pl-16 pr-6 rounded-2xl border border-border bg-white text-sm font-bold uppercase tracking-widest placeholder:text-muted-foreground/40 text-foreground focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                        />
                      </div>
                      <div className="relative group/filter">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2 mb-3 block">Status</label>
                        <select
                          value={statusFilter}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as any)}
                          className="w-full h-16 rounded-2xl border border-border bg-white px-8 text-[11px] font-bold uppercase tracking-widest text-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/5 shadow-sm cursor-pointer appearance-none transition-all hover:border-primary/20"
                        >
                          <option value="all">All Results</option>
                          <option value="Pass">Pass</option>
                          <option value="Fail">Fail</option>
                          <option value="Unknown">Unknown</option>
                          <option value="Error">Faulty</option>
                        </select>
                        <ChevronDown className="absolute right-8 bottom-6 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                      <div className="relative group/sort md:col-span-1 lg:col-span-2">
                         <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2 mb-3 block">Sort By</label>
                        <select
                          value={sortKey}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortKey(e.target.value as any)}
                          className="w-full h-16 rounded-2xl border border-border bg-white px-8 text-[11px] font-bold uppercase tracking-widest text-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/5 shadow-sm cursor-pointer appearance-none transition-all hover:border-primary/20"
                        >
                          <option value="enrollment">Enrollment Number</option>
                          <option value="percentage_desc" className="bg-slate-900">Yield: High → Low</option>
                          <option value="percentage_asc" className="bg-slate-900">Yield: Low → High</option>
                        </select>
                        <ChevronDown className="absolute right-8 bottom-6 h-4 w-4 text-white/20 pointer-events-none group-hover/sort:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>


                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-white/[0.01] border-b border-white/5">
                          <th className="px-10 py-6 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Validated Identity</th>
                          <th className="px-10 py-6 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Percentage</th>
                          <th className="px-10 py-6 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Result Status</th>
                          <th className="px-10 py-6 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Date Fetched</th>
                          <th className="px-10 py-6 text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredResults.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-40 text-center">
                              <div className="flex flex-col items-center gap-6">
                                <div className="h-20 w-20 rounded-[2rem] bg-accent/50 flex items-center justify-center border border-border text-primary/20 shadow-inner">
                                  <Search className="h-10 w-10" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xl font-display font-black text-foreground">No student results found</p>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Try adjusting your search or filters</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {filteredResults.length > 0 && (
                        <FadeInStagger as="tbody" className="divide-y divide-border">
                            {filteredResults.map((r) => {
                              const isOpen = expanded === r.enrollmentNumber;
                              const showPercent =
                                typeof r.percentage === "number"
                                  ? `${r.percentage}%`
                                  : r.resultClass === "KT"
                                    ? "KT"
                                    : "0%";

                              return (
                                <FadeInStaggerItem key={r.enrollmentNumber} as="tr" className={cn(
                                  "group border-t border-border transition-all duration-500",
                                  isOpen ? "bg-primary/[0.03]" : "hover:bg-accent/10"
                                )}>
                                    <td className="px-10 py-8">
                                      <div className="flex items-center gap-6">
                                        <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center font-display font-black text-muted-foreground shrink-0 tabular-nums text-xs group-hover:bg-primary/10 group-hover:text-primary transition-all border border-border group-hover:border-primary/20">
                                          {r.enrollmentNumber.slice(-3)}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="font-display font-black text-foreground text-lg group-hover:text-primary transition-colors tracking-tight">
                                            {r.name || "Awaiting Result Data..."}
                                          </div>
                                          <div className="flex items-center gap-4 mt-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            <span>Seat: {r.enrollmentNumber}</span>
                                            <div className="w-1 h-1 rounded-full bg-border" />
                                            <span className="opacity-60">EN: {r.marksheetEnrollmentNumber || "N/A"}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-10 py-8">
                                      <div className="font-display font-black text-2xl text-foreground tracking-tighter">{showPercent}</div>
                                      <div className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest mt-0.5">{r.resultClass || "Processing..."}</div>
                                    </td>
                                    <td className="px-10 py-8">
                                      {(() => {
                                        const label = r.errorMessage ? "Error" : r.resultStatus || "Unknown";
                                        return (
                                          <span className={cn(
                                            "inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all",
                                            label === "Pass" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            label === "Fail" ? "bg-rose-50 text-rose-600 border-rose-100" :
                                            label === "Error" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                            "bg-accent text-muted-foreground border-border"
                                          )}>
                                            <div className={cn(
                                              "h-1.5 w-1.5 rounded-full mr-2",
                                              label === "Pass" ? "bg-emerald-500" :
                                              label === "Fail" ? "bg-rose-500" :
                                              label === "Error" ? "bg-amber-500" : "bg-muted-foreground"
                                            )} />
                                            {label}
                                          </span>
                                        );
                                      })()}
                                    </td>
                                    <td className="px-10 py-8 text-[10px] font-bold text-muted-foreground uppercase tracking-widest tabular-nums">
                                      {r.fetchedAt ? (
                                        <div className="flex flex-col gap-0.5">
                                          <span className="text-foreground/60">{new Date(r.fetchedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                          <span>{new Date(r.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                      ) : "Queueing..."}
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                      <div className="flex items-center justify-end gap-3">
                                        <Link href={`/results/${batchId}/students/${encodeURIComponent(r.enrollmentNumber)}`}>
                                          <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl border border-border bg-white text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all active:scale-95">
                                            <IdCard className="h-5 w-5" />
                                          </Button>
                                        </Link>
                                        <Button
                                          variant={isOpen ? "primary" : "outline"}
                                          size="sm"
                                          onClick={() =>
                                            setExpanded((cur) => (cur === r.enrollmentNumber ? null : r.enrollmentNumber))
                                          }
                                          disabled={!r.subjectMarks}
                                          className={cn(
                                            "h-11 rounded-xl px-6 font-bold text-[9px] uppercase tracking-widest active:scale-95 transition-all",
                                            isOpen ? "bg-primary text-white border-transparent" : "bg-white border-border text-foreground hover:bg-accent"
                                          )}
                                        >
                                          {isOpen ? "Collapse" : "Quick View"}
                                        </Button>
                                      </div>
                                    </td>
                                </FadeInStaggerItem>
                              );
                            })}
                        </FadeInStagger>
                      )}
                    </table>
                  </div>

                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden bg-accent/10 border-t border-border"
                      >
                         <div className="p-10">
                            {(() => {
                               const r = batch?.results.find(x => x.enrollmentNumber === expanded);
                               if (!r) return null;
                               const subjects = r.subjectMarks ? Object.entries(r.subjectMarks) : [];
                               return (
                                  <div className="rounded-[2.5rem] border border-border bg-white shadow-xl overflow-hidden">
                                     <div className="flex items-center justify-between p-10 border-b border-border bg-accent/20">
                                        <div>
                                          <div className="flex items-center gap-3 mb-3">
                                            <Activity className="h-4 w-4 text-primary" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subject Analysis</span>
                                          </div>
                                          <h4 className="text-2xl font-display font-black text-foreground tracking-tight">Performance Overview: {r.name}</h4>
                                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Subject-wise Marks Distribution</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Score</p>
                                          <p className="text-4xl font-display font-black text-primary tracking-tighter tabular-nums leading-none">{r.percentage}%</p>
                                        </div>
                                      </div>

                                      <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                          <thead>
                                            <tr className="bg-accent/5 border-b border-border">
                                              <th className="px-10 py-5 font-bold text-muted-foreground uppercase tracking-widest text-[9px]">Subject Name</th>
                                              <th className="px-10 py-5 font-bold text-muted-foreground uppercase tracking-widest text-[9px]">Total Marks</th>
                                              <th className="px-10 py-5 font-bold text-muted-foreground uppercase tracking-widest text-[9px]">Int. (FA)</th>
                                              <th className="px-10 py-5 font-bold text-muted-foreground uppercase tracking-widest text-[9px]">Ext. (SA)</th>
                                              <th className="px-10 py-5 font-bold text-muted-foreground uppercase tracking-widest text-[9px]">SLA Marks</th>
                                              <th className="px-10 py-5 font-bold text-muted-foreground uppercase tracking-widest text-[9px] text-right">Credits</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-border">
                                            {subjects.map(([sub, m]) => (
                                              <tr key={sub} className="hover:bg-accent/5 transition-all group/row">
                                                <td className="px-10 py-6">
                                                  <div className="font-bold text-foreground text-sm group-hover/row:text-primary transition-colors uppercase tracking-widest">{sub}</div>
                                                </td>
                                                <td className="px-10 py-6">
                                                  <div className="flex items-center gap-3">
                                                    <span className="font-display font-black text-foreground text-base">{m.totalObt ?? "0"}</span>
                                                    <span className="text-muted-foreground/30">/</span>
                                                    <span className="text-muted-foreground/60 font-bold text-[10px]">{m.totalMax ?? "0"}</span>
                                                  </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                  <div className="space-y-1.5 font-mono text-[10px] text-muted-foreground">
                                                    <p className="font-bold uppercase tracking-widest">TH: <span className="text-indigo-600">{m.faThObt ?? "0"}</span>/{m.faThMax ?? "0"}</p>
                                                    <p className="font-bold uppercase tracking-widest">PR: <span className="text-indigo-600">{m.faPrObt ?? "0"}</span>/{m.faPrMax ?? "0"}</p>
                                                  </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                  <div className="space-y-1.5 font-mono text-[10px] text-muted-foreground">
                                                    <p className="font-bold uppercase tracking-widest">TH: <span className="text-primary">{m.saThObt ?? "0"}</span>/{m.saThMax ?? "0"}</p>
                                                    <p className="font-bold uppercase tracking-widest">PR: <span className="text-primary">{m.saPrObt ?? "0"}</span>/{m.saPrMax ?? "0"}</p>
                                                  </div>
                                                </td>
                                                <td className="px-10 py-6 text-muted-foreground/60 font-bold tracking-widest tabular-nums text-[10px]">
                                                  {m.slaObt ?? "0"}<span className="text-muted-foreground/20 mx-2">/</span>{m.slaMax ?? "0"}
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                  <div className="inline-flex h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 items-center justify-center font-black text-primary shadow-sm text-[10px]">
                                                    {m.credits ?? "0"}
                                                  </div>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                  </div>
                               );
                            })()}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </AppShell>
    </Protected>
  );
}
