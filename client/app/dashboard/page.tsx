"use client";

import Link from "next/link";
import * as React from "react";
import { 
  BarChart3, 
  Calendar, 
  Eye, 
  GraduationCap, 
  Percent, 
  Sparkles, 
  Trophy, 
  Upload, 
  BookOpen, 
  Star, 
  X, 
  History, 
  FileJson,
  ChevronRight,
  TrendingUp,
  Activity,
  Box,
  LayoutDashboard,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Protected } from "@/components/Protected";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { FadeIn, FadeInStagger, FadeInStaggerItem } from "@/components/Animated";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { cn } from "@/lib/utils";

type BatchSummary = {
  id: string;
  uploadDate: string;
  totalStudents: number;
  passCount: number;
  failCount: number;
  topperName: string | null;
  topperPercentage: number | null;
  status: "created" | "fetching" | "completed" | "failed";
};

type AnalyticsSummary = {
  totals: {
    batches: number;
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
    batchId: string | null;
  };
  classDistribution: Array<{ label: string; value: number }>;
  subjectAverages: Array<{ subject: string; avgPercentage: number | null; samples: number }>;
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();

  const [batches, setBatches] = React.useState<BatchSummary[]>([]);
  const [loadingBatches, setLoadingBatches] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [analytics, setAnalytics] = React.useState<AnalyticsSummary | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = React.useState(true);

  React.useEffect(() => {
    if (authLoading || !user) return;

    async function load() {
      try {
        setLoadError(null);
        const [recentRes, analyticsRes] = await Promise.all([
          api.get("/batches/recent"),
          api.get("/batches/analytics/summary"),
        ]);
        setBatches(recentRes.data.batches || []);
        setAnalytics(analyticsRes.data || null);
      } catch (err: any) {
        if (err?.response?.status === 429) {
          setLoadError("Concurrency limit reached. Retrying connection...");
          return;
        }
        if (err?.response?.status === 401) {
          setLoadError("Authentication session expired.");
          return;
        }
        setLoadError("Telemetry synchronization failed.");
      } finally {
        setLoadingBatches(false);
        setLoadingAnalytics(false);
      }
    }

    load();
  }, [user, authLoading]);

  const totals = React.useMemo(() => {
    const totalStudents = analytics?.totals.totalStudents ?? batches.reduce((acc, b) => acc + (b.totalStudents || 0), 0);
    const passRate = analytics?.totals.passRate ?? 0;
    const topperName = analytics?.topper?.name || "-";
    const topperPercentage = analytics?.topper?.percentage ?? null;
    return {
      totalStudents,
      passRate,
      topperName,
      topperPercentage,
    };
  }, [analytics, batches]);

  return (
    <Protected>
      <AppShell>
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] h-[50rem] w-[50rem] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] h-[40rem] w-[40rem] rounded-full bg-indigo-500/5 blur-[100px]" />
      </div>
        <PageHeader
          title={
            <div className="flex items-center gap-6">
               <div className="h-16 w-16 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(var(--primary),0.2)] backdrop-blur-3xl group hover:scale-110 transition-all duration-700">
                <LayoutDashboard className="h-8 w-8" />
              </div>
              <div>
                <span className="font-display font-black text-4xl text-white tracking-tight block">Central Nexus</span>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mt-2 flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
                  Operator Session: {user?.username}
                </p>
              </div>
            </div>
          }
          subtitle="Real-time academic telemetry and performance heuristics overview."
          actions={
            <div className="flex items-center gap-6">
              <Link href="/smarteduhub">
                <Button variant="outline" className="rounded-2xl h-16 px-8 font-black uppercase tracking-widest text-[10px] border-white/5 bg-white/[0.03] hover:bg-white/10 text-white/40 hover:text-white transition-all shadow-2xl backdrop-blur-xl group">
                  <Star className="mr-3 h-4 w-4 fill-amber-400 text-amber-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                  Edu Hub
                </Button>
              </Link>
              <Link href="/upload">
                <Button className="rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[11px] bg-white text-black hover:bg-primary hover:text-white transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-primary/20 hover:-translate-y-1 active:scale-95 group">
                  <Upload className="mr-4 h-5 w-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                  Sync Batch
                </Button>
              </Link>
            </div>
          }
        />

        <main className="mx-auto max-w-7xl px-8 py-16 lg:px-12 relative z-10">
          <FadeInStagger className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <FadeInStaggerItem>
              <StatCard
                tone="indigo"
                label="Global Population"
                value={totals.totalStudents}
                hint="Analyzed Academicians"
                icon={<GraduationCap className="h-6 w-6" />}
              />
            </FadeInStaggerItem>
            <FadeInStaggerItem>
              <StatCard
                tone="green"
                label="Efficiency Rating"
                value={`${totals.passRate}%`}
                hint="Global Success Metric"
                icon={<Activity className="h-6 w-6" />}
              />
            </FadeInStaggerItem>
            <FadeInStaggerItem>
              <StatCard
                tone="red"
                label="Attrition Nodes"
                value={analytics?.totals.dropped ?? 0}
                hint="Critical Backlog (4+ KTs)"
                icon={<X className="h-6 w-6" />}
              />
            </FadeInStaggerItem>
            <FadeInStaggerItem>
              <StatCard
                tone="orange"
                label="Backlog Index"
                value={analytics?.totals.totalKTs ?? 0}
                hint="Aggregated Subject Failures"
                icon={<Star className="h-6 w-6" />}
              />
            </FadeInStaggerItem>
          </FadeInStagger>

          <div className="mt-20 grid gap-12 lg:grid-cols-3">
            <FadeIn delay={0.2} className="lg:col-span-2">
              <Card className="border-white/5 shadow-2xl rounded-[3.5rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden border-t-white/10">
                <CardHeader className="border-b border-white/5 bg-white/[0.01] px-12 py-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                       <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                        <History className="h-7 w-7" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-2xl font-display font-black text-white tracking-tight leading-none">Operational History</h3>
                        <p className="text-[10px] uppercase font-black tracking-[0.4em] text-white/20">Most recent extraction trajectories</p>
                      </div>
                    </div>
                    <Link href="/results">
                      <Button variant="ghost" size="sm" className="rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[9px] text-white/20 hover:text-white hover:bg-white/5 group transition-all border border-transparent hover:border-white/5">
                        Deep Inventory
                        <ChevronRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingBatches ? (
                     <div className="flex flex-col items-center justify-center py-32 gap-8">
                      <RefreshCw className="h-12 w-12 animate-spin text-primary opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10 animate-pulse">Mapping Data Clusters...</p>
                    </div>
                  ) : loadError ? (
                    <div className="py-32 px-12 text-center">
                       <div className="inline-flex items-center h-16 w-16 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 mb-8 flex items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-rose-500 opacity-50" />
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500/60 max-w-xs mx-auto leading-relaxed">{loadError}</p>
                    </div>
                  ) : batches.length === 0 ? (
                    <div className="py-40 px-12 text-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-primary/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                      <div className="relative z-10">
                        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[3rem] bg-white/5 border border-white/10 text-white/5 mb-10 shadow-inner group-hover:text-primary group-hover:scale-110 transition-all duration-700">
                          <Box className="h-12 w-12" />
                        </div>
                        <h4 className="text-3xl font-display font-black text-white">Archive Nullified</h4>
                        <p className="text-[10px] uppercase font-black tracking-[0.4em] text-white/20 mt-4 max-w-sm mx-auto leading-relaxed">System awaiting first extraction trajectory initialization.</p>
                        <Link href="/upload">
                          <Button className="mt-12 rounded-2xl h-16 px-14 font-black uppercase tracking-widest text-[11px] bg-white text-black hover:bg-primary hover:text-white shadow-2xl transition-all scale-105 active:scale-95">Begin Synchronization</Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {batches.map((b) => (
                        <div
                          key={b.id}
                          className="group flex flex-col sm:flex-row sm:items-center justify-between p-10 hover:bg-white/[0.03] transition-all duration-500 cursor-pointer relative overflow-hidden"
                        >
                          <div className="absolute inset-y-0 left-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
                          <div className="flex items-center gap-10 min-w-0">
                            <div className={cn(
                              "h-20 w-20 rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl border border-transparent transition-all duration-700 group-hover:rotate-12",
                              b.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5" : 
                              b.status === "failed" ? "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/5" : "bg-primary/10 text-primary border-primary/20 shadow-primary/5"
                            )}>
                              <FileJson className="h-10 w-10" />
                            </div>
                            <div className="min-w-0 space-y-3">
                              <p className="text-2xl font-display font-black text-white group-hover:text-primary transition-colors tracking-tight">
                                {new Date(b.uploadDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                              <div className="flex flex-wrap items-center gap-5">
                                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] shadow-inner">
                                  <GraduationCap className="h-3.5 w-3.5 text-primary/60" />
                                  {b.totalStudents} Nodes
                                </div>
                                <div className={cn(
                                  "flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] border shadow-2xl transition-all duration-500",
                                  b.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20"
                                )}>
                                  <div className={cn("h-1.5 w-1.5 rounded-full", b.status === "completed" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.8)]")} />
                                  {b.status}
                                </div>
                              </div>
                            </div>
                          </div>

                          <Link href={`/results/${b.id}`} className="mt-8 sm:mt-0">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-xl h-14 px-10 font-black uppercase tracking-widest text-[11px] bg-white/5 border-white/10 hover:border-primary hover:text-white hover:bg-primary transition-all active:scale-95 shadow-2xl">
                              Inspect Path
                              <ChevronRight className="ml-3 h-4 w-4 opacity-30 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.4}>
              <Card className="border-white/5 shadow-2xl rounded-[3.5rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden border-t-white/10">
                <CardHeader className="border-b border-white/5 bg-white/[0.01] px-12 py-10">
                   <div className="flex items-center gap-6">
                     <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                        <TrendingUp className="h-7 w-7" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-2xl font-display font-black text-white tracking-tight leading-none">Subject Telemetry</h3>
                        <p className="text-[10px] uppercase font-black tracking-[0.4em] text-white/20">Aggregate clustering</p>
                      </div>
                    </div>
                </CardHeader>
                <CardContent className="p-10 space-y-12">
                  {loadingAnalytics ? (
                    <div className="space-y-12 py-12 opacity-20">
                       {[1,2,3,4,5].map(i => (
                         <div key={i} className="space-y-4">
                           <div className="flex justify-between w-full h-5 bg-white/10 rounded-xl animate-pulse" />
                           <div className="w-full h-3 bg-white/5 rounded-full" />
                         </div>
                       ))}
                    </div>
                  ) : !analytics ? (
                    <div className="text-center py-32 px-10">
                      <div className="h-16 w-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-8 text-white/10">
                        <Activity className="h-8 w-8" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 leading-relaxed italic">Awaiting dataset convergence...</p>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      {analytics.subjectAverages.slice(0, 5).map((it, idx) => {
                        const pct = Math.max(0, Math.min(100, Math.round(it.avgPercentage || 0)));
                        return (
                          <div key={it.subject} className="space-y-5 group">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-4">
                                 <span className="text-[11px] font-black text-primary/30 tracking-widest group-hover:text-primary transition-colors">#{idx + 1}</span>
                                 <div className="text-[11px] font-black text-white uppercase tracking-[0.15em] truncate max-w-[180px] group-hover:translate-x-1 transition-transform">{it.subject}</div>
                               </div>
                               <div className="text-[12px] font-display font-black text-primary bg-primary/5 px-4 py-2 rounded-xl border border-primary/20 shadow-lg group-hover:bg-primary group-hover:text-white transition-all">{it.avgPercentage?.toFixed(1) ?? "-"}%</div>
                            </div>
                            <div className="h-3 w-full rounded-full bg-white/[0.03] overflow-hidden p-[1px] border border-white/5 group-hover:border-primary/30 transition-colors">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: idx * 0.15 }}
                                className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500 shadow-[0_0_25px_rgba(var(--primary),0.6)] relative overflow-hidden" 
                              >
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] translate-x-[-100%] animate-shimmer" />
                              </motion.div>
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="pt-16 mt-12 border-t border-white/5 space-y-10">
                        <div className="flex items-center gap-4">
                           <div className="h-1.5 w-8 bg-primary rounded-full" />
                           <h4 className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em]">Yield Clusters</h4>
                        </div>
                        <div className="grid gap-6">
                          {analytics.classDistribution.slice(0, 3).map((it) => (
                            <div key={it.label} className="flex items-center justify-between p-6 px-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all group">
                              <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-black text-white uppercase tracking-[0.1em]">{it.label}</span>
                                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Trajectory Rating</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-3xl font-display font-black text-white tabular-nums group-hover:text-primary transition-colors">{it.value}</span>
                                <div className="h-2 w-2 rounded-full bg-primary/40" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </main>
      </AppShell>
    </Protected>
  );
}
