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
  Cell,
  AreaChart,
  Area,
  CartesianGrid
} from "recharts";
import { AlertCircle } from "lucide-react";

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

const CLASS_COLORS = ["#2563eb", "#8b5cf6", "#6366f1", "#4f46e5", "#10b981", "#f59e0b"];


type BatchHistory = {
  id: string;
  uploadDate: string;
  passRate: number;
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = React.useState<AnalyticsSummary | null>(null);
  const [batchHistory, setBatchHistory] = React.useState<BatchHistory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [analyticsRes, recentRes] = await Promise.all([
          api.get("/batches/analytics/summary"),
          api.get("/batches/recent")
        ]);
        setAnalytics(analyticsRes.data || null);
        
        const history = (recentRes.data.batches || [])
          .map((b: any) => ({
            id: b.id,
            uploadDate: new Date(b.uploadDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            passRate: Math.round((b.passCount / b.totalStudents) * 100) || 0
          }))
          .reverse();
        setBatchHistory(history);
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <Protected>
      <AppShell>
        <PageHeader 
          title={
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <span className="font-display font-black text-2xl text-foreground tracking-tight block">Performance Analytics</span>
                <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mt-0.5">Academic Data Insights</p>
              </div>
            </div>
          }
          subtitle="Deep analytical insights and merit distribution across all institutional batches." 
        />

        <main className="mx-auto max-w-7xl px-6 py-10 relative z-10">
          {loading ? (
             <div className="space-y-10">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-accent/30 animate-pulse rounded-[2rem]" />)}
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2 h-[400px] bg-accent/30 animate-pulse rounded-[2.5rem]" />
                  <div className="h-[400px] bg-accent/30 animate-pulse rounded-[2.5rem]" />
                </div>
             </div>
          ) : error ? (
            <div className="py-20 text-center">
               <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-4" />
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{error}</p>
            </div>
          ) : (
            <FadeInStagger className="space-y-10">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  tone="blue"
                  label="Total Students"
                  value={analytics?.totals.totalStudents || 0}
                  icon={<GraduationCap />}
                />
                <StatCard
                  tone="indigo"
                  label="Pass Percentage"
                  value={`${analytics?.totals.passRate || 0}%`}
                  icon={<Percent />}
                />
                <StatCard
                  tone="red"
                  label="Critical Dropouts"
                  value={analytics?.totals.dropped || 0}
                  icon={<X />}
                  hint="4+ KTs identified"
                />
                <StatCard
                  tone="orange"
                  label="KT Failures"
                  value={analytics?.totals.totalKTs || 0}
                  icon={<Star />}
                  hint="Aggregate backlog index"
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Result Trend Graph */}
                <FadeIn className="lg:col-span-2">
                  <Card className="border-border shadow-md rounded-[2rem] bg-white overflow-hidden">
                    <div className="p-6 border-b border-border bg-accent/30 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                            <Activity className="h-5 w-5" />
                         </div>
                         <div>
                            <h3 className="text-lg font-display font-black text-foreground tracking-tight">Academic Trend</h3>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Pass % across recent batches</p>
                         </div>
                       </div>
                    </div>
                    <CardContent className="p-6">
                       <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={batchHistory}>
                              <defs>
                                <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis 
                                dataKey="uploadDate" 
                                stroke="#94a3b8" 
                                fontSize={9} 
                                fontWeight={700}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis 
                                stroke="#94a3b8" 
                                fontSize={9} 
                                fontWeight={700}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `${v}%`}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'white', 
                                  borderRadius: '0.75rem', 
                                  border: '1px solid #e2e8f0',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                labelStyle={{ fontWeight: 900, fontSize: '10px' }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="passRate" 
                                stroke="#2563eb" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorPass)" 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                       </div>
                    </CardContent>
                  </Card>
                </FadeIn>

                {/* Highest Achievement */}
                <FadeIn delay={0.2}>
                  <Card className="border-primary/20 shadow-lg rounded-[2.5rem] bg-gradient-to-br from-primary to-blue-700 p-0.5 overflow-hidden h-full group">
                    <div className="bg-white rounded-[2.4rem] p-8 h-full relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-6 opacity-5">
                          <Trophy className="h-24 w-24 rotate-12" />
                       </div>
                       
                       <div className="relative z-10 space-y-8">
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                <Trophy className="h-5 w-5" />
                             </div>
                             <h3 className="text-lg font-display font-black text-foreground">Top Achiever</h3>
                          </div>

                          <div className="text-center py-4">
                             <h4 className="text-2xl font-display font-black text-foreground leading-tight px-2">{analytics?.topper.name || "N/A"}</h4>
                             <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-2">Academic Lead</p>
                          </div>

                          <div className="p-6 rounded-[1.5rem] bg-accent border border-border flex flex-col items-center gap-1">
                             <span className="text-4xl font-display font-black text-primary tabular-nums">{analytics?.topper.percentage}%</span>
                             <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Calculated Merit</span>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                             <div className="p-3 rounded-xl bg-accent border border-border">
                                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Index</p>
                                <p className="text-[10px] font-black text-foreground truncate">{analytics?.topper.enrollmentNumber || "-"}</p>
                             </div>
                             <div className="p-3 rounded-xl bg-accent border border-border">
                                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Registry</p>
                                <p className="text-[10px] font-black text-foreground truncate">{analytics?.topper.seatNumber || "-"}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                  </Card>
                </FadeIn>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Subject Performance */}
                <Card className="border-border shadow-md rounded-[2rem] bg-white overflow-hidden">
                  <div className="p-6 border-b border-border bg-accent/30 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-display font-black text-foreground">Subject Excellence</h3>
                  </div>
                  <CardContent className="p-6">
                    <div className="h-72">
                      <BarChart
                        data={analytics?.subjectAverages
                          .filter((s) => typeof s.avgPercentage === "number")
                          .slice(0, 6)
                          .map((s) => ({ label: s.subject, value: Number(s.avgPercentage || 0) })) || []}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Merit Distribution */}
                <Card className="border-border shadow-md rounded-[2rem] bg-white overflow-hidden">
                  <div className="p-6 border-b border-border bg-accent/30 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                      <Percent className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-display font-black text-foreground">Merit Distribution</h3>
                  </div>
                  <CardContent className="p-6">
                     <div className="h-72">
                       <ResponsiveContainer width="100%" height="100%">
                         <RechartsBarChart data={analytics?.classDistribution.slice(0, 5) || []} layout="vertical">
                           <XAxis type="number" hide />
                           <YAxis 
                            type="category" 
                            dataKey="label" 
                            tick={{ fontSize: 8, fontWeight: 800, fill: "#64748b" }} 
                            width={100}
                            axisLine={false}
                            tickLine={false}
                           />
                           <Tooltip cursor={{ fill: '#f1f5f9' }} />
                           <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                             {(analytics?.classDistribution || []).map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={CLASS_COLORS[index % CLASS_COLORS.length]} />
                             ))}
                           </Bar>
                         </RechartsBarChart>
                       </ResponsiveContainer>
                     </div>
                  </CardContent>
                </Card>
              </div>
            </FadeInStagger>
          )}
        </main>
      </AppShell>
    </Protected>
  );
}
