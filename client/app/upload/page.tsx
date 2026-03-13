"use client";

import Link from "next/link";
import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  FileUp, 
  Upload, 
  CheckCircle2, 
  FileSpreadsheet, 
  AlertCircle, 
  ChevronRight, 
  Zap, 
  Database,
  Box,
  Wand2,
  Activity,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [extractionStatus, setExtractionStatus] = React.useState<{
    processed: number;
    success: number;
    failed: number;
    retrying: number;
    total: number;
  } | null>(null);

  function pickFile(f: File | null) {
    setError(null);
    setEnrollments(null);
    setBatchId(null);
    setProgress(null);
    setExtractionStatus(null);
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
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          setProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });
      setEnrollments(res.data.enrollments || []);
      setBatchId(res.data.batch?.id || null);
      setProgress(100);
      setExtractionStatus({
        processed: 0,
        success: 0,
        failed: 0,
        retrying: 0,
        total: res.data.enrollments?.length || 0
      });
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Internal transmission error");
      setProgress(null);
    }
  }

  return (
    <Protected>
      <AppShell>
        <PageHeader 
          title={
            <div className="flex items-center gap-4">
               <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
                <FileUp className="h-7 w-7" />
              </div>
              <span className="font-display font-black text-3xl text-foreground tracking-tight">Batch Extraction</span>
            </div>
          }
          subtitle="Synchronize academic records via standardized XLSX batch injection." 
          backHref="/dashboard" 
        />

        <main className="mx-auto max-w-7xl px-8 py-12 relative z-10">
          <FadeInStagger className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-border shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                <div className="p-8 border-b border-border bg-accent/30 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                      <Database className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-display font-black text-foreground tracking-tight">Dataset Initialization</h3>
                  </div>
                </div>
                <CardContent className="p-10">
                  <div
                    className={cn(
                      "group relative rounded-[2.5rem] border-2 border-dashed p-16 text-center transition-all duration-500",
                      dragOver 
                        ? "border-primary bg-primary/5 ring-4 ring-primary/5 scale-[0.99]" 
                        : "border-border hover:border-primary/40 bg-accent/20"
                    )}
                    onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                    onDrop={(e) => {
                      e.preventDefault(); setDragOver(false);
                      pickFile(e.dataTransfer.files?.[0] || null);
                    }}
                  >
                    <div className="relative z-10">
                      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white border border-border text-muted-foreground group-hover:scale-110 group-hover:text-primary transition-all duration-500 shadow-sm">
                        <Upload className="h-8 w-8" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-2xl font-display font-black text-foreground tracking-tight">Drop Excel Protocol</h4>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider max-w-[300px] mx-auto leading-relaxed">System interprets files specifically tailored for MSBTE student mapping.</p>
                      </div>
                    </div>
                    
                    <input className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" type="file" accept=".xlsx" onChange={(e) => pickFile(e.target.files?.[0] || null)} />

                    {file && (
                      <FadeIn>
                        <div className="relative z-30 mt-10 rounded-2xl bg-white border border-border p-6 flex items-center justify-between shadow-lg pointer-events-none group/file">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover/file:rotate-6 transition-transform">
                              <FileSpreadsheet className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-black text-foreground truncate max-w-[200px]">{file.name}</p>
                              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB Payload</p>
                            </div>
                          </div>
                          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        </div>
                      </FadeIn>
                    )}
                  </div>

                  <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Button 
                      size="lg"
                      className="w-full sm:w-auto px-12 h-16 rounded-xl font-black uppercase tracking-widest text-[11px] bg-primary text-white hover:bg-primary/90 shadow-lg transition-all hover:-translate-y-0.5"
                      disabled={!file || progress !== null} 
                      onClick={upload}
                    >
                      <Zap className="mr-3 h-5 w-5" />
                      {progress === null ? "Engage Extraction" : "Processing..."}
                    </Button>
                    
                    {batchId && (
                      <Button variant="outline" size="lg" className="w-full sm:w-auto px-10 h-16 rounded-xl font-bold uppercase tracking-widest text-[11px] bg-white border-border hover:bg-accent transition-all" onClick={() => router.push(`/results/${batchId}`)}>
                        Monitor Extraction
                        <ChevronRight className="ml-3 h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {error && (
                    <FadeIn>
                      <div className="mt-8 p-6 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold uppercase tracking-widest flex items-center gap-4">
                        <AlertCircle className="h-5 w-5" />
                        <p>{error}</p>
                      </div>
                    </FadeIn>
                  )}
                </CardContent>
              </Card>

              {/* Extraction Monitor UI */}
              <AnimatePresence>
                {extractionStatus && (
                  <FadeIn>
                    <Card className="border-border shadow-2xl rounded-[2.5rem] bg-white overflow-hidden p-8 border-t-[6px] border-t-primary">
                       <div className="flex items-center justify-between mb-10">
                          <div className="flex items-center gap-4">
                             <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                <Activity className="h-6 w-6 animate-pulse" />
                             </div>
                             <div>
                                <h4 className="text-xl font-display font-black text-foreground leading-none">Extraction Monitor</h4>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Real-time status tracking</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <span className="text-4xl font-display font-black text-primary tabular-nums">
                               {Math.round((extractionStatus.processed / extractionStatus.total) * 100) || 0}%
                             </span>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                          <div className="p-5 rounded-2xl bg-accent border border-border">
                             <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Processed</p>
                             <p className="text-2xl font-display font-black text-foreground">{extractionStatus.processed}/{extractionStatus.total}</p>
                          </div>
                          <div className="p-5 rounded-2xl bg-accent border border-border">
                             <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Success</p>
                             <p className="text-2xl font-display font-black text-emerald-600">{extractionStatus.success}</p>
                          </div>
                          <div className="p-5 rounded-2xl bg-accent border border-border">
                             <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Failed</p>
                             <p className="text-2xl font-display font-black text-rose-600">{extractionStatus.failed}</p>
                          </div>
                          <div className="p-5 rounded-2xl bg-accent border border-border">
                             <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Retry Queue</p>
                             <p className="text-2xl font-display font-black text-amber-600">{extractionStatus.retrying}</p>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                             <span>Student Identifier Range Mapping</span>
                             <span className="text-primary italic">Live Telemetry</span>
                          </div>
                          <div className="h-3 w-full bg-accent rounded-full overflow-hidden p-0.5 border border-border">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${(extractionStatus.processed / extractionStatus.total) * 100 || 0}%` }}
                               className="h-full rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                             />
                          </div>
                       </div>
                    </Card>
                  </FadeIn>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-8">
              <Card className="border-border shadow-xl rounded-[2.5rem] bg-white p-10 relative overflow-hidden group">
                <div className="relative z-10 space-y-12">
                   <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                         <Wand2 className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-display font-black text-foreground tracking-tight">Extraction Logic</h3>
                   </div>
                   
                   <div className="space-y-10">
                      {[
                        { step: "01", label: "Ingestion", desc: "System validates XLSX schema for valid identifiers." },
                        { step: "02", label: "Extraction", desc: "Launch the MSBTE portal bridge for automated scraping." },
                        { step: "03", label: "Analytics", desc: "Results synthesized into rich visual telemetry." }
                      ].map((s, i) => (
                        <div key={i} className="flex gap-6 relative">
                           <span className="text-2xl font-display font-black text-primary/20">{s.step}</span>
                           <div>
                              <p className="text-xs font-black text-foreground uppercase tracking-widest mb-1">{s.label}</p>
                              <p className="text-[12px] text-muted-foreground leading-relaxed font-medium">{s.desc}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </Card>

              <Card className="border-border shadow-xl rounded-[2.5rem] bg-white p-10">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                      <Activity className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Engine Status</span>
                 </div>
                 <div className="space-y-4">
                    {["Validator 1.0", "Scraper Bridge", "Identity Link"].map((st) => (
                      <div key={st} className="flex items-center justify-between p-4 rounded-xl bg-accent border border-border">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase">{st}</span>
                        <div className="flex items-center gap-2 text-emerald-600">
                           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                        </div>
                      </div>
                    ))}
                 </div>
              </Card>
            </div>
          </FadeInStagger>
        </main>
      </AppShell>
    </Protected>
  );
}
