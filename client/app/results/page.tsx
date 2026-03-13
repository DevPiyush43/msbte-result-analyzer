"use client";

import Link from "next/link";
import * as React from "react";
import { 
  Calendar, 
  Eye, 
  GraduationCap, 
  ListChecks, 
  Trash2, 
  Upload,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Trophy,
  ChevronRight,
  Search,
  RefreshCw
} from "lucide-react";

import { Protected } from "@/components/Protected";
import { AppShell } from "@/components/AppShell";
import { FadeIn, FadeInStagger, FadeInStaggerItem } from "@/components/Animated";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export default function ResultsIndexPage() {
  const [batches, setBatches] = React.useState<BatchSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/batches/recent");
      setBatches(res.data.batches || []);
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || "Failed to synchronize analysis history";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteBatchById(id: string) {
    const ok = window.confirm("Obliterate this analysis trajectory? This action is irreversible.");
    if (!ok) return;
    setBusyId(id);
    setError(null);
    try {
      await api.delete(`/batches/${id}`);
      setBatches((cur) => cur.filter((b) => b.id !== id));
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || "Failed to terminate analysis trajectory";
      setError(message);
    } finally {
      setBusyId(null);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  const filteredBatches = batches.filter(b => 
    new Date(b.uploadDate).toLocaleString().toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.topperName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Protected>
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] h-[50rem] w-[50rem] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-primary/5 blur-[100px]" />
      </div>
      <AppShell>
        <PageHeader
          title={
            <div className="flex items-center gap-6">
               <div className="h-16 w-16 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[0_0_30px_rgba(var(--indigo-500),0.2)] backdrop-blur-3xl group hover:scale-110 transition-all duration-700">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <span className="font-display font-black text-4xl text-white tracking-tight block">Analysis Archive</span>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mt-2 flex items-center gap-3">
                  Vault Explorer
                </p>
              </div>
            </div>
          }
          subtitle="Comprehensive chronological record of extracted performance datasets."
          actions={
            <Link href="/upload">
              <Button size="lg" className="rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[11px] bg-white text-black hover:bg-primary hover:text-white transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-primary/20 hover:-translate-y-1 active:scale-95 group">
                <Upload className="mr-4 h-5 w-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                New Analysis
              </Button>
            </Link>
          }
        />

        <main className="mx-auto max-w-7xl px-8 py-16 lg:px-12 relative z-10">
          <div className="mb-14 flex flex-col md:flex-row gap-6">
              <div className="relative flex-1 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Query archive by date, status, or personnel..." 
                  className="pl-16 h-16 bg-white/[0.02] border-white/5 rounded-2xl font-black uppercase tracking-widest text-[10px] placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/10 transition-all shadow-2xl backdrop-blur-3xl focus:bg-white/[0.04]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className="h-16 rounded-2xl px-10 font-black uppercase tracking-widest text-[11px] border-white/5 bg-white/[0.03] hover:bg-white/10 text-white transition-all shadow-xl hover:shadow-2xl active:scale-95"
                onClick={load}
                disabled={loading}
              >
                <RefreshCw className={cn("mr-4 h-5 w-5 opacity-40 group-hover:opacity-100", loading && "animate-spin opacity-100")} />
                Sync
              </Button>
          </div>

          {loading ? (
            <div className="py-40 flex flex-col items-center justify-center gap-8">
              <RefreshCw className="h-12 w-12 animate-spin text-primary opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10 animate-pulse">Reconstructing archive index...</p>
            </div>
          ) : error ? (
            <FadeIn>
              <div className="p-16 rounded-[3.5rem] border border-rose-500/20 bg-rose-500/5 text-rose-500 text-center backdrop-blur-3xl shadow-[0_0_50px_rgba(244,63,94,0.05)]">
                <AlertCircle className="h-16 w-16 mx-auto mb-8 opacity-50" />
                <h3 className="text-2xl font-display font-black uppercase tracking-widest">Protocol Failure</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4 opacity-60 max-w-md mx-auto leading-relaxed">{error}</p>
                <Button variant="outline" className="mt-12 rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[11px] border-rose-500/20 hover:bg-rose-500/10 text-rose-500 transition-all hover:scale-105 active:scale-95" onClick={load}>Retry Transaction</Button>
              </div>
            </FadeIn>
          ) : filteredBatches.length === 0 ? (
            <FadeIn>
              <div className="rounded-[3.5rem] border border-white/5 bg-white/[0.01] p-40 text-center relative overflow-hidden group shadow-2xl">
                <div className="absolute inset-0 bg-primary/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="relative z-10">
                  <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-[3rem] bg-white/5 border border-white/10 text-white/5 shadow-inner mb-12 group-hover:scale-110 group-hover:text-primary transition-all duration-700">
                    <FileText className="h-14 w-14" />
                  </div>
                  <h3 className="text-4xl font-display font-black text-white">Archive Nullified</h3>
                  <p className="mt-5 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 max-w-sm mx-auto leading-relaxed">No analysis trajectories have been initialized in this sector.</p>
                  <div className="mt-14">
                    <Link href="/upload">
                      <Button size="lg" className="rounded-2xl h-16 px-14 font-black uppercase tracking-widest text-[11px] bg-white text-black hover:bg-primary hover:text-white shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all hover:shadow-primary/20 hover:-translate-y-1 active:scale-95 group">
                        <Upload className="mr-4 h-5 w-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                        Engagement Node
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>
          ) : (
            <FadeInStagger className="grid gap-8">
              {filteredBatches.map((b) => (
                <FadeInStaggerItem key={b.id}>
                  <Card className="group border-white/5 hover:border-primary/20 transition-all duration-500 rounded-[3rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border-t-white/10 relative">
                    <div className="absolute inset-y-0 left-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
                    <CardContent className="p-0">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 p-12 lg:p-14">
                          <div className="flex items-start gap-12 min-w-0">
                            <div className={cn(
                              "h-24 w-24 rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-2xl border border-transparent transition-all duration-700 group-hover:rotate-12 group-hover:scale-110",
                              b.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5 hover:shadow-emerald-500/20" : 
                              b.status === "failed" ? "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/5 hover:shadow-rose-500/20" : "bg-primary/10 text-primary border-primary/20 shadow-primary/5 hover:shadow-primary/20"
                            )}>
                              {b.status === "completed" ? <CheckCircle2 className="h-10 w-10" /> : 
                               b.status === "failed" ? <XCircle className="h-10 w-10" /> : <Clock className="h-10 w-10 animate-pulse" />}
                            </div>
                            
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-6 mb-6">
                                <h3 className="text-3xl font-display font-black text-white group-hover:text-primary transition-colors tracking-tight leading-none">
                                  {new Date(b.uploadDate).toLocaleDateString(undefined, { 
                                    weekday: 'short', 
                                    month: 'long', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </h3>
                                <span className={cn(
                                  "inline-flex items-center rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] border shadow-2xl transition-all duration-500",
                                  b.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                                  b.status === "fetching" ? "bg-primary/10 text-primary border-primary/20" :
                                  b.status === "failed" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                  "bg-white/5 text-white/40 border-white/5"
                                )}>
                                  <div className={cn("h-1.5 w-1.5 rounded-full mr-3", b.status === "completed" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.8)]")} />
                                  {b.status}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-10 gap-y-5 mb-10">
                                <div className="flex items-center gap-4 text-[11px] font-black text-white/40 uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-xl shadow-inner border border-white/5">
                                  <GraduationCap className="h-4 w-4 text-primary/60" />
                                  <span>{b.totalStudents} Nodes</span>
                                </div>
                                <div className="flex items-center gap-4 text-[11px] font-black text-emerald-400/60 uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-xl shadow-inner border border-white/5">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span>{b.passCount} Success</span>
                                </div>
                                <div className="flex items-center gap-4 text-[11px] font-black text-rose-400/60 uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-xl shadow-inner border border-white/5">
                                  <XCircle className="h-4 w-4" />
                                  <span>{b.failCount} Attrition</span>
                                </div>
                                <div className="flex items-center gap-4 text-[11px] font-black text-indigo-400/60 uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-xl shadow-inner border border-white/5">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(b.uploadDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </div>

                              {b.topperName && (
                                <div className="inline-flex items-center gap-5 px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/5 text-[11px] font-black uppercase tracking-[0.2em] text-white/60 shadow-xl group/topper transition-all hover:bg-white/[0.05] hover:border-amber-500/20">
                                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 group-hover/topper:scale-110 transition-transform shadow-inner group-hover/topper:bg-amber-500 group-hover/topper:text-white">
                                    <Trophy className="h-5 w-5" />
                                  </div>
                                  <span className="opacity-40">Apex Performer:</span>
                                  <span className="text-white font-display text-sm tracking-tight">{b.topperName}</span>
                                  <div className="h-1.5 w-1.5 rounded-full bg-white/10 mx-2" />
                                  <span className="text-primary bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 shadow-inner group-hover/topper:bg-primary group-hover/topper:text-white transition-colors">{b.topperPercentage}%</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-5 shrink-0 self-end md:self-center w-full sm:w-auto mt-8 md:mt-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteBatchById(b.id)}
                              disabled={busyId === b.id}
                              className="h-16 w-16 shrink-0 rounded-2xl text-rose-500/40 hover:text-white hover:bg-rose-500 border border-transparent hover:border-rose-500/50 transition-all active:scale-90 shadow-xl"
                            >
                              {busyId === b.id ? <RefreshCw className="h-6 w-6 animate-spin" /> : <Trash2 className="h-6 w-6" />}
                            </Button>
                            <Link href={`/results/${b.id}`} className="w-full sm:w-auto">
                              <Button size="lg" className="w-full rounded-2xl h-16 px-12 font-black uppercase tracking-widest text-[11px] bg-white text-black hover:bg-primary hover:text-white shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all active:scale-95 hover:-translate-y-1">
                                Inspect
                                <ChevronRight className="ml-4 h-5 w-5 opacity-40 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                              </Button>
                            </Link>
                          </div>
                       </div>
                    </CardContent>
                  </Card>
                </FadeInStaggerItem>
              ))}
            </FadeInStagger>
          )}
        </main>
      </AppShell>
    </Protected>
  );
}
