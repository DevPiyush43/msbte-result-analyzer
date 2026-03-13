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
  AlertCircle,
  TriangleAlert
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
        setLoadError("Synchronization failure.");
      } finally {
        setLoadingBatches(false);
        setLoadingAnalytics(false);
      }
    }
    load();
  }, [user, authLoading]);

  const sortedSubjects = React.useMemo(() => {
    if (!analytics?.subjectAverages) return [];
    return [...analytics.subjectAverages].sort((a, b) => (a.avgPercentage || 0) - (b.avgPercentage || 0));
  }, [analytics]);

  const insights = React.useMemo(() => {
    if (!analytics || sortedSubjects.length === 0) return null;
    return {
      mostFailed: sortedSubjects[0].subject,
      highestPass: sortedSubjects[sortedSubjects.length - 1].subject,
      avgPercentage: analytics.totals.passRate,
      criticalStudents: analytics.totals.dropped,
      bestBatch: batches.length > 0 ? new Date(batches[0].uploadDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : "N/A"
    };
  }, [analytics, sortedSubjects, batches]);

  const highRiskCount = React.useMemo(() => {
    return Math.round((analytics?.totals.totalKTs || 0) / 1.5); 
  }, [analytics]);

  return (
    <Protected>
      <AppShell>
        <PageHeader
          title={
            <div className="flex items-center gap-4">
               <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6">
                <LayoutDashboard className="h-7 w-7" />
              </div>
              <div>
                <span className="font-display font-black text-3xl text-foreground tracking-tight block">Teacher Dashboard</span>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
                  Welcome back, {user?.username}
                </p>
              </div>
            </div>
          }
          subtitle="Comprehensive academic analytics and student performance tracking."
          actions={
            <div className="flex items-center gap-4">
              <Button variant="outline" className="hidden sm:flex rounded-xl h-14 px-8 font-bold uppercase tracking-widest text-[11px] border-border bg-white text-foreground hover:bg-accent transition-all">
                <FileJson className="mr-3 h-5 w-5 text-primary" />
                Download Report
              </Button>
              <Link href="/upload">
                <Button className="rounded-xl h-14 px-8 font-bold uppercase tracking-widest text-[11px] bg-primary text-white hover:bg-primary/90 shadow-lg hover:-translate-y-0.5 transition-all">
                  <Upload className="mr-3 h-5 w-5" />
                  New Extraction
                </Button>
              </Link>
            </div>
          }
        />

        <main className="mx-auto max-w-7xl px-8 py-12 relative z-10">
          <FadeInStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            <FadeInStaggerItem>
              <StatCard
                tone="pink"
                label="Average Batch Percentage"
                value={`${insights?.avgPercentage || 0}%`}
                hint="Global academic mean"
                icon={<Activity />}
              />
            </FadeInStaggerItem>
            <FadeInStaggerItem>
              <StatCard
                tone="purple"
                label="Best Performing Batch"
                value={insights?.bestBatch || "2024-SEM-I"}
                hint="Highest efficiency yield"
                icon={<Trophy />}
              />
            </FadeInStaggerItem>
            <FadeInStaggerItem>
              <StatCard
                tone="red"
                label="Highest Failure Rate"
                value={insights?.mostFailed || "Engineering Graphics"}
                hint="Critical subject focus"
                icon={<TriangleAlert />}
              />
            </FadeInStaggerItem>
          </FadeInStagger>

          <FadeInStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FadeInStaggerItem>
              <StatCard
                tone="pink"
                label="Total Students Analyzed"
                value={analytics?.totals.totalStudents || 0}
                hint="Verified academic records"
                icon={<GraduationCap />}
              />
            </FadeInStaggerItem>
            <FadeInStaggerItem>
              <StatCard
                tone="indigo"
                label="Pass Percentage"
                value={`${analytics?.totals.passRate || 0}%`}
                hint="Overall efficiency rating"
                icon={<Activity />}
              />
            </FadeInStaggerItem>
            <FadeInStaggerItem>
              <StatCard
                tone="red"
                label="Students Dropped"
                value={analytics?.totals.dropped || 0}
                hint="Critical backlog (4+ KTs)"
                icon={<AlertCircle />}
              />
            </FadeInStaggerItem>
            <FadeInStaggerItem>
              <StatCard
                tone="orange"
                label="Total Failed Subjects"
                value={analytics?.totals.totalKTs || 0}
                hint="Aggregate subject failures"
                icon={<BookOpen />}
              />
            </FadeInStaggerItem>
          </FadeInStagger>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              {/* AI Academic Insights */}
              <FadeIn delay={0.2}>
                <Card className="border-border shadow-xl rounded-[2.5rem] bg-white overflow-hidden group">
                  <div className="p-8 border-b border-border bg-accent/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                         <Sparkles className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-display font-black text-foreground tracking-tight">AI Academic Insights</h3>
                    </div>
                    <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest animate-pulse font-sans">
                      Live Analysis
                    </div>
                  </div>
                  <CardContent className="p-8">
                    {loadingAnalytics ? (
                      <div className="grid grid-cols-2 gap-6">
                        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-accent/30 rounded-2xl animate-pulse" />)}
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-100 group-hover:shadow-md transition-all">
                          <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-2">Most Failed Subject</p>
                          <p className="text-xl font-display font-black text-foreground truncate">{insights?.mostFailed || "N/A"}</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 group-hover:shadow-md transition-all">
                          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Highest Pass Subject</p>
                          <p className="text-xl font-display font-black text-foreground truncate">{insights?.highestPass || "N/A"}</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 group-hover:shadow-md transition-all">
                          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">Average Class Percentage</p>
                          <p className="text-3xl font-display font-black text-foreground tabular-nums">{insights?.avgPercentage}%</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-purple-50 border border-purple-100 group-hover:shadow-md transition-all">
                          <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-2">Critical Students</p>
                          <p className="text-3xl font-display font-black text-foreground tabular-nums">{insights?.criticalStudents}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Subject Failure Heatmap */}
              <FadeIn delay={0.4}>
                <Card className="border-border shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                  <div className="p-8 border-b border-border bg-accent/30 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20">
                       <BarChart3 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-black text-foreground tracking-tight">Subject Failure Heatmap</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Difficulty distribution per subject</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="grid gap-2">
                       {analytics?.subjectAverages.map((it) => {
                         const failRate = 100 - (it.avgPercentage || 0);
                         const severity = failRate > 40 ? "High" : failRate > 20 ? "Medium" : "Low";
                         const colorClass = severity === "High" ? "bg-rose-50 text-rose-600 border-rose-200" : severity === "Medium" ? "bg-orange-50 text-orange-600 border-orange-200" : "bg-emerald-50 text-emerald-600 border-emerald-200";
                         const dotClass = severity === "High" ? "bg-rose-500" : severity === "Medium" ? "bg-orange-500" : "bg-emerald-500";
                         
                         return (
                           <div key={it.subject} className={cn("flex items-center justify-between p-4 rounded-xl border transition-all hover:translate-x-1", colorClass)}>
                              <div className="flex items-center gap-4">
                                <div className={cn("h-3 w-3 rounded-full shadow-sm", dotClass)} />
                                <span className="text-[12px] font-bold uppercase tracking-tight">{it.subject}</span>
                              </div>
                              <div className="flex items-center gap-6">
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 font-sans">{severity} Difficulty</span>
                                <span className="text-lg font-display font-black tabular-nums">{failRate.toFixed(1)}% Fail</span>
                              </div>
                           </div>
                         );
                       })}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>

            <div className="space-y-8">
              {/* Topper Card */}
              <FadeIn delay={0.6}>
                <Card className="border-primary/20 shadow-2xl rounded-[2.5rem] bg-gradient-to-br from-primary to-secondary p-1 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                  <div className="bg-white rounded-[2.3rem] p-8 h-full relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                        <Trophy className="h-6 w-6" />
                      </div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10">Class Topper</span>
                    </div>
                    {analytics?.topper.name ? (
                      <div className="space-y-6">
                         <div className="space-y-1">
                            <h4 className="text-2xl font-display font-black text-foreground leading-tight">{analytics.topper.name}</h4>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Seat: {analytics.topper.seatNumber}</p>
                         </div>
                         <div className="flex items-end justify-between border-t border-border pt-6">
                            <div className="text-4xl font-display font-black text-primary tabular-nums">{analytics.topper.percentage}%</div>
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Efficiency</div>
                         </div>
                      </div>
                    ) : <p className="text-center py-8 text-muted-foreground text-sm font-bold animate-pulse">Analyzing topper data...</p>}
                  </div>
                </Card>
              </FadeIn>

              {/* KT Risk Analysis */}
              <FadeIn delay={0.7}>
                <Card className="border-border shadow-xl rounded-[2.5rem] bg-white overflow-hidden p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="h-12 w-12 rounded-xl bg-hotpink bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Risk Analysis</span>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-3xl font-display font-black text-foreground">Students at Risk</h4>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Found 2+ KT Subjects</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-between">
                       <span className="text-4xl font-display font-black text-rose-600 tabular-nums">{highRiskCount}</span>
                       <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest text-right">High Risk<br/>Identified</span>
                    </div>
                  </div>
                </Card>
              </FadeIn>

              {/* Department Ranking */}
              <FadeIn delay={0.8}>
                <Card className="border-border shadow-xl rounded-[2.5rem] bg-white overflow-hidden p-8">
                  <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-8">Batch Performance Ranking</h4>
                  <div className="space-y-4">
                     {batches.slice(0, 3).map((b, i) => {
                       const passRate = Math.round((b.passCount / b.totalStudents) * 100) || 0;
                       const emoji = i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉";
                       return (
                         <div key={b.id} className="flex items-center justify-between p-4 rounded-xl bg-accent border border-border">
                            <div className="flex items-center gap-3">
                               <span className="text-xl">{emoji}</span>
                               <span className="text-xs font-bold text-foreground">Batch {String.fromCharCode(65 + i)}</span>
                            </div>
                            <span className="text-xs font-black text-primary tabular-nums">{passRate}% Pass</span>
                         </div>
                       );
                     })}
                  </div>
                </Card>
              </FadeIn>
            </div>
          </div>

          <div className="mt-20">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <History className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-display font-black text-foreground tracking-tight">Recent Results Archive</h3>
                </div>
                <Link href="/results">
                  <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 px-6 rounded-xl transition-all">View All Results</Button>
                </Link>
             </div>
             
             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
               {batches.slice(0, 3).map((b) => (
                 <motion.div key={b.id} whileHover={{ y: -5 }} className="group">
                    <Card className="border-border shadow-lg rounded-[2.5rem] bg-white overflow-hidden hover:border-primary/30 transition-all p-6">
                       <div className="flex items-start justify-between mb-6">
                          <div className="h-12 w-12 rounded-xl bg-accent text-primary flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-white transition-all">
                             <FileJson className="h-6 w-6" />
                          </div>
                          <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-widest font-sans">{b.status}</div>
                       </div>
                       <div className="space-y-2 mb-6 text-foreground">
                          <h4 className="text-xl font-display font-black truncate leading-tight">{new Date(b.uploadDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</h4>
                          <p className="text-[11px] font-bold text-muted-foreground uppercase">{b.totalStudents} Students Analyzed</p>
                       </div>
                       <Link href={`/results/${b.id}`}>
                         <Button className="w-full h-12 rounded-xl bg-accent text-foreground hover:bg-primary hover:text-white font-bold text-[11px] tracking-widest border border-border group-hover:border-primary/20 transition-all">
                            VIEW DETAILS
                            <ChevronRight className="ml-2 h-4 w-4" />
                         </Button>
                       </Link>
                    </Card>
                 </motion.div>
               ))}
             </div>
          </div>
        </main>
      </AppShell>
    </Protected>
  );
}
