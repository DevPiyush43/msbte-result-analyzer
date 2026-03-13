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
            <div className="flex items-center gap-5">
               <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm backdrop-blur-3xl group hover:scale-105 transition-all duration-500">
                <Database className="h-7 w-7" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-2xl text-slate-900 tracking-tight">Batch Details</span>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm" />
                  Live Extraction View
                </p>
              </div>
            </div>
          }
          subtitle={`Dataset ID: ${batchId}`}
          backHref="/results"
          actions={
            <div className="flex items-center gap-4">
               <div className="hidden md:flex flex-col items-end">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Extraction Phase</span>
                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4,5,6,7].map(i => (
                      <div key={i} className={cn("h-1 w-2.5 rounded-full", i < 6 ? "bg-primary/40" : "bg-slate-200")} />
                    ))}
                  </div>
               </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshAll} 
                disabled={busy !== null}
                className="h-11 rounded-xl px-6 font-bold uppercase tracking-widest text-[9px] border-slate-200 bg-white hover:bg-slate-50 text-slate-900 transition-all shadow-sm group"
              >
                <RefreshCw className={cn("mr-2 h-3.5 w-3.5 text-primary group-hover:rotate-180 transition-transform duration-700", busy === "refresh" && "animate-spin")} />
                Refresh
              </Button>
              <Button 
                size="sm" 
                onClick={downloadExcel} 
                disabled={busy !== null}
                className="h-11 rounded-xl px-8 font-bold uppercase tracking-widest text-[10px] bg-primary text-white hover:bg-primary/90 transition-all shadow-md active:scale-95 group"
              >
                <Download className="mr-2 h-4 w-4" />
                {busy === "download" ? "Downloading..." : "Export"}
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
                  <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg group">
                    <div className="absolute top-[-10%] right-[-10%] h-[15rem] w-[15rem] bg-primary/5 blur-[60px] pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8 relative z-10">
                      <div className="flex items-center gap-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-md group-hover:scale-105 transition-transform duration-500">
                          <Zap className={cn("h-7 w-7", (isSubmitting || isJobActive) && "animate-pulse")} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">
                            {isSubmitting ? "Initiating Extraction" : "Extraction Protocol Active"}
                          </h3>
                          <p className="text-[9px] uppercase font-bold tracking-widest text-slate-500">Synchronizing with institutional databases</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-4xl font-display font-black text-primary tabular-nums tracking-tighter leading-none">
                          {Math.round((doneCount / (batch?.totalStudents || 1)) * 100)}%
                        </span>
                        <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-slate-100">
                           <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                           <span>
                            {doneCount} / {batch?.totalStudents || 0} Students Synchronized
                           </span>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-50 border border-slate-200 relative z-10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((doneCount / (batch?.totalStudents || 1)) * 100)}%` }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-primary"
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
                <Card className="lg:col-span-2 border-slate-200 shadow-xl rounded-[2rem] bg-white overflow-hidden group">
                  <CardHeader className="border-b border-slate-200 bg-slate-50/30 px-8 py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                         <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-500 text-slate-900 font-bold">
                          <Terminal className="h-5 w-5" />
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="text-lg font-display font-black text-slate-900 tracking-tight">Access Control</h3>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Manage institutional automation flow</p>
                        </div>
                      </div>
                      <div className="h-7 px-3 rounded-lg border border-slate-200 bg-white flex items-center gap-2">
                         <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Sync Active</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid gap-8 md:grid-cols-2">
                       <div className="space-y-6">
                        <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/20 shadow-sm relative overflow-hidden group/status-card">
                          <div className="relative z-10">
                            <div className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-4 flex items-center gap-2">
                              <Activity className="h-3.5 w-3.5 text-primary" />
                              Synchronizer status
                            </div>
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "h-3.5 w-3.5 rounded-full shadow-sm",
                                state?.status === "completed" ? "bg-emerald-500" : 
                                state?.status === "failed" ? "bg-rose-500" : 
                                state?.status === "ready_for_captcha" ? "bg-amber-500 animate-pulse" :
                                "bg-primary animate-pulse"
                              )} />
                              <span className="text-lg font-display font-black text-slate-900 uppercase tracking-widest leading-none">{state?.status?.replace(/_/g, " ") || "Idle"}</span>
                            </div>
                            {state?.currentEnrollment && (
                              <div className="mt-6 flex items-center gap-3 text-[9px] font-bold text-slate-500 px-4 py-2.5 rounded-xl bg-white border border-slate-200">
                                <Search className="h-3.5 w-3.5 text-primary opacity-50" />
                                <span className="uppercase tracking-widest opacity-60">Tracing:</span>
                                <span className="text-slate-900 font-mono">{state.currentEnrollment}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button 
                            onClick={start} 
                            disabled={busy !== null || isJobActive}
                            size="lg"
                            className="h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] px-8 bg-primary text-white hover:bg-primary/90 transition-all shadow-md active:scale-95 group flex-1"
                          >
                            <Play className="mr-2 h-3.5 w-3.5 fill-current" />
                            {busy === "start" ? "Starting..." : "Start Protocol"}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={stop} 
                            disabled={busy !== null || !isJobActive}
                            size="lg"
                            className="h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] px-8 border-slate-200 bg-white text-rose-600 hover:bg-rose-50 transition-all active:scale-95"
                          >
                            <Square className="mr-2 h-3.5 w-3.5 fill-current" />
                            Emergency Halt
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/20 shadow-sm relative overflow-hidden group/persist">
                          <div className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-4 flex items-center gap-2">
                            <History className="h-3.5 w-3.5 text-primary" />
                            Administrative tasks
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={reparse} 
                              disabled={busy !== null} 
                              className="rounded-xl h-10 px-4 text-[9px] font-bold uppercase tracking-widest justify-start hover:bg-white text-slate-500 hover:text-primary transition-all border border-transparent hover:border-slate-200 group/btn"
                            >
                              <div className="h-6 w-6 rounded-lg bg-primary/5 flex items-center justify-center mr-3 group-hover/btn:bg-primary/10 transition-colors">
                                <RotateCcw className={cn("h-3.5 w-3.5 transition-transform group-hover/btn:rotate-180 duration-500", busy === "reparse" && "animate-spin")} />
                              </div>
                              Reparse dataset
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={resetFailedUnknown} 
                              disabled={busy !== null} 
                              className="rounded-xl h-10 px-4 text-[9px] font-bold uppercase tracking-widest justify-start hover:bg-white text-slate-500 hover:text-primary transition-all border border-transparent hover:border-slate-200 group/btn"
                            >
                               <div className="h-6 w-6 rounded-lg bg-primary/5 flex items-center justify-center mr-3 group-hover/btn:bg-primary/10 transition-colors">
                                <RefreshCw className={cn("h-3.5 w-3.5 transition-transform group-hover/btn:rotate-180 duration-500", busy === "reset" && "animate-spin")} />
                              </div>
                              Retry unverified profiles
                            </Button>
                          </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-indigo-50/30 border border-indigo-100 flex items-start gap-4">
                           <IdCard className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                           <div className="space-y-1">
                              <h6 className="text-[9px] font-black uppercase tracking-widest text-indigo-700">System Directives</h6>
                              <p className="text-[9px] text-slate-500 leading-relaxed font-bold">Protocol reset is only recommended if visual data patterns appear inconsistent.</p>
                           </div>
                        </div>
                      </div>
                    </div>

                    {state?.status === "ready_for_captcha" && (
                      <FadeIn className="mt-10 pt-10 border-t border-slate-200">
                        <div className="rounded-[2.5rem] border-2 border-primary bg-slate-50/30 p-10 shadow-inner relative overflow-hidden group/captcha">
                          <div className="flex flex-col lg:flex-row gap-12 items-center relative z-10">
                            <div className="flex-1 space-y-8 w-full">
                              <div className="flex items-center gap-6">
                                 <div className="h-16 w-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
                                  <Lock className="h-8 w-8" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-2xl font-display font-black text-slate-900 tracking-tight uppercase">Manual Verification</h4>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed max-w-sm">
                                    Bypass institutional security checks to resume automation.
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="relative flex-1 w-full">
                                  <input
                                    value={captchaText}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCaptchaText(e.target.value)}
                                    placeholder="Enter verification code..."
                                    className="h-20 w-full rounded-2xl border-2 border-slate-200 bg-white px-10 text-2xl font-display font-black tracking-[0.3em] uppercase focus:outline-none focus:ring-8 focus:ring-primary/5 shadow-xl transition-all text-slate-900 placeholder:text-slate-200 placeholder:tracking-normal placeholder:text-base placeholder:font-bold"
                                    autoFocus
                                  />
                                </div>
                                <Button 
                                  onClick={cont} 
                                  disabled={busy !== null || !captchaText.trim()}
                                  className="h-20 w-full sm:w-auto rounded-2xl px-12 font-black uppercase tracking-widest text-[12px] bg-primary text-white hover:bg-primary/90 shadow-2xl transition-all active:scale-95 group"
                                >
                                  Submit Authorization
                                  <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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

                            <div className="shrink-0 relative group/img-container">
                                {captchaPngBase64 ? (
                                  <div className="relative p-6 bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden min-w-[280px] flex items-center justify-center">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.05),transparent)] pointer-events-none" />
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      alt="captcha"
                                      src={`data:image/png;base64,${captchaPngBase64}`}
                                      className="h-28 w-auto rounded-lg select-none scale-125 saturate-150 contrast-125"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-40 w-72 bg-slate-100 animate-pulse rounded-[2.5rem] flex flex-col items-center justify-center gap-4 border border-slate-200">
                                    <RefreshCw className="h-8 w-8 text-primary opacity-20 animate-spin" />
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Awaiting Capture...</p>
                                  </div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => loadCaptcha({ refresh: true })}
                                  disabled={busy !== null}
                                  className="absolute -top-5 -right-5 h-14 w-14 rounded-full bg-white text-slate-900 border-2 border-slate-200 shadow-2xl hover:bg-slate-50 transition-all active:scale-90 z-20"
                                >
                                  <RefreshCw className={cn("h-6 w-6 text-primary", busy === "refresh" && "animate-spin")} />
                                </Button>
                            </div>
                          </div>
                        </div>
                      </FadeIn>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-xl rounded-[2rem] bg-white overflow-hidden h-full group">
                  <CardHeader className="border-b border-slate-200 bg-slate-50/30 px-8 py-6">
                    <div className="flex items-center gap-5">
                       <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-500">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-lg font-display font-black text-slate-900 tracking-tight">Batch Metrics</h3>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">Real-time institutional indices</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    {loadingAnalytics ? (
                      <div className="space-y-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50/50 border border-slate-100 animate-pulse rounded-2xl" />)}
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
                          value={<span className="text-slate-900">{analytics.totals.passRate}%</span>}
                          hint="Overall success percentage"
                          className="p-6 rounded-3xl border-slate-200 bg-slate-50/20 shadow-sm"
                        />
                        <StatCard
                          tone="red"
                          label="KT Count"
                          value={<span className="text-slate-900">{analytics.totals.totalKTs}</span>}
                          hint="Students with failed subjects"
                          className="p-6 rounded-3xl border-slate-200 bg-slate-50/20 shadow-sm"
                        />
                        <div className="pt-8 mt-4 border-t border-slate-200">
                          <div className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-6 px-2 flex items-center gap-2">
                             <div className="h-1 w-1 rounded-full bg-primary" />
                             Class Distribution
                          </div>
                          <div className="space-y-2">
                            {analytics.classDistribution.slice(0, 4).map((it) => (
                              <div key={it.label} className="flex items-center justify-between p-4 px-6 rounded-xl bg-slate-50/50 border border-slate-200 hover:bg-white hover:shadow-md transition-all group/cluster">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-900">{it.label}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-lg font-display font-black text-slate-900 group-hover:text-primary transition-colors">{it.value}</span>
                                  <span className="text-[8px] text-primary/60 font-black tracking-widest uppercase text-slate-900">Students</span>
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
                <FadeIn delay={0.4} className="mt-8">
                   <Card className="border-slate-200 shadow-xl rounded-3xl overflow-hidden bg-primary text-white relative group">
                    <div className="absolute top-[-20%] right-[-10%] h-[20rem] w-[20rem] rounded-full bg-white/10 blur-[80px] transition-all duration-700" />
                    
                    <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/10">
                      <div className="lg:w-1/3 p-8 relative z-10 flex flex-col justify-center border-b lg:border-b-0 border-white/10">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                            <Trophy className="h-5 w-5 text-amber-300 group-hover:scale-110 transition-transform duration-700" />
                          </div>
                          <div className="space-y-0.5">
                            <h3 className="text-lg font-display font-black text-white tracking-tight">Top Merit</h3>
                            <p className="text-[8px] uppercase font-bold tracking-widest text-white/60">Institutional Recognition</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                          <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 ring-1 ring-white/20 relative shadow-xl">
                             <Sparkles className="h-10 w-10 text-white" />
                          </div>
                          
                          <div className="space-y-3 w-full">
                             <h4 className="text-2xl font-display font-black text-white tracking-tight leading-tight uppercase">{analytics.topper.name}</h4>
                             <div className="inline-flex items-center px-5 py-2 rounded-lg bg-white text-primary text-[10px] font-black uppercase tracking-widest shadow-lg">
                              {analytics.topper.percentage}% Score
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="lg:w-2/3 p-8 relative z-10">
                         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 h-full">
                            <div className="space-y-4 flex flex-col justify-center">
                               <div className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col">
                                  <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1 shadow-sm">Identity Index</p>
                                  <p className="text-base font-display font-black text-white tracking-tight">{analytics.topper.enrollmentNumber || "-"}</p>
                               </div>
                               <div className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col">
                                  <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Seat Assignment</p>
                                  <p className="text-base font-display font-black text-white tracking-tight">{analytics.topper.seatNumber || "-"}</p>
                               </div>
                            </div>

                            <div className="lg:col-span-1 flex flex-col justify-center space-y-6 border-white/10 lg:border-l lg:pl-8">
                               <div className="space-y-3">
                                  <h5 className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Verification Status</h5>
                                  <div className="space-y-2">
                                     {['Data Integrity: Verified', 'Merit Rank: Confirmed'].map(it => (
                                       <div key={it} className="flex items-center gap-2">
                                          <div className="h-1 w-1 rounded-full bg-emerald-400" />
                                          <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest">{it}</span>
                                       </div>
                                     ))}
                                  </div>
                                </div>

                                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                                  <div className="flex flex-col">
                                     <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Global Rank</span>
                                     <span className="text-[10px] font-black text-emerald-300 tracking-widest uppercase">Rank 01</span>
                                  </div>
                                  <Link href={`/results/${batchId}/students/${analytics.topper.enrollmentNumber}`}>
                                    <Button variant="ghost" size="sm" className="h-10 bg-white/10 text-white hover:bg-white/20 rounded-lg px-4 gap-2 font-bold text-[9px] uppercase tracking-widest transition-all">
                                        View Identity
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </Button>
                                  </Link>
                                </div>
                            </div>
                            
                            <div className="hidden lg:flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group/viz">
                               <div className="h-16 w-16 rounded-full border-2 border-white/10 border-t-white animate-spin duration-3000 relative flex items-center justify-center">
                                  <div className="h-10 w-10 rounded-full border-2 border-white/20 border-b-white animate-spin reverse duration-2000 flex items-center justify-center">
                                     <Activity className="h-4 w-4 text-white opacity-40" />
                                  </div>
                               </div>
                               <p className="mt-4 text-[7px] font-bold text-white/40 uppercase tracking-[0.2em] text-center">Neural Engine Enabled</p>
                            </div>
                         </div>
                      </div>
                    </div>
                  </Card>
                </FadeIn>
              )}

              <Card className="border-slate-200 shadow-xl rounded-[2rem] bg-white overflow-hidden mt-8">
                <CardHeader className="border-b border-slate-200 bg-slate-50/30 px-8 py-6 group/header">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                       <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm group-hover/header:scale-105 transition-transform duration-500">
                        <FileSearch className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">Student Records</h3>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">Institutional dataset synchronization status</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="rounded-xl h-11 px-5 font-bold text-[9px] uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-primary/5 transition-all border border-transparent hover:border-primary/10 active:scale-95">
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-8 bg-slate-50/20 border-b border-slate-200 relative">
                    <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-6 items-end">
                      <div className="md:col-span-2 lg:col-span-3 relative group/input">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Search Identity</label>
                        <Search className="absolute left-5 bottom-4 h-4 w-4 text-slate-300 group-focus-within/input:text-primary transition-colors z-10" />
                        <input
                          value={query}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                          placeholder="Search enrollment number..."
                          className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-xs font-bold uppercase tracking-widest placeholder:text-slate-200 text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                        />
                      </div>
                      <div className="relative group/filter">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Filter</label>
                        <select
                          value={statusFilter}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as any)}
                          className="w-full h-12 rounded-xl border border-slate-200 bg-white px-6 text-[10px] font-bold uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-4 focus:ring-primary/5 shadow-sm cursor-pointer appearance-none transition-all hover:border-primary/20"
                        >
                          <option value="all">All Status</option>
                          <option value="Pass">Pass</option>
                          <option value="Fail">Fail</option>
                          <option value="Unknown">Unknown</option>
                          <option value="Error">Faulty</option>
                        </select>
                        <ChevronDown className="absolute right-6 bottom-4 h-3 w-3 text-slate-300 pointer-events-none" />
                      </div>
                      <div className="relative group/sort md:col-span-1 lg:col-span-2">
                         <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Sort Pattern</label>
                        <select
                          value={sortKey}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortKey(e.target.value as any)}
                          className="w-full h-12 rounded-xl border border-slate-200 bg-white px-6 text-[10px] font-bold uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-4 focus:ring-primary/5 shadow-sm cursor-pointer appearance-none transition-all hover:border-primary/20"
                        >
                          <option value="enrollment">Enrollment Sequence</option>
                          <option value="percentage_desc">Yield: Descending</option>
                          <option value="percentage_asc">Yield: Ascending</option>
                        </select>
                        <ChevronDown className="absolute right-6 bottom-4 h-3 w-3 text-slate-300 pointer-events-none group-hover/sort:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>


                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-8 py-4 text-[8px] font-black text-slate-400 uppercase tracking-widest">Student Identity</th>
                          <th className="px-8 py-4 text-[8px] font-black text-slate-400 uppercase tracking-widest">Performance</th>
                          <th className="px-8 py-4 text-[8px] font-black text-slate-400 uppercase tracking-widest">Verification Status</th>
                          <th className="px-8 py-4 text-[8px] font-black text-slate-400 uppercase tracking-widest">Sync Timestamp</th>
                          <th className="px-8 py-4 text-[8px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
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
                                  "group border-t border-slate-100 transition-all duration-300",
                                  isOpen ? "bg-primary/[0.03]" : "hover:bg-slate-50/50"
                                )}>
                                    <td className="px-8 py-5">
                                      <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center font-display font-black text-slate-400 shrink-0 tabular-nums text-[10px] group-hover:bg-primary/5 group-hover:text-primary transition-all border border-slate-200">
                                          {r.enrollmentNumber.slice(-3)}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="font-display font-black text-slate-900 text-sm group-hover:text-primary transition-colors tracking-tight uppercase">
                                            {r.name || "Awaiting synchronization..."}
                                          </div>
                                          <div className="flex items-center gap-3 mt-1 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                            <span>UID: {r.enrollmentNumber}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-8 py-5">
                                      <div className="font-display font-black text-lg text-slate-900 tracking-tighter tabular-nums">{showPercent}</div>
                                      <div className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">{r.resultClass || "Unknown"}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                      {(() => {
                                        const label = r.errorMessage ? "Error" : r.resultStatus || "Unknown";
                                        return (
                                          <span className={cn(
                                            "inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest border transition-all",
                                            String(label).toLowerCase() === "pass" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            String(label).toLowerCase() === "fail" ? "bg-rose-50 text-rose-600 border-rose-100" :
                                            String(label).toLowerCase() === "error" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                            "bg-slate-50 text-slate-400 border-slate-200"
                                          )}>
                                            <div className={cn(
                                              "h-1 w-1 rounded-full mr-1.5",
                                              String(label).toLowerCase() === "pass" ? "bg-emerald-500" :
                                              String(label).toLowerCase() === "fail" ? "bg-rose-500" :
                                              String(label).toLowerCase() === "error" ? "bg-amber-500" : "bg-slate-300"
                                            )} />
                                            {label}
                                          </span>
                                        );
                                      })()}
                                    </td>
                                    <td className="px-8 py-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest tabular-nums">
                                      {r.fetchedAt ? (
                                        <div className="flex flex-col gap-0.5">
                                          <span className="text-slate-600">{new Date(r.fetchedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                          <span>{new Date(r.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                      ) : "Queueing..."}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <Link href={`/results/${batchId}/students/${encodeURIComponent(r.enrollmentNumber)}`}>
                                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-primary hover:bg-primary/5 transition-all active:scale-95">
                                            <IdCard className="h-4 w-4" />
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
                                            "h-9 rounded-lg px-4 font-bold text-[8px] uppercase tracking-widest active:scale-95 transition-all",
                                            isOpen ? "bg-primary text-white border-transparent" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                          )}
                                        >
                                          {isOpen ? "Close" : "Focus"}
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
