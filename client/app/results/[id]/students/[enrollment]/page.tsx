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
               <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="font-display font-black text-2xl text-foreground tracking-tight block">Student Profile</span>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Academic Record</p>
              </div>
            </div>
          }
          subtitle={
            <div className="flex items-center gap-3 text-muted-foreground mt-1">
              <span className="text-[10px] font-bold uppercase tracking-widest">Enrollment No:</span>
              <span className="font-mono text-sm font-bold text-primary px-3 py-1 rounded-xl bg-primary/5 border border-primary/10">{enrollment || "N/A"}</span>
            </div>
          }
          backHref={`/results/${batchId}`}
          backLabel="Back to Batch"
          actions={
             <Button 
               variant="outline" 
               className="h-10 rounded-xl font-bold uppercase tracking-widest text-[9px] border-border bg-white text-foreground hover:bg-primary hover:text-white transition-all shadow-sm px-6"
               onClick={() => window.print()}
             >
                <Sparkles className="mr-3 h-4 w-4 text-amber-500" />
                Download Result
             </Button>
          }
        />

        <main className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-64 gap-8">
                <div className="relative">
                  <Activity className="h-16 w-16 animate-spin text-primary opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  </div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Loading Performance Data...</p>
             </div>
          ) : error ? (
            <FadeIn className="p-20 text-center rounded-[3rem] border border-border bg-white shadow-xl max-w-2xl mx-auto">
               <div className="h-20 w-20 rounded-[2rem] bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-8">
                <Shield className="h-10 w-10 text-rose-500 opacity-50" />
               </div>
               <h3 className="text-xl font-display font-black text-foreground mb-3 uppercase tracking-tight">Access Denied</h3>
               <p className="text-sm font-bold text-rose-600/60 uppercase tracking-widest leading-relaxed">{error}</p>
               <Button variant="outline" className="mt-10 rounded-xl h-14 px-10 font-bold uppercase tracking-widest text-[11px] border-border bg-white text-foreground hover:bg-accent transition-all" onClick={() => window.location.reload()}>Retry Connection</Button>
            </FadeIn>
          ) : !student ? (
            <div className="p-40 text-center text-muted-foreground/30 font-bold uppercase tracking-widest">No student data found.</div>
          ) : (
            <div className="space-y-12">
              <FadeInStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                <FadeInStaggerItem>
                  <StatCard
                    tone="blue"
                    label="Full Name"
                    value={<span className="text-lg truncate block font-display font-black tracking-tight">{student.name || "-"}</span>}
                    icon={<User className="h-5 w-5" />}
                    className="p-8"
                  />
                </FadeInStaggerItem>
                <FadeInStaggerItem>
                  <StatCard
                    tone="indigo"
                    label="Seat Number"
                    value={student.enrollmentNumber || "-"}
                    icon={<Hash className="h-5 w-5" />}
                    className="p-8"
                  />
                </FadeInStaggerItem>
                <FadeInStaggerItem>
                   <StatCard
                    tone="pink"
                    label="Enrollment ID"
                    value={student.marksheetEnrollmentNumber || "-"}
                    icon={<IdCard className="h-5 w-5" />}
                    className="p-8"
                  />
                </FadeInStaggerItem>
                <FadeInStaggerItem>
                  <StatCard
                    tone={student.resultStatus === "Pass" ? "green" : "red"}
                    label="Percentage"
                    value={typeof student.percentage === "number" ? `${student.percentage}%` : "-"}
                    hint={<span className="uppercase font-bold tracking-widest text-[9px] text-muted-foreground">{student.resultClass || "-"}</span>}
                    icon={<BadgePercent className="h-5 w-5" />}
                    className="p-8"
                  />
                </FadeInStaggerItem>
                <FadeInStaggerItem>
                  <StatCard
                    tone={student.errorMessage ? "red" : student.resultStatus === "Pass" ? "green" : "indigo"}
                    label="Overall Status"
                    value={student.errorMessage ? "Error" : student.resultStatus || "Unknown"}
                    hint={<span className="uppercase font-bold tracking-widest text-[9px] text-muted-foreground">{student.errorMessage ? "Fault Detected" : "Verified"}</span>}
                    icon={<Shield className="h-5 w-5" />}
                    className="p-8"
                  />
                </FadeInStaggerItem>
              </FadeInStagger>

              <FadeIn delay={0.2}>
                <Card className="border-border shadow-xl rounded-[3rem] bg-white overflow-hidden">
                  <CardHeader className="border-b border-border bg-accent/20 px-12 py-10">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                          <BookOpen className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-display font-black text-foreground tracking-tight">Subject-wise Analysis</h3>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Detailed breakdown of academic performance</p>
                        </div>
                      </div>
                      <div className="h-16 w-16 rounded-[2rem] bg-accent/50 border border-border flex items-center justify-center">
                         <Trophy className={cn(
                           "h-8 w-8 transition-all duration-500", 
                           student.resultStatus === "Pass" ? "text-amber-500 drop-shadow-md scale-110" : "text-muted-foreground/20 grayscale"
                         )} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                  {subjects.length === 0 ? (
                    <div className="p-40 text-center flex flex-col items-center justify-center gap-6">
                       <BookOpen className="h-16 w-16 text-muted-foreground/20" />
                       <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">No subject marks available.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-accent/5 border-b border-border">
                            <th className="px-12 py-8 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Subject Name</th>
                            <th className="px-12 py-8 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Total Marks</th>
                            <th className="px-12 py-8 text-[11px] font-bold text-muted-foreground uppercase tracking-widest font-mono">FA-TH</th>
                            <th className="px-12 py-8 text-[11px] font-bold text-muted-foreground uppercase tracking-widest font-mono">SA-TH</th>
                            <th className="px-12 py-8 text-[11px] font-bold text-muted-foreground uppercase tracking-widest font-mono">FA-PR</th>
                            <th className="px-12 py-8 text-[11px] font-bold text-muted-foreground uppercase tracking-widest font-mono">SA-PR</th>
                            <th className="px-12 py-8 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">SLA Marks</th>
                            <th className="px-12 py-8 text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-right">Credits</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {subjects.map(([sub, m]) => (
                            <tr key={sub} className="group hover:bg-accent/5 transition-all duration-500">
                              <td className="px-12 py-8">
                                <span className="font-display font-black text-foreground text-base group-hover:text-primary transition-colors tracking-tight uppercase whitespace-pre-wrap">{sub}</span>
                              </td>
                              <td className="px-12 py-8">
                                <div className="flex items-center gap-4">
                                   <span className="font-display font-black text-2xl text-foreground tracking-tighter tabular-nums leading-none">{fmt(m.totalObt)}</span>
                                   <span className="text-muted-foreground/20 text-xl font-light">/</span>
                                   <span className="text-muted-foreground/60 font-bold text-sm tracking-tighter tabular-nums">{fmt(m.totalMax)}</span>
                                </div>
                              </td>
                              <td className="px-12 py-8 text-muted-foreground/60 font-mono text-xs tabular-nums group-hover/row:text-primary transition-colors">
                                <span className="font-bold text-indigo-600">{fmt(m.faThObt)}</span> <span className="text-[10px] opacity-50">PT</span>
                              </td>
                              <td className="px-12 py-8 text-muted-foreground/60 font-mono text-xs tabular-nums group-hover/row:text-primary transition-colors">
                                <span className="font-bold text-primary">{fmt(m.saThObt)}</span> <span className="text-[10px] opacity-50">PT</span>
                              </td>
                              <td className="px-12 py-8 text-muted-foreground/60 font-mono text-xs tabular-nums group-hover/row:text-primary transition-colors">
                                <span className="font-bold text-indigo-600">{fmt(m.faPrObt)}</span> <span className="text-[10px] opacity-50">PT</span>
                              </td>
                              <td className="px-12 py-8 text-muted-foreground/60 font-mono text-xs tabular-nums group-hover/row:text-primary transition-colors">
                                <span className="font-bold text-primary">{fmt(m.saPrObt)}</span> <span className="text-[10px] opacity-50">PT</span>
                              </td>
                              <td className="px-12 py-8 text-muted-foreground/60 font-mono text-xs tabular-nums">
                                <span className="font-bold text-foreground/80">{fmt(m.slaObt)}</span> <span className="opacity-20 text-[10px]">/</span> <span className="opacity-40">{fmt(m.slaMax)}</span>
                              </td>
                              <td className="px-12 py-8 text-right">
                                <div className="inline-flex h-11 w-11 rounded-xl bg-primary/5 border border-primary/10 group-hover:border-primary/30 items-center justify-center font-bold text-xs text-primary shadow-sm transition-all">
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
                  <Card className="border-border shadow-xl rounded-[3rem] bg-white overflow-hidden h-full">
                    <CardHeader className="border-b border-border bg-accent/10 px-10 py-8">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-display font-black text-foreground">Result Details</h3>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Academic capture timestamps</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                      <div className="flex items-center justify-between p-6 rounded-3xl bg-accent/20 border border-border group transition-all hover:bg-accent/30">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest transition-colors">Captured On</span>
                        <span className="text-[11px] font-bold text-foreground/70 uppercase tracking-widest tabular-nums">
                          {student.fetchedAt ? new Date(student.fetchedAt).toLocaleString() : "Never Synced"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-6 rounded-3xl bg-accent/20 border border-border group transition-all hover:bg-accent/30">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest transition-colors">Total Aggregated Marks</span>
                        <span className="text-2xl font-display font-black text-primary tracking-tighter">
                          {typeof student.totalMarks === "number" ? student.totalMarks : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-6 rounded-3xl bg-accent/20 border border-border group transition-all hover:bg-accent/30">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest transition-colors">Result Class</span>
                        <span className="text-sm font-bold text-foreground uppercase tracking-widest truncate max-w-[180px]">
                           {student.resultClass || "REGULAR"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>

                <FadeIn delay={0.4}>
                  <Card className="border-border shadow-xl rounded-[3rem] bg-white overflow-hidden h-full">
                    <CardHeader className="border-b border-border bg-accent/10 px-10 py-8">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                          <Database className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-display font-black text-foreground">Batch Context</h3>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Parent dataset relationship</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                      <div className="flex items-center justify-between p-6 rounded-3xl bg-accent/20 border border-border group transition-all hover:bg-accent/30">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest transition-colors">Batch Status</span>
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-xl border transition-all",
                          data?.batch?.status === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-primary/5 text-primary border-primary/10"
                        )}>
                          {data?.batch?.status || "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-6 rounded-3xl bg-accent/20 border border-border group transition-all hover:bg-accent/30">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest transition-colors">Batch Processed Date</span>
                        <span className="text-xs font-bold text-foreground/70 uppercase tracking-widest">
                           {data?.batch?.uploadDate ? new Date(data.batch.uploadDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-6 rounded-3xl bg-accent/20 border border-border group transition-all hover:bg-accent/30">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest transition-colors">Batch Size</span>
                        <span className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-3">
                           <GraduationCap className="h-4 w-4 text-primary" />
                           {data?.batch?.totalStudents || 0} Students
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
