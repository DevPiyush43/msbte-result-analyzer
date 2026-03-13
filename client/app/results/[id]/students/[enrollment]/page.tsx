"use client";

import Link from "next/link";
import * as React from "react";
import { useParams } from "next/navigation";
import { 
  BadgePercent, 
  Hash, 
  IdCard, 
  User, 
  BookOpen, 
  Calendar, 
  Activity, 
  Shield, 
  Clock, 
  ChevronLeft,
  GraduationCap,
  Sparkles,
  Trophy,
  Database
} from "lucide-react";

import { Protected } from "@/components/Protected";
import { AppShell } from "@/components/AppShell";
import { FadeIn, FadeInStagger, FadeInStaggerItem } from "@/components/Animated";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { cn } from "@/lib/utils";

type SubjectMarksEntry = {
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
};

type StudentResult = {
  enrollmentNumber: string;
  marksheetEnrollmentNumber?: string | null;
  seatNumber?: string | null;
  name?: string | null;
  totalMarks?: number | null;
  percentage?: number | null;
  resultStatus?: "Pass" | "Fail" | "Unknown";
  resultClass?: string | null;
  fetchedAt?: string | null;
  errorMessage?: string | null;
  subjectMarks?: Record<string, SubjectMarksEntry> | null;
};

type StudentDetailResponse = {
  batch: {
    id: string;
    uploadDate: string;
    status: string;
    totalStudents: number;
  };
  student: StudentResult;
};

function fmt(v: any) {
  if (v === null || v === undefined || v === "" || v === "-" || v === "--") return "-";
  return String(v);
}

export default function StudentDetailPage() {
  const params = useParams<{ id: string; enrollment: string }>();
  const batchId = params?.id;
  const enrollment = params?.enrollment ? decodeURIComponent(String(params.enrollment)) : "";

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<StudentDetailResponse | null>(null);

  React.useEffect(() => {
    async function load() {
      if (!batchId || !enrollment) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/batches/${batchId}/students/${encodeURIComponent(enrollment)}`);
        setData(res.data);
      } catch (err: any) {
        const message = err?.response?.data?.error?.message || "Failed to load student";
        setError(message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [batchId, enrollment]);

  const student = data?.student;
  const subjects = React.useMemo(() => {
    const sm = student?.subjectMarks;
    if (!sm || typeof sm !== "object") return [] as Array<[string, SubjectMarksEntry]>;
    return Object.entries(sm);
  }, [student?.subjectMarks]);

  return (
    <Protected>
      <AppShell>
        <PageHeader
          title={
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]">
                <IdCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="font-display font-black text-3xl text-white tracking-tight block">Node Profile</span>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mt-1">Personnel Authentication Registry</p>
              </div>
            </div>
          }
          subtitle={
            <div className="flex items-center gap-3 text-white/40 mt-1">
              <span className="text-[10px] font-black uppercase tracking-widest">Primary Vector:</span>
              <span className="font-mono text-sm font-black text-primary px-3 py-1 rounded-xl bg-primary/5 border border-primary/10 shadow-inner">{enrollment || "UNA_VOID_ID"}</span>
            </div>
          }
          backHref={`/results/${batchId}`}
          backLabel="Batch Registry"
          actions={
             <Button variant="outline" className="h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] border-white/10 bg-white/5 text-white hover:bg-white hover:text-black hover:border-transparent transition-all shadow-2xl px-8">
                <Sparkles className="mr-3 h-4 w-4 text-amber-500" />
                Export Profile
             </Button>
          }
        />

        <main className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-64 gap-8">
                <div className="relative">
                  <Activity className="h-16 w-16 animate-spin text-primary opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),1)]" />
                  </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 animate-pulse">Syncing Student Telemetry...</p>
             </div>
          ) : error ? (
            <FadeIn className="p-20 text-center rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl max-w-2xl mx-auto">
               <div className="h-20 w-20 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-8">
                <Shield className="h-10 w-10 text-rose-500 opacity-50" />
               </div>
               <h3 className="text-xl font-display font-black text-white mb-3 uppercase tracking-tight">Handshake Failed</h3>
               <p className="text-sm font-black text-rose-500/60 uppercase tracking-widest leading-relaxed">{error}</p>
               <Button variant="outline" className="mt-10 rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[11px] border-white/10 bg-white/5 text-white hover:bg-white hover:text-black transition-all" onClick={() => window.location.reload()}>Retry Protocol</Button>
            </FadeIn>
          ) : !student ? (
            <div className="p-40 text-center text-white/10 font-black uppercase tracking-[0.5em]">No node data converged.</div>
          ) : (
            <div className="space-y-16">
              <FadeInStagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
                <FadeInStaggerItem>
                  <StatCard
                    tone="blue"
                    label="FullName / Alias"
                    value={<span className="text-lg truncate block font-display font-black tracking-tight">{student.name || "-"}</span>}
                    icon={<User className="h-5 w-5" />}
                    className="p-8 rounded-[2rem] border-white/5 bg-white/[0.02] shadow-2xl"
                  />
                </FadeInStaggerItem>
                <FadeInStaggerItem>
                  <StatCard
                    tone="indigo"
                    label="Seat Registry"
                    value={student.enrollmentNumber || "-"}
                    icon={<Hash className="h-5 w-5" />}
                    className="p-8 rounded-[2rem] border-white/5 bg-white/[0.02] shadow-2xl"
                  />
                </FadeInStaggerItem>
                <FadeInStaggerItem>
                   <StatCard
                    tone="purple"
                    label="Enrollment ID"
                    value={student.marksheetEnrollmentNumber || "-"}
                    icon={<IdCard className="h-5 w-5" />}
                    className="p-8 rounded-[2rem] border-white/5 bg-white/[0.02] shadow-2xl"
                  />
                </FadeInStaggerItem>
                <FadeInStaggerItem>
                  <StatCard
                    tone={student.resultStatus === "Pass" ? "green" : "red"}
                    label="Efficiency Yield"
                    value={typeof student.percentage === "number" ? `${student.percentage}%` : "-"}
                    hint={<span className="uppercase font-black tracking-[0.3em] text-[9px] text-white/30">{student.resultClass || "-"}</span>}
                    icon={<BadgePercent className="h-5 w-5" />}
                    className="p-8 rounded-[2rem] border-white/5 bg-white/[0.02] shadow-2xl"
                  />
                </FadeInStaggerItem>
                <FadeInStaggerItem>
                  <StatCard
                    tone={student.errorMessage ? "red" : student.resultStatus === "Pass" ? "green" : "indigo"}
                    label="Protocol Status"
                    value={student.errorMessage ? "Error" : student.resultStatus || "Unknown"}
                    hint={<span className="uppercase font-black tracking-widest text-[9px] text-white/30">{student.errorMessage ? "Fault Detected" : "Operational"}</span>}
                    icon={<Shield className="h-5 w-5" />}
                    className="p-8 rounded-[2rem] border-white/5 bg-white/[0.02] shadow-2xl"
                  />
                </FadeInStaggerItem>
              </FadeInStagger>

              <FadeIn delay={0.2}>
                <Card className="border-white/5 shadow-2xl rounded-[3rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden border-t-white/10">
                  <CardHeader className="border-b border-white/5 bg-white/[0.01] px-12 py-10">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.05)]">
                          <BookOpen className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-display font-black text-white tracking-tight">Subject-wise Analytics</h3>
                          <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em] mt-1">Parsed academic statement breakdown</p>
                        </div>
                      </div>
                      <div className="h-16 w-16 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center shadow-inner group/trophy">
                         <Trophy className={cn(
                           "h-8 w-8 transition-all duration-500", 
                           student.resultStatus === "Pass" ? "text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-110" : "text-white/10 grayscale"
                         )} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                  {subjects.length === 0 ? (
                    <div className="p-40 text-center flex flex-col items-center justify-center gap-6">
                       <BookOpen className="h-16 w-16 text-white/10" />
                       <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20">No subject marks parsed for this node.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-white/[0.01] border-b border-white/5">
                            <th className="px-12 py-8 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Logical Subject</th>
                            <th className="px-12 py-8 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Net Score</th>
                            <th className="px-12 py-8 text-[12px] font-black text-white/20 uppercase tracking-[0.3em] font-mono">FA-TH</th>
                            <th className="px-12 py-8 text-[12px] font-black text-white/20 uppercase tracking-[0.3em] font-mono">SA-TH</th>
                            <th className="px-12 py-8 text-[12px] font-black text-white/20 uppercase tracking-[0.3em] font-mono">FA-PR</th>
                            <th className="px-12 py-8 text-[12px] font-black text-white/20 uppercase tracking-[0.3em] font-mono">SA-PR</th>
                            <th className="px-12 py-8 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">SLA Index</th>
                            <th className="px-12 py-8 text-[9px] font-black text-white/20 uppercase tracking-[0.3em] text-right">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {subjects.map(([sub, m]) => (
                            <tr key={sub} className="group hover:bg-white/[0.02] transition-all duration-500">
                              <td className="px-12 py-8">
                                <span className="font-display font-black text-white text-base group-hover:text-primary transition-colors tracking-tight uppercase whitespace-pre-wrap">{sub}</span>
                              </td>
                              <td className="px-12 py-8">
                                <div className="flex items-center gap-4">
                                   <span className="font-display font-black text-2xl text-white tracking-tighter tabular-nums">{fmt(m.totalObt)}</span>
                                   <span className="text-white/10 text-xl">/</span>
                                   <span className="text-white/40 font-black text-sm tracking-tighter tabular-nums">{fmt(m.totalMax)}</span>
                                </div>
                              </td>
                              <td className="px-12 py-8 text-white/40 font-mono text-xs tabular-nums group-hover:text-indigo-400 transition-colors">
                                <span className="font-black">{fmt(m.faThObt)}</span> <span className="text-[10px] opacity-30">PT</span>
                              </td>
                              <td className="px-12 py-8 text-white/40 font-mono text-xs tabular-nums group-hover:text-primary transition-colors">
                                <span className="font-black">{fmt(m.saThObt)}</span> <span className="text-[10px] opacity-30">PT</span>
                              </td>
                              <td className="px-12 py-8 text-white/40 font-mono text-xs tabular-nums group-hover:text-indigo-400 transition-colors">
                                <span className="font-black">{fmt(m.faPrObt)}</span> <span className="text-[10px] opacity-30">PT</span>
                              </td>
                              <td className="px-12 py-8 text-white/40 font-mono text-xs tabular-nums group-hover:text-primary transition-colors">
                                <span className="font-black">{fmt(m.saPrObt)}</span> <span className="text-[10px] opacity-30">PT</span>
                              </td>
                              <td className="px-12 py-8 text-white/40 font-mono text-xs tabular-nums">
                                <span className="font-black text-white/60">{fmt(m.slaObt)}</span> <span className="opacity-20 text-[10px]">/</span> <span className="opacity-30">{fmt(m.slaMax)}</span>
                              </td>
                              <td className="px-12 py-8 text-right">
                                <div className="inline-flex h-12 w-12 rounded-2xl bg-white/5 border border-white/5 group-hover:border-primary/20 items-center justify-center font-black text-sm text-primary shadow-2xl transition-all">
                                  {fmt(m.credits)}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  </CardContent>
                </Card>
              </FadeIn>

              <div className="grid gap-12 md:grid-cols-2">
                <FadeIn delay={0.3}>
                  <Card className="border-white/5 shadow-2xl rounded-[3rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden h-full border-t-white/10">
                    <CardHeader className="border-b border-white/5 bg-white/[0.01] px-10 py-8">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-display font-black text-white">Trace Telemetry</h3>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mt-0.5">Global ingress pulse data</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                      <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 group transition-all hover:bg-white/[0.04]">
                        <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] group-hover:text-white/40 transition-colors">Global Ingress</span>
                        <span className="text-[11px] font-black text-white/60 uppercase tracking-widest tabular-nums">
                          {student.fetchedAt ? new Date(student.fetchedAt).toLocaleString() : "Never Synced"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 group transition-all hover:bg-white/[0.04]">
                        <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] group-hover:text-white/40 transition-colors">Aggregated Raw Score</span>
                        <span className="text-2xl font-display font-black text-primary tracking-tighter">
                          {typeof student.totalMarks === "number" ? student.totalMarks : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 group transition-all hover:bg-white/[0.04]">
                        <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] group-hover:text-white/40 transition-colors">Logical Partition</span>
                        <span className="text-sm font-black text-white/80 uppercase tracking-widest truncate max-w-[180px]">
                           {student.resultClass || "Default Class"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>

                <FadeIn delay={0.4}>
                  <Card className="border-white/5 shadow-2xl rounded-[3rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden h-full border-t-white/10">
                    <CardHeader className="border-b border-white/5 bg-white/[0.01] px-10 py-8">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <Database className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-display font-black text-white">Cohort Context</h3>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mt-0.5">Node relationship mapping</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                      <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 group transition-all hover:bg-white/[0.04]">
                        <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] group-hover:text-white/40 transition-colors">Batch Status</span>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-xl border transition-all",
                          data?.batch?.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "bg-primary/10 text-primary border-primary/20"
                        )}>
                          {data?.batch?.status || "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 group transition-all hover:bg-white/[0.04]">
                        <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] group-hover:text-white/40 transition-colors">Cluster Created</span>
                        <span className="text-xs font-black text-white/60 uppercase tracking-widest">
                           {data?.batch?.uploadDate ? new Date(data.batch.uploadDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 group transition-all hover:bg-white/[0.04]">
                        <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] group-hover:text-white/40 transition-colors">Population Density</span>
                        <span className="text-sm font-black text-white/80 uppercase tracking-[0.2em] flex items-center gap-3">
                           <GraduationCap className="h-4 w-4 text-primary" />
                           {data?.batch?.totalStudents || 0} Nodes
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              </div>
            </div>
          )}
        </main>
      </AppShell>
    </Protected>
  );
}
