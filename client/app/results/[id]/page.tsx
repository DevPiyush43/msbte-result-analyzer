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
                <span className="font-display font-black text-4xl text-white tracking-tight">Extraction Node</span>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mt-2 flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
                  Registry Segment Active
                </p>
              </div>
            </div>
          }
          subtitle={`Dataset Registry: ${batchId}`}
          backHref="/results"
          actions={
            <div className="flex items-center gap-6">
               <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Data Uplink</span>
                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4,5,6,7].map(i => (
                      <div key={i} className={cn("h-1 w-3 rounded-full", i < 6 ? "bg-primary/40" : "bg-white/5")} />
                    ))}
                  </div>
               </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshAll} 
                disabled={busy !== null}
                className="h-14 rounded-2xl px-8 font-black uppercase tracking-widest text-[9px] border-white/5 bg-white/[0.03] hover:bg-white/10 text-white transition-all shadow-xl backdrop-blur-xl group"
              >
                <RefreshCw className={cn("mr-3 h-4 w-4 text-primary group-hover:rotate-180 transition-transform duration-700", busy === "refresh" && "animate-spin")} />
                Sync Node
              </Button>
              <Button 
                size="sm" 
                onClick={downloadExcel} 
                disabled={busy !== null}
                className="h-14 rounded-2xl px-10 font-black uppercase tracking-widest text-[10px] bg-white text-black hover:bg-primary hover:text-white transition-all shadow-[0_20px_40px_rgba(255,255,255,0.05)] active:scale-95 group"
              >
                <Download className="mr-3 h-4 w-4 group-hover:-translate-y-1 transition-transform" />
                {busy === "download" ? "Pipelining..." : "Export Excel"}
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
                  <div className="relative overflow-hidden rounded-[3.5rem] border border-white/10 bg-white/[0.03] p-16 backdrop-blur-3xl shadow-2xl group">
                    <div className="absolute top-[-20%] right-[-10%] h-[30rem] w-[30rem] bg-primary/10 blur-[120px] pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-14 relative z-10">
                      <div className="flex items-center gap-8">
                        <div className="flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-primary/10 border border-primary/20 text-primary shadow-[0_0_30px_rgba(var(--primary),0.2)] group-hover:rotate-12 transition-transform duration-500">
                          <Zap className={cn("h-10 w-10", (isSubmitting || isJobActive) && "animate-pulse")} />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-3xl font-display font-black text-white tracking-tight leading-none">
                            {isSubmitting ? "Initialising Protocol..." : "Portal Automation Active"}
                          </h3>
                          <p className="text-[10px] uppercase font-black tracking-[0.4em] text-white/20 italic">Injecting heuristics into MSBTE verification layers</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-6xl font-display font-black text-primary tabular-nums tracking-tighter leading-none shadow-primary/20">
                          {Math.round((doneCount / (batch?.totalStudents || 1)) * 100)}%
                        </span>
                        <div className="mt-4 flex items-center gap-3 px-6 py-2 rounded-full bg-white/[0.03] border border-white/5">
                           <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                           <span className="text-[11px] font-black uppercase tracking-widest text-white/40">
                            {doneCount} <span className="text-primary">/</span> {batch?.totalStudents || 0} Nodes Resolved
                           </span>
                        </div>
                      </div>
                    </div>
                    <div className="h-4 w-full overflow-hidden rounded-full bg-white/[0.02] border border-white/5 p-[2px] relative z-10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((doneCount / (batch?.totalStudents || 1)) * 100)}%` }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-primary via-indigo-400 to-primary shadow-[0_0_40px_rgba(var(--primary),0.8)] relative overflow-hidden"
                      >
                         <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] translate-x-[-100%] animate-shimmer" />
                      </motion.div>
                    </div>
                  </div>
                </FadeIn>
              )}

              {error && (
                <FadeIn>
                  <div className="p-10 rounded-[2.5rem] border border-rose-500/20 bg-rose-500/5 text-rose-500 font-black uppercase tracking-widest text-[11px] flex items-center gap-6 shadow-2xl animate-shake">
                    <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shrink-0">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                       <p className="text-rose-500/60">System Fault Detected</p>
                       <p className="text-white/80">{error}</p>
                    </div>
                  </div>
                </FadeIn>
              )}

              <div className="grid gap-12 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-white/5 shadow-2xl rounded-[3.5rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden border-t-white/10 group">
                  <CardHeader className="border-b border-white/5 bg-white/[0.01] px-12 py-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                         <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                          <Terminal className="h-7 w-7 text-indigo-400" />
                        </div>
                        <div className="space-y-1.5">
                          <h3 className="text-2xl font-display font-black text-white tracking-tight">Control Interface</h3>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Manage automation directives and data persistence</p>
                        </div>
                      </div>
                      <div className="h-10 px-5 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-3">
                         <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Uplink: Primary</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-12">
                    <div className="grid gap-12 md:grid-cols-2">
                       <div className="space-y-10">
                        <div className="p-10 rounded-[3rem] border border-white/5 bg-white/[0.01] shadow-2xl relative overflow-hidden group/status-card">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/status-card:opacity-100 transition-opacity" />
                          <div className="relative z-10">
                            <div className="text-[10px] uppercase font-black text-white/20 tracking-[0.5em] mb-6 flex items-center gap-4">
                              <Activity className="h-4 w-4 text-primary" />
                              Protocol Executive
                            </div>
                            <div className="flex items-center gap-6">
                              <div className={cn(
                                "h-5 w-5 rounded-full shadow-[0_0_20px]",
                                state?.status === "completed" ? "bg-emerald-500 shadow-emerald-500/50" : 
                                state?.status === "failed" ? "bg-rose-500 shadow-rose-500/50" : 
                                state?.status === "ready_for_captcha" ? "bg-amber-500 shadow-amber-500/50 animate-pulse" :
                                "bg-primary shadow-primary/50 animate-pulse"
                              )} />
                              <span className="text-2xl font-display font-black text-white uppercase tracking-[0.1em] leading-none">{state?.status?.replace(/_/g, " ") || "Idle"}</span>
                            </div>
                            {state?.currentEnrollment && (
                              <div className="mt-8 flex items-center gap-4 text-[10px] font-black text-white/40 px-6 py-4 rounded-[1.5rem] bg-white/[0.03] border border-white/5 shadow-inner">
                                <Search className="h-4 w-4 text-primary opacity-40 group-hover/status-card:scale-110 transition-transform" />
                                <span className="uppercase tracking-[0.2em] opacity-40 shrink-0">Target Vector:</span>
                                <span className="text-white font-mono tracking-normal truncate">{state.currentEnrollment}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6">
                          <Button 
                            onClick={start} 
                            disabled={busy !== null || isJobActive}
                            size="lg"
                            className="h-20 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] px-12 bg-white text-black hover:bg-primary hover:text-white transition-all shadow-[0_20px_40px_rgba(255,255,255,0.05)] hover:shadow-primary/20 hover:-translate-y-1 active:scale-95 group flex-1"
                          >
                            <Play className="mr-4 h-5 w-5 fill-current opacity-40 group-hover:opacity-100 transition-opacity" />
                            {busy === "start" ? "Initialising..." : "Execute Protocol"}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={stop} 
                            disabled={busy !== null || !isJobActive}
                            size="lg"
                            className="h-20 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] px-10 border-white/5 bg-white/[0.03] text-white hover:bg-rose-500 hover:text-white hover:border-transparent transition-all active:scale-95 shadow-xl hover:shadow-rose-500/20"
                          >
                            <Square className="mr-4 h-4 w-4 fill-current opacity-40 group-hover:opacity-100 transition-opacity" />
                            Terminate
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-10">
                        <div className="p-10 rounded-[3rem] border border-white/5 bg-white/[0.01] shadow-2xl relative overflow-hidden group/persist">
                          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent opacity-0 group-hover/persist:opacity-100 transition-opacity" />
                          <div className="text-[10px] uppercase font-black text-white/20 tracking-[0.5em] mb-8 flex items-center gap-4">
                            <History className="h-4 w-4 text-indigo-400" />
                            Persistence Log
                          </div>
                          <div className="flex flex-col gap-4">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={reparse} 
                              disabled={busy !== null} 
                              className="rounded-[1.25rem] h-14 px-8 text-[10px] font-black uppercase tracking-widest justify-start hover:bg-white/10 text-white/40 hover:text-white transition-all border border-transparent hover:border-white/10 group/btn"
                            >
                              <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center mr-5 group-hover/btn:bg-primary/20 transition-colors">
                                <RotateCcw className={cn("h-4 w-4 transition-all group-hover/btn:rotate-180 duration-700", busy === "reparse" && "animate-spin")} />
                              </div>
                              Reparse Registry
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={resetFailedUnknown} 
                              disabled={busy !== null} 
                              className="rounded-[1.25rem] h-14 px-8 text-[10px] font-black uppercase tracking-widest justify-start hover:bg-white/10 text-white/40 hover:text-white transition-all border border-transparent hover:border-white/10 group/btn"
                            >
                               <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center mr-5 group-hover/btn:bg-rose-500/20 transition-colors">
                                <RefreshCw className={cn("h-4 w-4 transition-all group-hover/btn:rotate-180 duration-700", busy === "reset" && "animate-spin")} />
                              </div>
                              Retry Faulty Nodes
                            </Button>
                          </div>
                        </div>
                        <div className="p-8 rounded-[2rem] bg-white text-black flex items-start gap-6 shadow-2xl group hover:scale-[1.02] transition-transform duration-500">
                           <IdCard className="h-8 w-8 text-primary shrink-0 mt-0.5 group-hover:rotate-12 transition-transform" />
                           <div className="space-y-2">
                              <h6 className="text-[11px] font-black uppercase tracking-widest text-primary italic">Standard Directive</h6>
                              <p className="text-[12px] text-black/50 leading-relaxed font-bold">Protocols should only be re-initialized if portal entropy increases or seat identifiers remain nullified.</p>
                           </div>
                        </div>
                      </div>
                    </div>

                    {state?.status === "ready_for_captcha" && (
                      <FadeIn className="mt-16 pt-16 border-t border-white/5">
                        <div className="rounded-[3.5rem] border border-primary/20 bg-primary/10 p-16 backdrop-blur-3xl shadow-[0_40px_100px_rgba(var(--primary),0.15)] relative overflow-hidden group/captcha">
                          <div className="absolute top-[-20%] right-[-10%] h-[30rem] w-[30rem] bg-primary/20 blur-[120px] pointer-events-none group-hover/captcha:scale-110 transition-transform duration-1000" />
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05]" />
                          
                          <div className="flex flex-col lg:flex-row gap-20 items-center relative z-10">
                            <div className="flex-1 space-y-10">
                              <div className="flex items-center gap-8">
                                 <div className="h-20 w-20 rounded-[2.5rem] bg-white text-black flex items-center justify-center shadow-2xl group-hover/captcha:-rotate-6 transition-transform">
                                  <Lock className="h-10 w-10 text-primary" />
                                </div>
                                <div className="space-y-2">
                                  <h4 className="text-3xl font-display font-black text-white tracking-tight uppercase tracking-[0.05em]">Solve CAPTCHA Directive</h4>
                                  <p className="text-[11px] text-white/30 font-black uppercase tracking-[0.2em] leading-relaxed max-w-lg">
                                    Manual verification required to bypass portal entropy protection and establish secure data handshake.
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="relative flex-1 w-full">
                                  <input
                                    value={captchaText}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCaptchaText(e.target.value)}
                                    placeholder="Input Identity Token..."
                                    className="h-20 w-full rounded-[2rem] border border-white/10 bg-white/[0.05] px-10 text-lg font-black tracking-[0.4em] uppercase focus:outline-none focus:ring-4 focus:ring-primary/20 shadow-inner transition-all placeholder:tracking-normal placeholder:font-black placeholder:text-white/10 text-white"
                                    autoFocus
                                  />
                                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2">
                                     <div className="h-2 w-2 rounded-full bg-primary/20" />
                                     <div className="h-2 w-2 rounded-full bg-primary/40" />
                                     <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                  </div>
                                </div>
                                <Button 
                                  onClick={cont} 
                                  disabled={busy !== null || !captchaText.trim()}
                                  className="h-20 w-full sm:w-auto rounded-[2rem] px-16 font-black uppercase tracking-widest text-[12px] bg-white text-black hover:bg-primary hover:text-white shadow-2xl transition-all hover:-translate-y-1 active:scale-95 group/submit"
                                >
                                  Engage Bridge
                                  <ChevronRight className="ml-4 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                                </Button>
                              </div>
                              {captchaError && (
                                <FadeIn>
                                  <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-4 animate-shake">
                                    <AlertCircle className="h-5 w-5" />
                                    {captchaError}
                                  </div>
                                </FadeIn>
                              )}
                            </div>

                            <div className="shrink-0 group/img-wrap relative">
                                <div className="absolute -inset-10 bg-primary/20 blur-[60px] opacity-0 group-hover/img-wrap:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                {captchaPngBase64 ? (
                                  <div className="relative p-8 bg-white rounded-[3.5rem] border border-white/20 shadow-[0_50px_100px_rgba(0,0,0,0.5)] group-hover/img-wrap:scale-110 transition-all duration-700 group-hover/img-wrap:rotate-2">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      alt="captcha"
                                      src={`data:image/png;base64,${captchaPngBase64}`}
                                      className="h-28 w-auto rounded-2xl select-none filter contrast-125 saturate-150 relative z-10"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-[3.5rem]" />
                                  </div>
                                ) : (
                                  <div className="h-44 w-80 bg-white/5 animate-pulse rounded-[3.5rem] flex flex-col items-center justify-center gap-4 border border-white/10">
                                    <RefreshCw className="h-8 w-8 text-white/10 animate-spin" />
                                    <p className="text-[10px] text-white/10 uppercase font-black tracking-[0.5em]">Decoding Stream...</p>
                                  </div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => loadCaptcha({ refresh: true })}
                                  disabled={busy !== null}
                                  className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-white text-black border border-white/20 shadow-2xl hover:bg-primary hover:text-white transition-all active:scale-90 group/refresh-btn z-20"
                                >
                                  <RefreshCw className={cn("h-7 w-7 transition-transform duration-700 group-hover/refresh-btn:rotate-180", busy === "refresh" && "animate-spin")} />
                                </Button>
                            </div>
                          </div>
                        </div>
                      </FadeIn>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-white/5 shadow-2xl rounded-[3.5rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden h-full border-t-white/10 group">
                  <CardHeader className="border-b border-white/5 bg-white/[0.01] px-12 py-10">
                    <div className="flex items-center gap-6">
                       <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                        <BarChart3 className="h-7 w-7" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-2xl font-display font-black text-white tracking-tight">Snap Telemetry</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">Pulse extraction datasets</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-12">
                    {loadingAnalytics ? (
                      <div className="space-y-10">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white/[0.02] border border-white/5 animate-pulse rounded-[2.5rem]" />)}
                      </div>
                    ) : !analytics ? (
                      <div className="py-40 text-center flex flex-col items-center justify-center gap-10 opacity-30">
                         <div className="h-24 w-24 rounded-[2.5rem] border border-white/10 flex items-center justify-center">
                           <Box className="h-12 w-12 text-white/10" />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 animate-pulse">Converging Node Metrics...</p>
                      </div>
                    ) : (
                      <div className="space-y-10">
                        <StatCard
                          tone="indigo"
                          label="Yield Density"
                          value={`${analytics.totals.passRate}%`}
                          hint="Registry Success Parity"
                          className="p-10 rounded-[3rem] border-white/5 bg-white/[0.02] shadow-2xl backdrop-blur-3xl"
                        />
                        <StatCard
                          tone="orange"
                          label="Fault Entries"
                          value={analytics.totals.totalKTs}
                          hint="Cross-Dataset Backlogs"
                          className="p-10 rounded-[3rem] border-white/5 bg-white/[0.02] shadow-2xl backdrop-blur-3xl"
                        />
                        <div className="pt-14 mt-10 border-t border-white/5">
                          <div className="text-[10px] uppercase font-black text-white/20 tracking-[0.5em] mb-10 px-4 flex items-center gap-4">
                             <div className="h-1 w-1 rounded-full bg-primary" />
                             Class Clusters
                          </div>
                          <div className="space-y-4">
                            {analytics.classDistribution.slice(0, 4).map((it) => (
                              <div key={it.label} className="flex items-center justify-between p-6 px-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group/cluster relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover/cluster:opacity-100 transition-opacity" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-white/30 group-hover:text-white relative z-10">{it.label}</span>
                                <div className="flex items-center gap-4 relative z-10">
                                  <span className="text-2xl font-display font-black text-white group-hover:text-primary transition-colors">{it.value}</span>
                                  <span className="text-[9px] text-primary/40 font-black tracking-widest uppercase">Nodes</span>
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
                   <Card className="border-white/5 shadow-2xl rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-indigo-500/20 via-primary/20 to-indigo-900/20 backdrop-blur-3xl relative group border-t-white/10">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                    <div className="absolute top-[-20%] right-[-10%] h-[30rem] w-[30rem] rounded-full bg-primary/20 blur-[100px] group-hover:animate-pulse transition-all duration-700" />
                    
                    <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/5">
                      <div className="lg:w-1/3 p-12 relative z-10 flex flex-col justify-center border-b lg:border-b-0 border-white/5">
                        <div className="flex items-center gap-5 mb-10">
                           <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/20">
                            <Trophy className="h-7 w-7 text-amber-500 group-hover:scale-110 transition-transform duration-700" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-2xl font-display font-black text-white tracking-tight leading-none">Supreme Merit</h3>
                            <p className="text-[9px] uppercase font-black tracking-[0.4em] text-white/40">Batch Protocol Rank 01</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                          <div className="h-32 w-32 rounded-[3.5rem] bg-white/10 backdrop-blur-xl flex items-center justify-center mb-10 ring-1 ring-white/20 shadow-2xl relative overflow-hidden group/star">
                             <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent scale-0 group-hover/star:scale-150 transition-transform duration-1000" />
                             <Sparkles className="h-16 w-16 text-white group-hover:scale-110 transition-transform duration-700" />
                          </div>
                          
                          <div className="space-y-4 w-full">
                             <h4 className="text-4xl font-display font-black text-white tracking-tighter leading-[1.1]">{analytics.topper.name}</h4>
                             <div className="inline-flex items-center px-6 py-3 rounded-[1.25rem] bg-white text-black text-[12px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(255,255,255,0.1)] border border-white/20 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                              {analytics.topper.percentage}% Efficiency Yield
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="lg:w-2/3 p-12 relative z-10">
                         <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 h-full">
                            <div className="space-y-8 flex flex-col justify-center">
                               <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 backdrop-blur-xl group/node hover:bg-white/10 transition-all">
                                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-3 leading-none">Node ID</p>
                                  <p className="text-lg font-display font-black text-white truncate group-hover:text-primary transition-colors tracking-tight">{analytics.topper.enrollmentNumber || "-"}</p>
                               </div>
                               <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 backdrop-blur-xl group/node hover:bg-white/10 transition-all">
                                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-3 leading-none">Registry Point</p>
                                  <p className="text-lg font-display font-black text-white truncate group-hover:text-primary transition-colors tracking-tight">{analytics.topper.seatNumber || "-"}</p>
                               </div>
                            </div>

                            <div className="lg:col-span-1 flex flex-col justify-center space-y-10 border-white/5 lg:border-l lg:pl-10">
                               <div className="space-y-4">
                                  <h5 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em]">Yield Categorization</h5>
                                  <div className="space-y-4">
                                     {['Quantization: ACCURATE', 'Integrity: VERIFIED', 'Distribution: APEX'].map(it => (
                                       <div key={it} className="flex items-center gap-3">
                                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{it}</span>
                                       </div>
                                     ))}
                                  </div>
                               </div>

                               <div className="pt-10 border-t border-white/5 flex items-center justify-between">
                                  <div className="flex flex-col">
                                     <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-1">Rank Vector</span>
                                     <span className="text-[12px] font-black text-emerald-400 tracking-widest uppercase">POS 01 / {analytics.totals.totalStudents}</span>
                                  </div>
                                  <Link href={`/results/${batchId}/students/${analytics.topper.enrollmentNumber}`}>
                                    <Button variant="ghost" className="h-14 bg-white/5 text-white hover:bg-white/10 rounded-2xl px-6 gap-3 font-black text-[11px] uppercase tracking-[0.2em] transition-all group-hover:translate-x-1 border border-white/5">
                                        Inspect Node
                                        <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-100" />
                                    </Button>
                                  </Link>
                               </div>
                            </div>
                            
                            <div className="hidden lg:flex flex-col items-center justify-center p-10 bg-white/[0.03] border border-white/5 rounded-[3rem] shadow-inner relative overflow-hidden group/viz">
                               <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/viz:opacity-100 transition-opacity" />
                               <div className="h-32 w-32 rounded-full border-4 border-white/5 border-t-primary animate-spin duration-3000 relative flex items-center justify-center">
                                  <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-b-primary animate-spin reverse duration-2000 flex items-center justify-center">
                                     <Activity className="h-8 w-8 text-primary opacity-40" />
                                  </div>
                               </div>
                               <p className="mt-8 text-[9px] font-black text-white/20 uppercase tracking-[0.4em] text-center">Neural Extraction Layer Active</p>
                            </div>
                         </div>
                      </div>
                    </div>
                  </Card>
                </FadeIn>
              )}

              <Card className="border-white/5 shadow-2xl rounded-[3.5rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden mt-12 border-t-white/10">
                <CardHeader className="border-b border-white/5 bg-white/[0.01] px-12 py-10 relative overflow-hidden group/header">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/header:opacity-100 transition-opacity duration-1000" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                       <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group-hover/header:scale-110 transition-transform duration-700">
                        <FileSearch className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-display font-black text-white tracking-tight">Student Node Registry</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mt-1">Verified records and performance telemetry</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="hidden lg:flex flex-col items-end">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Dataset Healthy</span>
                        <div className="h-1.5 w-32 bg-white/5 rounded-full mt-2 overflow-hidden border border-white/5">
                           <div className="h-full w-full bg-emerald-500/40" />
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="rounded-xl h-12 px-8 font-black text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/5 active:scale-95">
                        Reset Schema
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-12 bg-white/[0.01] border-b border-white/5 backdrop-blur-3xl relative">
                    <div className="grid gap-10 md:grid-cols-4 lg:grid-cols-6 items-end">
                      <div className="md:col-span-2 lg:col-span-3 relative group/input">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2 mb-3 block">Query Search</label>
                        <Search className="absolute left-6 bottom-5 h-5 w-5 text-white/20 group-focus-within/input:text-primary transition-colors z-10" />
                        <input
                          value={query}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                          placeholder="Search identity or seat identifier..."
                          className="w-full h-16 pl-16 pr-6 rounded-[2rem] border border-white/5 bg-white/[0.02] text-sm font-black uppercase tracking-widest placeholder:text-white/10 text-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-2xl hover:bg-white/[0.04]"
                        />
                      </div>
                      <div className="relative group/filter">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2 mb-3 block">Condition</label>
                        <select
                          value={statusFilter}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as any)}
                          className="w-full h-16 rounded-[2rem] border border-white/5 bg-white/[0.02] px-8 text-[11px] font-black uppercase tracking-widest text-white/60 focus:outline-none focus:ring-4 focus:ring-primary/5 shadow-2xl cursor-pointer appearance-none transition-all hover:bg-white/[0.05]"
                        >
                          <option value="all" className="bg-slate-900">Protocol: All</option>
                          <option value="Pass" className="bg-slate-900">Status: Pass</option>
                          <option value="Fail" className="bg-slate-900">Status: Fail</option>
                          <option value="Unknown" className="bg-slate-900">Status: Unknown</option>
                          <option value="Error" className="bg-slate-900">Status: Fault</option>
                        </select>
                        <ChevronDown className="absolute right-8 bottom-6 h-4 w-4 text-white/20 pointer-events-none group-hover/filter:text-primary transition-colors" />
                      </div>
                      <div className="relative group/sort md:col-span-1 lg:col-span-2">
                         <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2 mb-3 block">Sort Vector</label>
                        <select
                          value={sortKey}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortKey(e.target.value as any)}
                          className="w-full h-16 rounded-[2rem] border border-white/5 bg-white/[0.02] px-8 text-[11px] font-black uppercase tracking-widest text-white/60 focus:outline-none focus:ring-4 focus:ring-primary/5 shadow-2xl cursor-pointer appearance-none transition-all hover:bg-white/[0.05]"
                        >
                          <option value="enrollment" className="bg-slate-900">Identifier: Seat Sequence</option>
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
                          <th className="px-10 py-6 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Efficiency Yield</th>
                          <th className="px-10 py-6 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Protocol Status</th>
                          <th className="px-10 py-6 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Sync Timestamp</th>
                          <th className="px-10 py-6 text-[9px] font-black text-white/20 uppercase tracking-[0.3em] text-right">Directives</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredResults.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-40 text-center">
                              <div className="flex flex-col items-center gap-6">
                                <div className="h-20 w-20 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10 text-white/10 shadow-inner">
                                  <Search className="h-10 w-10" />
                                </div>
                                <div className="space-y-2">
                                  <p className="text-xl font-display font-black text-white">No matches found in registry</p>
                                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Adjust your filtration parameters and retry</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {filteredResults.length > 0 && (
                        <FadeInStagger as="tbody" className="divide-y divide-white/5">
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
                                  "group border-t border-white/5 transition-all duration-500",
                                  isOpen ? "bg-primary/[0.05]" : "hover:bg-white/[0.02]"
                                )}>
                                    <td className="px-10 py-8">
                                      <div className="flex items-center gap-6">
                                        <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center font-display font-black text-white/20 shrink-0 tabular-nums text-xs group-hover:bg-primary/10 group-hover:text-primary transition-all border border-white/5 group-hover:border-primary/20">
                                          {r.enrollmentNumber.slice(-3)}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="font-display font-black text-white text-lg group-hover:text-primary transition-colors tracking-tight">
                                            {r.name || "Awaiting Node Data..."}
                                          </div>
                                          <div className="flex items-center gap-4 mt-2 text-[10px] font-black text-white/20 uppercase tracking-widest">
                                            <span>Seat: {r.enrollmentNumber}</span>
                                            <div className="w-1 h-1 rounded-full bg-white/10" />
                                            <span className="opacity-60 italic">EN: {r.marksheetEnrollmentNumber || "N/A"}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-10 py-8">
                                      <div className="font-display font-black text-2xl text-white tracking-tighter">{showPercent}</div>
                                      <div className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em] mt-1">{r.resultClass || "Pending Analysis"}</div>
                                    </td>
                                    <td className="px-10 py-8">
                                      {(() => {
                                        const label = r.errorMessage ? "Error" : r.resultStatus || "Unknown";
                                        return (
                                          <span className={cn(
                                            "inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-2xl transition-all",
                                            label === "Pass" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5" :
                                            label === "Fail" ? "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/5" :
                                            label === "Error" ? "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/5" :
                                            "bg-white/5 text-white/40 border-white/10"
                                          )}>
                                            <div className={cn(
                                              "h-1.5 w-1.5 rounded-full mr-2",
                                              label === "Pass" ? "bg-emerald-500 shadow-[0_0_8px_rgba(var(--emerald-500),0.8)]" :
                                              label === "Fail" ? "bg-rose-500 shadow-[0_0_8px_rgba(var(--rose-500),0.8)]" :
                                              label === "Error" ? "bg-amber-500 shadow-[0_0_8px_rgba(var(--amber-500),0.8)]" : "bg-white/20"
                                            )} />
                                            {label}
                                          </span>
                                        );
                                      })()}
                                    </td>
                                    <td className="px-10 py-8 text-[10px] font-black text-white/20 uppercase tracking-widest tabular-nums">
                                      {r.fetchedAt ? (
                                        <div className="flex flex-col gap-1">
                                          <span className="text-white/40">{new Date(r.fetchedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                          <span>{new Date(r.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                      ) : "Queueing..."}
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                      <div className="flex items-center justify-end gap-3">
                                        <Link href={`/results/${batchId}/students/${encodeURIComponent(r.enrollmentNumber)}`}>
                                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border border-white/5 bg-white/5 shadow-2xl text-white/40 hover:text-primary hover:bg-primary/10 hover:border-primary/20 transition-all active:scale-90">
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
                                            "h-12 rounded-2xl px-6 font-black text-[9px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-2xl",
                                            isOpen ? "bg-primary text-white border-transparent" : "bg-white/5 border-white/10 text-white group-hover:bg-white group-hover:text-black group-hover:border-transparent"
                                          )}
                                        >
                                          {isOpen ? "Collapse" : "Inspect Node"}
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
                        className="overflow-hidden bg-white/[0.01] border-t border-white/5"
                      >
                         <div className="p-12">
                            {(() => {
                               const r = batch?.results.find(x => x.enrollmentNumber === expanded);
                               if (!r) return null;
                               const subjects = r.subjectMarks ? Object.entries(r.subjectMarks) : [];
                               return (
                                  <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] shadow-2xl overflow-hidden backdrop-blur-3xl">
                                     <div className="flex items-center justify-between p-10 border-b border-white/5 bg-white/[0.01]">
                                        <div>
                                          <div className="flex items-center gap-3 mb-2">
                                            <Activity className="h-4 w-4 text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Detailed Telemetry</span>
                                          </div>
                                          <h4 className="text-2xl font-display font-black text-white tracking-tight">Node Analytics: {r.name}</h4>
                                          <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">Component Mapping Vector</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-2">Efficiency Index</p>
                                          <p className="text-4xl font-display font-black text-primary tracking-tighter">{r.percentage}%</p>
                                        </div>
                                      </div>

                                      <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                          <thead>
                                            <tr className="bg-white/[0.01] border-b border-white/5">
                                              <th className="px-10 py-6 font-black text-white/20 uppercase tracking-[0.3em] text-[9px]">Logical Subject Identifier</th>
                                              <th className="px-10 py-6 font-black text-white/20 uppercase tracking-[0.3em] text-[9px]">Net Score</th>
                                              <th className="px-10 py-6 font-black text-white/20 uppercase tracking-[0.3em] text-[9px]">Int. (FA)</th>
                                              <th className="px-10 py-6 font-black text-white/20 uppercase tracking-[0.3em] text-[9px]">Ext. (SA)</th>
                                              <th className="px-10 py-6 font-black text-white/20 uppercase tracking-[0.3em] text-[9px]">SLA Logic</th>
                                              <th className="px-10 py-6 font-black text-white/20 uppercase tracking-[0.3em] text-[9px]">Logic Value</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-white/5">
                                            {subjects.map(([sub, m]) => (
                                              <tr key={sub} className="hover:bg-white/[0.02] transition-all group/row">
                                                <td className="px-10 py-6">
                                                  <div className="font-black text-white text-sm group-hover/row:text-primary transition-colors uppercase tracking-widest">{sub}</div>
                                                </td>
                                                <td className="px-10 py-6">
                                                  <div className="flex items-center gap-3">
                                                    <span className="font-display font-black text-white text-base">{m.totalObt ?? "0"}</span>
                                                    <span className="text-white/10">/</span>
                                                    <span className="text-white/40 font-black text-[10px]">{m.totalMax ?? "0"}</span>
                                                  </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                  <div className="space-y-2 font-mono text-[10px] text-white/40">
                                                    <p className="font-black uppercase tracking-widest">TH: <span className="text-indigo-400">{m.faThObt ?? "0"}</span>/{m.faThMax ?? "0"}</p>
                                                    <p className="font-black uppercase tracking-widest">PR: <span className="text-indigo-400">{m.faPrObt ?? "0"}</span>/{m.faPrMax ?? "0"}</p>
                                                  </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                  <div className="space-y-2 font-mono text-[10px] text-white/40">
                                                    <p className="font-black uppercase tracking-widest">TH: <span className="text-primary">{m.saThObt ?? "0"}</span>/{m.saThMax ?? "0"}</p>
                                                    <p className="font-black uppercase tracking-widest">PR: <span className="text-primary">{m.saPrObt ?? "0"}</span>/{m.saPrMax ?? "0"}</p>
                                                  </div>
                                                </td>
                                                <td className="px-10 py-6 text-white/40 font-black tracking-widest tabular-nums text-[10px]">
                                                  {m.slaObt ?? "0"}<span className="text-white/10 mx-2">/</span>{m.slaMax ?? "0"}
                                                </td>
                                                <td className="px-10 py-6">
                                                  <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-primary shadow-2xl text-[10px]">
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
