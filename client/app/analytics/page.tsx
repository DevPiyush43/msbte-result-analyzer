"use client";

import * as React from "react";
import { 
  BarChart3, 
  GraduationCap, 
  Percent, 
  Trophy, 
  Sparkles, 
  TrendingUp, 
  X, 
  Star, 
  Activity, 
  ChevronRight 
} from "lucide-react";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";

import { Protected } from "@/components/Protected";
import { AppShell } from "@/components/AppShell";
import { FadeIn, FadeInStagger, FadeInStaggerItem } from "@/components/Animated";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { PieChart } from "@/components/charts/PieChart";
import { BarChart } from "@/components/charts/BarChart";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

const CLASS_COLORS = ["#4f46e5", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = React.useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/batches/analytics/summary");
        setAnalytics(res.data || null);
      } catch (err: any) {
        const message = err?.response?.data?.error?.message || "Failed to load analytics";
        setError(message);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <Protected>
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] right-[-10%] h-[60rem] w-[60rem] rounded-full bg-primary/20 blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[50rem] w-[50rem] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      <AppShell>
        <PageHeader 
          title={
            <div className="flex items-center gap-6">
               <div className="h-16 w-16 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(var(--primary),0.2)] backdrop-blur-3xl group hover:scale-110 transition-all duration-700">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div>
                <span className="font-display font-black text-4xl text-white tracking-tight block">Analytics Engine</span>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mt-2 flex items-center gap-3">
                   <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
                   Live Telemetry Stream
                </p>
              </div>
            </div>
          }
          subtitle="Holistic insights across all academic cohorts and subject departments." 
          actions={
            <div className="flex items-center gap-6">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Data Integrity</span>
                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4,5,6,7,8,9,10].map(i => (
                      <div key={i} className={cn("h-1 w-2 rounded-full", i < 9 ? "bg-primary/40" : "bg-white/5")} />
                    ))}
                  </div>
                </div>
                <Button variant="outline" className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[9px] border-white/5 bg-white/[0.03] hover:bg-white/10 text-white transition-all shadow-xl backdrop-blur-xl group">
                  <Sparkles className="mr-3 h-4 w-4 text-primary group-hover:animate-pulse" />
                  Neural Patterns: ON
                </Button>
            </div>
          }
        />

        <main className="mx-auto max-w-7xl px-8 py-16 lg:px-12 relative z-10">
          {loading ? (
             <div className="space-y-12">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-36 bg-white/[0.02] border border-white/5 animate-pulse rounded-[2.5rem]" />)}
                </div>
                <div className="grid gap-12 lg:grid-cols-3">
                  <div className="lg:col-span-2 h-[500px] bg-white/[0.02] border border-white/5 animate-pulse rounded-[3.5rem]" />
                  <div className="h-[500px] bg-white/[0.02] border border-white/5 animate-pulse rounded-[3.5rem]" />
                </div>
             </div>
          ) : error ? (
            <FadeIn>
              <div className="py-40 text-center rounded-[3.5rem] bg-rose-500/5 border border-rose-500/20 backdrop-blur-3xl shadow-2xl">
                 <X className="h-16 w-16 mx-auto mb-8 text-rose-500/40" />
                 <h3 className="text-2xl font-display font-black text-rose-500 uppercase tracking-widest">Analytics Disruption</h3>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mt-4 max-w-sm mx-auto leading-relaxed">{error}</p>
                 <Button className="mt-12 rounded-2xl px-10 h-14 bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-rose-500 hover:text-white transition-all">Reconnect uplink</Button>
              </div>
            </FadeIn>
          ) : !analytics ? (
            <FadeIn>
              <div className="py-40 text-center rounded-[3.5rem] bg-white/[0.01] border border-white/5 backdrop-blur-3xl shadow-2xl opacity-40">
                 <Activity className="h-16 w-16 mx-auto mb-8 text-white/10" />
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">No historical data converged for analysis.</p>
              </div>
            </FadeIn>
          ) : (
            <FadeInStagger className="space-y-12">
              <FadeInStaggerItem>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    tone="indigo"
                    label="Active Population"
                    value={analytics.totals.totalStudents}
                    icon={<GraduationCap className="h-6 w-6" />}
                    trend={{ value: 8.5, isUp: true }}
                    className="p-10 rounded-[3rem] bg-white/[0.02] border-white/5 shadow-2xl backdrop-blur-3xl"
                  />
                  <StatCard
                    tone="green"
                    label="Efficiency Rating"
                    value={`${analytics.totals.passRate}%`}
                    icon={<Activity className="h-6 w-6" />}
                    trend={{ value: 2.1, isUp: true }}
                    className="p-10 rounded-[3rem] bg-white/[0.02] border-white/5 shadow-2xl backdrop-blur-3xl"
                  />
                  <StatCard
                    tone="red"
                    label="Attrition nodes"
                    value={analytics.totals.dropped}
                    icon={<X className="h-6 w-6" />}
                    hint="High KT count impact"
                    className="p-10 rounded-[3rem] bg-white/[0.02] border-white/5 shadow-2xl backdrop-blur-3xl"
                  />
                  <StatCard
                    tone="orange"
                    label="Aggregated KTs"
                    value={analytics.totals.totalKTs}
                    icon={<Star className="h-6 w-6" />}
                    hint="Cross-subject failure index"
                    className="p-10 rounded-[3rem] bg-white/[0.02] border-white/5 shadow-2xl backdrop-blur-3xl"
                  />
                </div>
              </FadeInStaggerItem>

              <div className="grid gap-12 lg:grid-cols-3">
                <FadeInStaggerItem className="lg:col-span-2">
                  <Card className="border-white/5 shadow-2xl rounded-[3.5rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden h-full border-t-white/10">
                    <CardHeader className="border-b border-white/5 bg-white/[0.01] px-12 py-10 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                           <BarChart3 className="h-7 w-7 text-primary" />
                        </div>
                        <div className="space-y-1.5">
                          <h3 className="text-2xl font-display font-black text-white tracking-tight">Subject Excellence Cluster</h3>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Highest average performance distribution</p>
                        </div>
                      </div>
                      <div className="text-[11px] font-black uppercase tracking-[0.3em] text-white/10 hidden sm:block">Apex 08 Modules</div>
                    </CardHeader>
                    <CardContent className="p-12">
                      <div className="h-[400px]">
                        <BarChart
                          data={analytics.subjectAverages
                            .filter((s) => typeof s.avgPercentage === "number")
                            .slice(0, 8)
                            .map((s) => ({ label: s.subject, value: Number(s.avgPercentage || 0) }))}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </FadeInStaggerItem>

                <FadeInStaggerItem>
                  <Card className="border-white/5 shadow-2xl rounded-[3.5rem] overflow-hidden h-full bg-gradient-to-br from-indigo-500/20 via-primary/20 to-indigo-900/20 backdrop-blur-3xl relative group border-t-white/10">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                    <div className="absolute top-[-20%] right-[-10%] h-[30rem] w-[30rem] rounded-full bg-primary/20 blur-[100px] group-hover:animate-pulse transition-all duration-700" />
                    
                    <CardHeader className="px-12 pt-12 pb-8 relative z-10 border-b border-white/5">
                      <div className="flex items-center gap-5">
                         <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/20">
                          <Trophy className="h-7 w-7 text-amber-500 group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-2xl font-display font-black text-white tracking-tight">Supreme Merit</h3>
                          <p className="text-[9px] uppercase font-black tracking-[0.4em] text-white/40">Top Protocol Rank</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-12 relative z-10">
                      <div className="flex flex-col items-center text-center">
                        <div className="h-32 w-32 rounded-[3rem] bg-white/10 backdrop-blur-xl flex items-center justify-center mb-10 ring-1 ring-white/20 shadow-2xl relative overflow-hidden group/star">
                           <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent scale-0 group-hover/star:scale-150 transition-transform duration-1000" />
                           <Sparkles className="h-16 w-16 text-white group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        
                        <div className="space-y-6 w-full">
                           <h4 className="text-4xl font-display font-black text-white tracking-tighter leading-[1.1]">{analytics.topper.name || "N/A"}</h4>
                           <div className="inline-flex items-center px-6 py-3 rounded-[1.25rem] bg-white text-black text-[12px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(255,255,255,0.1)] border border-white/20 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            {analytics.topper.percentage}% Efficiency Yield
                          </div>
                        </div>

                        <div className="mt-14 grid grid-cols-2 gap-6 w-full">
                          <div className="text-left bg-white/5 backdrop-blur-xl p-6 rounded-[1.5rem] border border-white/10 shadow-xl group/node hover:bg-white/10 transition-all">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-3">Index ID</p>
                            <p className="text-sm font-black text-white truncate font-mono tracking-normal group-hover:text-primary transition-colors">{analytics.topper.enrollmentNumber || "-"}</p>
                          </div>
                          <div className="text-left bg-white/5 backdrop-blur-xl p-6 rounded-[1.5rem] border border-white/10 shadow-xl group/node hover:bg-white/10 transition-all">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-3">Node Registry</p>
                            <p className="text-sm font-black text-white truncate font-mono tracking-normal group-hover:text-primary transition-colors">{analytics.topper.seatNumber || "-"}</p>
                          </div>
                        </div>
                        
                        <div className="mt-14 pt-10 border-t border-white/5 w-full flex items-center justify-between">
                           <div className="flex flex-col items-start gap-1">
                              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Protocol Rank</span>
                              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">TOP 0.01%</span>
                           </div>
                           <Button variant="ghost" className="h-14 text-white hover:bg-white/10 rounded-2xl px-6 gap-3 font-black text-[11px] uppercase tracking-[0.2em] transition-all group-hover:translate-x-1">
                              Review Node
                              <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-100" />
                           </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeInStaggerItem>
              </div>

              <div className="grid gap-12 lg:grid-cols-2">
                <FadeInStaggerItem>
                  <Card className="border-white/5 shadow-2xl rounded-[3.5rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden h-full border-t-white/10">
                    <CardHeader className="border-b border-white/5 bg-white/[0.01] px-12 py-10 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-6">
                         <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center shadow-inner border border-orange-500/20">
                          <Percent className="h-7 w-7 text-orange-500" />
                        </div>
                        <div className="space-y-1.5">
                          <h3 className="text-2xl font-display font-black text-white tracking-tight">Partition Mapping</h3>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Categorizing yield into merit classes</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-12">
                      <div className="h-96">
                         <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart
                              data={analytics.classDistribution.slice(0, 6)}
                              layout="vertical"
                              margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                            >
                               <defs>
                                {CLASS_COLORS.map((color, i) => (
                                  <linearGradient key={i} id={`colorGradient-${i}`} x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={color} stopOpacity={1} />
                                  </linearGradient>
                                ))}
                              </defs>
                              <XAxis type="number" hide />
                              <YAxis 
                                type="category" 
                                dataKey="label" 
                                tick={{ fontSize: 9, fontWeight: 900, fill: "white", opacity: 0.3 }} 
                                width={140}
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip
                                cursor={{ fill: "rgba(255,255,255,0.03)", radius: 16 }}
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="bg-white/10 backdrop-blur-3xl p-6 border border-white/10 rounded-[2rem] shadow-2xl">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-2">{payload[0].payload.label}</p>
                                        <p className="text-2xl font-display font-black text-primary">{payload[0].value} <span className="text-[10px] text-white/20 font-black uppercase">Nodes Map</span></p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Bar 
                                dataKey="value" 
                                radius={[0, 16, 16, 0]} 
                                barSize={40}
                              >
                                {analytics.classDistribution.slice(0, 6).map((_, idx) => (
                                  <Cell key={`cell-${idx}`} fill={`url(#colorGradient-${idx % CLASS_COLORS.length})`} />
                                ))}
                              </Bar>
                            </RechartsBarChart>
                          </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </FadeInStaggerItem>

                <FadeInStaggerItem>
                  <Card className="border-white/5 shadow-2xl rounded-[3.5rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden h-full border-t-white/10">
                    <CardHeader className="border-b border-white/5 bg-white/[0.01] px-12 py-10 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-inner border border-emerald-500/20">
                          <Activity className="h-7 w-7 text-emerald-500" />
                        </div>
                        <div className="space-y-1.5">
                          <h3 className="text-2xl font-display font-black text-white tracking-tight">Global Outcome Vectors</h3>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Global success vs failure parity</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-12">
                      <div className="h-96 flex items-center justify-center relative">
                         <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(var(--primary),0.05)_0%,transparent_70%)] animate-pulse" />
                         <div className="relative z-10 w-full h-full">
                           <PieChart
                            data={[
                              { label: "Successful", value: analytics.totals.pass, color: "#10b981" },
                              { label: "Unsuccessful", value: analytics.totals.fail, color: "#ef4444" },
                            ]}
                          />
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeInStaggerItem>
              </div>
            </FadeInStagger>
          )}
        </main>
      </AppShell>
    </Protected>
  );
}
