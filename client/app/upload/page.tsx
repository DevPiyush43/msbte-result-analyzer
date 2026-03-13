"use client";

import Link from "next/link";
import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  FileSpreadsheet, 
  Info, 
  Upload, 
  Wand2, 
  CheckCircle2, 
  ChevronRight, 
  FileUp, 
  Database, 
  Zap,
  Activity,
  AlertCircle,
  Box
} from "lucide-react";
import { motion } from "framer-motion";

import { Protected } from "@/components/Protected";
import { AppShell } from "@/components/AppShell";
import { FadeIn, FadeInStagger, FadeInStaggerItem } from "@/components/Animated";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [enrollments, setEnrollments] = React.useState<string[] | null>(null);
  const [batchId, setBatchId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  function pickFile(f: File | null) {
    setError(null);
    setEnrollments(null);
    setBatchId(null);
    setProgress(null);

    if (!f) {
      setFile(null);
      return;
    }

    const ok = f.name.toLowerCase().endsWith(".xlsx");
    if (!ok) {
      setFile(null);
      setError("Incompatible format. Please upload an industry-standard .xlsx file.");
      return;
    }
    setFile(f);
  }

  async function upload() {
    if (!file) return;
    setError(null);
    setProgress(0);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await api.post("/batches/upload", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const p = Math.round((evt.loaded / evt.total) * 100);
          setProgress(p);
        },
      });

      setEnrollments(res.data.enrollments || []);
      setBatchId(res.data.batch?.id || null);
      setProgress(100);
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || "Internal transmission error";
      setError(message);
      setProgress(null);
    }
  }

  return (
    <Protected>
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-10%] h-[60rem] w-[60rem] rounded-full bg-primary/20 blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50rem] w-[50rem] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      <AppShell>
        <PageHeader 
          title={
            <div className="flex items-center gap-6">
               <div className="h-16 w-16 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(var(--primary),0.2)] backdrop-blur-3xl group hover:scale-110 transition-all duration-700">
                <FileUp className="h-8 w-8" />
              </div>
              <div>
                <span className="font-display font-black text-4xl text-white tracking-tight block">Ingestion Node</span>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mt-2 flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),1)]" />
                  Primary Uplink Active
                </p>
              </div>
            </div>
          }
          subtitle="Synchronize academic records via industrial-grade XLSX batch ingestion." 
          backHref="/dashboard" 
          actions={
            <div className="flex items-center gap-6">
               <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">System Load</span>
                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4,5,6,7].map(i => (
                      <div key={i} className={cn("h-1 w-3 rounded-full", i < 4 ? "bg-emerald-500/40" : "bg-white/5")} />
                    ))}
                  </div>
               </div>
               <Button variant="outline" className="rounded-2xl h-14 px-6 font-black uppercase tracking-widest text-[9px] border-white/5 bg-white/[0.03] hover:bg-white/10 text-white/40 hover:text-white transition-all shadow-xl backdrop-blur-xl">
                 Security Layer: JWT 256
               </Button>
            </div>
          }
        />

        <main className="mx-auto max-w-7xl px-8 py-16 lg:px-12 relative z-10">
          <FadeInStagger className="grid gap-12 lg:grid-cols-3">
            <FadeInStaggerItem className="lg:col-span-2">
              <Card className="border-white/5 shadow-2xl rounded-[3.5rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden border-t-white/10">
                <CardHeader className="border-b border-white/5 bg-white/[0.01] px-12 py-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                        <Database className="h-7 w-7" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-2xl font-display font-black text-white tracking-tight leading-none">Dataset Initialization</h3>
                        <p className="text-[10px] uppercase font-black tracking-[0.4em] text-white/20">Map identifiers to extraction engine</p>
                      </div>
                    </div>
                    <div className="h-10 px-5 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-3">
                       <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Engine: Optimistic</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-12">
                  <div
                    className={cn(
                      "group relative rounded-[3rem] border-2 border-dashed p-24 text-center transition-all duration-700 overflow-hidden",
                      dragOver 
                        ? "border-primary bg-primary/10 ring-8 ring-primary/5 scale-[0.99] shadow-[0_0_100px_rgba(var(--primary),0.1)]" 
                        : "border-white/5 hover:border-primary/30 hover:bg-white/[0.02] bg-white/[0.01] shadow-inner"
                    )}
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }}
                    onDrop={(e) => {
                      e.preventDefault(); e.stopPropagation(); setDragOver(false);
                      const f = e.dataTransfer.files?.[0] || null;
                      pickFile(f);
                    }}
                  >
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
                      <div className="absolute top-[-50%] left-[-50%] h-[200%] w-[200%] bg-[radial-gradient(circle,rgba(var(--primary),0.1)_0%,transparent_70%)] animate-pulse" />
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05]" />
                    </div>

                    <div className="relative z-10">
                      <div className="mx-auto mb-10 flex h-28 w-28 items-center justify-center rounded-[2.5rem] bg-white/5 border border-white/10 text-white/10 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-700 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_50px_rgba(var(--primary),0.2)]">
                        <Upload className="h-12 w-12" />
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-3xl font-display font-black text-white tracking-tight">Drop XLSX Protocol</h4>
                        <p className="text-[10px] uppercase font-black tracking-[0.4em] text-white/20 max-w-[360px] mx-auto leading-relaxed italic">System interprets Excel schemas specifically tailored for student identity mapping with millisecond latency.</p>
                      </div>
                    </div>
                    
                    <input
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      type="file"
                      accept=".xlsx"
                      onChange={(e) => pickFile(e.target.files?.[0] || null)}
                    />

                    {file && (
                      <FadeIn>
                        <div className="relative z-30 mt-14 rounded-[2rem] bg-white/[0.04] border border-white/10 p-8 flex items-center justify-between shadow-2xl backdrop-blur-3xl hover:border-primary/40 transition-all pointer-events-none group/file">
                          <div className="flex items-center gap-8">
                            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner group-hover/file:rotate-6 transition-transform">
                              <FileSpreadsheet className="h-8 w-8" />
                            </div>
                            <div className="text-left min-w-0 space-y-2">
                              <p className="text-lg font-display font-black text-white truncate max-w-[320px]">{file.name}</p>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] text-emerald-400/60 font-black uppercase tracking-widest">Payload Ready</span>
                                <div className="h-1 w-1 rounded-full bg-white/10" />
                                <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB Vector</span>
                              </div>
                            </div>
                          </div>
                          <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                          </div>
                        </div>
                      </FadeIn>
                    )}

                    {typeof progress === "number" && (
                      <div className="relative z-30 mt-14 space-y-8 p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                               <Activity className="h-5 w-5 animate-pulse" />
                             </div>
                             <div className="text-left">
                               <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Syncing Protocol</p>
                               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Handshake in progress...</p>
                             </div>
                          </div>
                          <span className="tabular-nums text-primary font-display font-black text-4xl tracking-tighter shadow-primary/20">{progress}%</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-white/[0.03] overflow-hidden p-[1px] border border-white/5 relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-primary via-indigo-400 to-primary shadow-[0_0_30px_rgba(var(--primary),0.8)] relative overflow-hidden" 
                            style={{ transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
                          >
                             <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] translate-x-[-100%] animate-shimmer" />
                          </motion.div>
                        </div>
                      </div>
                    )}

                    {error && (
                      <FadeIn>
                        <div className="relative z-30 mt-12 p-10 rounded-[2rem] bg-rose-500/5 border border-rose-500/20 text-rose-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-6 animate-shake leading-relaxed shadow-2xl">
                          <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
                            <AlertCircle className="h-6 w-6" />
                          </div>
                          <div className="text-left">
                             <p className="text-rose-500/60 mb-1">Transmission Failure</p>
                             <p className="text-white/80">{error}</p>
                          </div>
                        </div>
                      </FadeIn>
                    )}
                  </div>

                  <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-8">
                    <Button 
                      size="lg"
                      className="w-full sm:w-auto px-16 h-20 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] bg-white text-black hover:bg-primary hover:text-white shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-20 group"
                      disabled={!file || progress !== null} 
                      onClick={upload}
                    >
                      <Zap className="mr-4 h-5 w-5 fill-current opacity-40 group-hover:opacity-100 transition-opacity" />
                      {progress === null ? "Engage Extraction" : progress < 100 ? `Pipelining Payload...` : "Registry Synchronized"}
                    </Button>
                    
                    {batchId && (
                      <Button 
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto px-12 h-20 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] border-white/5 bg-white/[0.03] hover:bg-white/10 text-white transition-all shadow-xl hover:shadow-2xl active:scale-95 group backdrop-blur-xl"
                        onClick={() => router.push(`/results/${batchId}`)}
                      >
                        Launch Monitor
                        <ChevronRight className="ml-4 h-5 w-5 opacity-40 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                      </Button>
                    )}
                  </div>

                  {enrollments && (
                    <FadeIn delay={0.2}>
                      <div className="mt-24 rounded-[3.5rem] border border-white/5 bg-white/[0.01] p-16 backdrop-blur-3xl relative overflow-hidden shadow-2xl group/preview">
                        <div className="absolute top-[-10%] right-[-10%] h-64 w-64 bg-primary/10 blur-[100px] pointer-events-none group-hover/preview:scale-150 transition-transform duration-1000" />
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-14 relative z-10">
                          <div className="flex items-center gap-6">
                             <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                              <Box className="h-8 w-8 text-white/20" />
                            </div>
                            <div className="space-y-1.5">
                              <h4 className="text-2xl font-display font-black text-white tracking-tight leading-none">Node Integrity Preview</h4>
                              <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em] mt-2 italic">Parsed identifiers from synchronized payload</p>
                            </div>
                          </div>
                          <div className="h-14 px-8 rounded-2xl bg-white text-black text-[12px] font-black uppercase tracking-[0.3em] flex items-center shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-white/10">
                            {enrollments.length} Identifiers Map
                          </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5 relative z-10">
                          {enrollments.slice(0, 20).map((e) => (
                            <div key={e} className="rounded-2xl bg-white/[0.03] border border-white/5 px-6 py-5 text-[11px] font-black text-white/40 text-center tabular-nums hover:border-primary/40 hover:bg-white/[0.06] hover:text-white transition-all shadow-xl hover:-translate-y-1">
                              {e}
                            </div>
                          ))}
                        </div>
                        
                        {enrollments.length > 20 && (
                          <div className="mt-14 pt-10 border-t border-white/5 text-center relative z-10">
                             <p className="text-[10px] text-white/10 font-black uppercase tracking-[0.5em] animate-pulse">
                               + {enrollments.length - 20} Additional Nodes identified in registry trajectory.
                             </p>
                          </div>
                        )}
                      </div>
                    </FadeIn>
                  )}
                </CardContent>
              </Card>
            </FadeInStaggerItem>

            <FadeInStaggerItem className="space-y-12 relative z-10">
              <Card className="border-white/5 shadow-2xl rounded-[3.5rem] overflow-hidden bg-white/[0.02] backdrop-blur-3xl border-l-[6px] border-l-primary/40 relative group">
                <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-3xl" />
                <CardHeader className="pb-8 px-12 pt-12">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <Wand2 className="h-7 w-7" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-2xl font-display font-black text-white leading-none">Operational Logic</h3>
                      <p className="text-[9px] uppercase font-black tracking-[0.5em] text-white/20 mt-1 italic leading-none">Execution Workflow</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-12 px-12 pb-14">
                  <div className="relative pl-14 pb-12 border-l border-white/5 last:pb-0 group/step">
                    <div className="absolute left-[-6px] top-0 h-3 w-3 rounded-full bg-primary shadow-[0_0_20px_rgba(var(--primary),1)] transition-transform group-hover/step:scale-150 duration-500" />
                    <div className="space-y-4">
                      <h5 className="text-[11px] font-black text-primary uppercase tracking-[0.4em] mb-3 leading-none group-hover/step:translate-x-1 transition-transform">01 Ingestion</h5>
                      <p className="text-[12px] text-white/30 font-bold leading-relaxed group-hover/step:text-white/60 transition-colors">System validates XLSX schema for valid seat numbers and initializes an academic cohort cluster with strict integrity checks.</p>
                    </div>
                  </div>
                  <div className="relative pl-14 pb-12 border-l border-white/5 last:pb-0 group/step">
                    <div className="absolute left-[-6px] top-0 h-3 w-3 rounded-full bg-white/10 border border-white/20 group-hover/step:bg-primary group-hover/step:border-primary group-hover/step:shadow-[0_0_20px_rgba(var(--primary),1)] transition-all group-hover/step:scale-150 duration-500" />
                    <div className="space-y-4">
                      <h5 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] mb-3 leading-none group-hover/step:text-primary group-hover/step:translate-x-1 transition-all">02 Extraction</h5>
                      <p className="text-[12px] text-white/10 font-bold leading-relaxed group-hover/step:text-white/40 transition-colors">Launch the MSBTE portal bridge and engage high-concurrency scraping threads using distributed Puppeteer nodes.</p>
                    </div>
                  </div>
                  <div className="relative pl-14 last:pb-0 group/step">
                    <div className="absolute left-[-6px] top-0 h-3 w-3 rounded-full bg-white/10 border border-white/20 group-hover/step:bg-primary group-hover/step:border-primary group-hover/step:shadow-[0_0_20px_rgba(var(--primary),1)] transition-all group-hover/step:scale-150 duration-500" />
                    <div className="space-y-4">
                      <h5 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] mb-3 leading-none group-hover/step:text-primary group-hover/step:translate-x-1 transition-all">03 Analytics</h5>
                      <p className="text-[12px] text-white/10 font-bold leading-relaxed group-hover/step:text-white/40 transition-colors">Synthesize parsed node data into rich visual telemetry, generating deep-intelligence dashboards and exports.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/5 shadow-2xl rounded-[3.5rem] overflow-hidden bg-white/[0.02] backdrop-blur-3xl relative">
                <div className="absolute top-0 left-0 h-40 w-40 bg-emerald-500/5 blur-[80px]" />
                <CardHeader className="pb-8 px-12 pt-12">
                  <div className="flex items-center gap-6">
                     <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-2xl font-display font-black text-white leading-none">Engine Status</h3>
                      <p className="text-[9px] uppercase font-black tracking-[0.5em] text-emerald-400 mt-1 italic leading-none">Real-time Node Health</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-12 pb-14">
                  <div className="space-y-6">
                    {[
                      { label: "Schema Validation", status: "Verified", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                      { label: "Link Persistence", status: "Production", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                      { label: "Reparsing Engine", status: "Optimistic", color: "text-primary", bg: "bg-primary/10" },
                    ].map((st, i) => (
                      <div key={i} className="flex items-center justify-between p-6 px-8 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group/status">
                        <span className="text-[11px] text-white/40 font-black uppercase tracking-[0.35em] group-hover/status:text-white/70 transition-colors">{st.label}</span>
                        <div className={cn("flex items-center gap-3 px-4 py-2 rounded-xl border border-white/5 shadow-2xl transition-all", st.bg, st.color)}>
                           <div className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_10px]", st.color === "text-emerald-400" ? "bg-emerald-500 shadow-emerald-500/50" : "bg-primary shadow-primary/50")} />
                           <span className="text-[10px] font-black uppercase tracking-widest">{st.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-14 p-10 rounded-[2.5rem] bg-white text-black flex items-start gap-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] group hover:scale-[1.03] transition-all duration-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(var(--primary),0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Info className="h-8 w-8 text-primary shrink-0 mt-0.5 relative z-10 transition-transform group-hover:rotate-12" />
                    <div className="relative z-10">
                      <h6 className="text-[12px] font-black uppercase tracking-[0.4em] text-primary mb-3 italic">Standard Directive</h6>
                      <p className="text-[12px] text-black/50 leading-relaxed font-bold">Ensure XLSX payload contains a single vertical column of identifiers in the primary workspace for optimal ingestion mapping.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInStaggerItem>
          </FadeInStagger>
        </main>
      </AppShell>
    </Protected>

  );
}
