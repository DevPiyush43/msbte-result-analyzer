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
      const message = err?.response?.data?.error?.message || "Failed to synchronize results history";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteBatchById(id: string) {
    const ok = window.confirm("Are you sure you want to delete this result batch? This action is irreversible.");
    if (!ok) return;
    setBusyId(id);
    setError(null);
    try {
      await api.delete(`/batches/${id}`);
      setBatches((cur) => cur.filter((b) => b.id !== id));
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || "Failed to delete batch";
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
      <AppShell>
        <PageHeader
          title={
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <span className="font-display font-black text-2xl text-foreground tracking-tight block">Results History</span>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Academic Record Management</p>
              </div>
            </div>
          }
          subtitle="Comprehensive record of extracted student performance data."
          actions={
            <Link href="/upload">
              <Button className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest text-[9px] bg-primary text-white hover:bg-primary/90 transition-all shadow-lg hover:-translate-y-0.5 active:scale-95 group">
                <Upload className="mr-3 h-4 w-4" />
                New Extraction
              </Button>
            </Link>
          }
        />

        <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10 relative z-10">
          <div className="mb-8 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Search by date, status, or student name..." 
                  className="pl-12 h-12 bg-white border-border rounded-xl font-bold uppercase tracking-widest text-[9px] placeholder:text-muted-foreground focus:border-primary focus:ring-primary/10 transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className="h-12 rounded-xl px-8 font-bold uppercase tracking-widest text-[9px] border-border bg-white hover:bg-accent text-foreground transition-all shadow-sm"
                onClick={load}
                disabled={loading}
              >
                <RefreshCw className={cn("mr-3 h-4 w-4", loading && "animate-spin")} />
                Refresh Archive
              </Button>
          </div>

          {loading ? (
            <div className="py-40 flex flex-col items-center justify-center gap-8">
              <RefreshCw className="h-12 w-12 animate-spin text-primary opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Archive...</p>
            </div>
          ) : error ? (
            <FadeIn>
              <div className="p-16 rounded-[3rem] border border-rose-100 bg-rose-50 text-rose-600 text-center shadow-lg">
                <AlertCircle className="h-16 w-16 mx-auto mb-8 opacity-50" />
                <h3 className="text-2xl font-display font-black uppercase tracking-tight">Sync Error</h3>
                <p className="text-[11px] font-bold uppercase tracking-widest mt-4 opacity-70 max-w-md mx-auto leading-relaxed">{error}</p>
                <Button variant="outline" className="mt-12 rounded-2xl h-14 px-10 font-bold uppercase tracking-widest text-[11px] border-rose-200 hover:bg-rose-100 text-rose-600 transition-all" onClick={load}>Retry Sync</Button>
              </div>
            </FadeIn>
          ) : filteredBatches.length === 0 ? (
            <FadeIn>
              <div className="rounded-[3rem] border border-border bg-white p-40 text-center relative overflow-hidden group shadow-xl">
                <div className="relative z-10">
                  <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-accent text-primary mb-12 group-hover:scale-110 transition-transform duration-700">
                    <FileText className="h-14 w-14" />
                  </div>
                  <h3 className="text-4xl font-display font-black text-foreground">No Results Found</h3>
                  <p className="mt-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground max-w-sm mx-auto leading-relaxed">No result batches have been uploaded yet.</p>
                  <div className="mt-14">
                    <Link href="/upload">
                      <Button size="lg" className="rounded-2xl h-16 px-14 font-bold uppercase tracking-widest text-[11px] bg-primary text-white hover:bg-primary/90 transition-all shadow-lg active:scale-95 group">
                        <Upload className="mr-4 h-5 w-5" />
                        Start New Extraction
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
                  <Card className="group border-border hover:border-primary/30 transition-all duration-500 rounded-[2.5rem] bg-white overflow-hidden hover:shadow-2xl relative">
                    <div className="absolute inset-y-0 left-0 w-1.5 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
                    <CardContent className="p-0">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 p-10 lg:p-12">
                          <div className="flex items-start gap-10 min-w-0">
                            <div className={cn(
                              "h-24 w-24 rounded-3xl flex items-center justify-center shrink-0 shadow-md border transition-all duration-700 group-hover:rotate-6 group-hover:scale-110",
                              b.status === "completed" ? "bg-emerald-50 text-emerald-500 border-emerald-100" : 
                              b.status === "failed" ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-primary/5 text-primary border-primary/10"
                            )}>
                              {b.status === "completed" ? <CheckCircle2 className="h-10 w-10" /> : 
                               b.status === "failed" ? <XCircle className="h-10 w-10" /> : <Clock className="h-10 w-10 animate-pulse" />}
                            </div>
                            
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-6 mb-4">
                                <h3 className="text-3xl font-display font-black text-foreground group-hover:text-primary transition-colors tracking-tight leading-none">
                                  {new Date(b.uploadDate).toLocaleDateString(undefined, { 
                                    weekday: 'short', 
                                    month: 'long', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </h3>
                                <span className={cn(
                                  "inline-flex items-center rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all duration-500",
                                  b.status === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                  b.status === "fetching" ? "bg-primary/5 text-primary border-primary/10" :
                                  b.status === "failed" ? "bg-rose-50 text-rose-600 border-rose-100" :
                                  "bg-accent text-muted-foreground border-border"
                                )}>
                                  <div className={cn("h-1.5 w-1.5 rounded-full mr-2", b.status === "completed" ? "bg-emerald-500" : "bg-primary animate-pulse")} />
                                  {b.status}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-8">
                                <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest bg-accent/50 px-4 py-2 rounded-xl border border-border">
                                  <GraduationCap className="h-4 w-4 text-primary" />
                                  <span>{b.totalStudents} Students</span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span>{b.passCount} Pass</span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-bold text-rose-600 uppercase tracking-widest bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
                                  <XCircle className="h-4 w-4" />
                                  <span>{b.failCount} Fail</span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest bg-accent/50 px-4 py-2 rounded-xl border border-border">
                                  <Clock className="h-4 w-4" />
                                  <span>{new Date(b.uploadDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </div>

                              {b.topperName && (
                                <div className="inline-flex items-center gap-5 px-6 py-4 rounded-2xl bg-amber-50 border border-amber-100 text-[11px] font-bold uppercase tracking-widest text-amber-700 shadow-sm transition-all hover:bg-amber-100">
                                  <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                                    <Trophy className="h-5 w-5" />
                                  </div>
                                  <span className="opacity-60">Top Performer:</span>
                                  <span className="text-foreground font-display text-sm font-black">{b.topperName}</span>
                                  <span className="bg-white px-4 py-2 rounded-xl border border-amber-200 shadow-sm font-black text-primary">{b.topperPercentage}%</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 self-end md:self-center w-full sm:w-auto mt-8 md:mt-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteBatchById(b.id)}
                              disabled={busyId === b.id}
                              className="h-16 w-16 shrink-0 rounded-2xl text-rose-500 hover:text-white hover:bg-rose-500 border border-transparent hover:border-rose-500/20 transition-all active:scale-95"
                            >
                              {busyId === b.id ? <RefreshCw className="h-6 w-6 animate-spin" /> : <Trash2 className="h-6 w-6" />}
                            </Button>
                            <Link href={`/results/${b.id}`} className="w-full sm:w-auto">
                              <Button size="lg" className="w-full rounded-2xl h-16 px-12 font-bold uppercase tracking-widest text-[11px] bg-accent text-foreground hover:bg-primary hover:text-white transition-all active:scale-95 border border-border">
                                View Details
                                <ChevronRight className="ml-4 h-5 w-5" />
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
