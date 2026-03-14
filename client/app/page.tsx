import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  Lock,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";

import { FadeIn, HoverLift } from "@/components/Animated";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] h-[60rem] w-[60rem] rounded-full bg-primary/10 blur-[150px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50rem] w-[50rem] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
        {/* Subtle pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none mix-blend-overlay" />
      </div>

      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-10 relative z-10 lg:px-12">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-border text-primary shadow-xl group hover:scale-110 transition-transform duration-500">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-display font-black tracking-tight text-foreground leading-none">MSBTE Result Analyzer</div>
            <div className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mt-1">Academic Performance Dashboard</div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl px-6 shadow-md transition-all">Login</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-16 relative z-10 lg:px-12">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <FadeIn className="space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Modern Result Extraction
              </div>
              <h1 className="text-6xl font-display font-black tracking-tight text-foreground leading-[1.05] md:text-7xl">
                Automate Results.<br />
                <span className="bg-gradient-to-r from-primary via-secondary to-primary/80 bg-clip-text text-transparent">
                  Analyze Success.
                </span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground font-medium">
                Transform MSBTE academic rosters into powerful performance dashboards. Upload, extract, and generate comprehensive result summaries with absolute precision.
              </p>
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
                  Open Dashboard
                </Button>
              </Link>
              <div className="flex -space-x-3 items-center ml-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-9 w-9 rounded-full bg-accent border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <span className="ml-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Used by 50+ Institutions</span>
              </div>
            </div>

            <div className="grid gap-4 pt-10 border-t border-border">
              <div className="flex items-center gap-3 group">
                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Automated Result Extraction</span>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Reliable Data Processing</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 blur-3xl opacity-20 rounded-full animate-pulse" />
              <Card className="relative overflow-hidden border-border bg-white rounded-[3rem] shadow-2xl p-2 h-full">
                <div className="bg-accent/40 rounded-[2.5rem] overflow-hidden border border-border">
                  <div className="px-10 py-10 border-b border-border flex items-center justify-between bg-white/50">
                    <div className="space-y-1">
                      <div className="text-xs font-black uppercase tracking-widest text-foreground">Operational Status</div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        System Ready
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-2 w-2 rounded-full bg-rose-200" />
                      <div className="h-2 w-2 rounded-full bg-amber-200" />
                      <div className="h-2 w-2 rounded-full bg-emerald-200" />
                    </div>
                  </div>
                  <div className="p-10 space-y-10">
                    <div className="flex items-start gap-6 group">
                      <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                        <FileSpreadsheet className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-display font-bold text-foreground text-lg">Batch Upload</div>
                        <div className="text-xs text-muted-foreground font-medium leading-relaxed">
                          Securely upload student Excel rosters with automatic validation.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-6 group">
                      <div className="h-12 w-12 shrink-0 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary-foreground group-hover:scale-110 group-hover:bg-secondary group-hover:text-white transition-all">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-display font-bold text-foreground text-lg">Result Sync</div>
                        <div className="text-xs text-muted-foreground font-medium leading-relaxed">
                          Synchronize results directly from MSBTE servers with high precision.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-6 group">
                      <div className="h-12 w-12 shrink-0 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <BarChart3 className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-display font-bold text-foreground text-lg">Deep Analytics</div>
                        <div className="text-xs text-muted-foreground font-medium leading-relaxed">
                          Automated topper detection and subject-wise failure heatmaps.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </FadeIn>
        </div>

        <div className="mt-32 grid gap-10 md:grid-cols-3">
          {[
            { icon: Upload, title: "Result Extractor", desc: "Automate fetching for entire batches", color: "text-primary", bg: "bg-primary/5" },
            { icon: FileSpreadsheet, title: "Advanced Analytics", desc: "Comprehensive merit list generation", color: "text-secondary", bg: "bg-secondary/5" },
            { icon: Lock, title: "Secure Access", desc: "Enterprise-grade authorization layer", color: "text-emerald-500", bg: "bg-emerald-50" },
          ].map((feature, i) => (
            <FadeIn key={i} delay={0.1 * (i + 1)}>
              <Card className="border-border bg-white shadow-lg rounded-[2.5rem] p-10 group hover:border-primary/20 transition-all hover:-translate-y-2">
                <div className={`h-14 w-14 rounded-2xl ${feature.bg} flex items-center justify-center ${feature.color} mb-8 border border-border group-hover:scale-110 transition-all`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <div className="space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{feature.title}</div>
                  <div className="text-xl font-display font-black text-foreground leading-tight">{feature.desc}</div>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>
      </main>

      <footer className="mx-auto max-w-7xl px-6 py-20 relative z-10 lg:px-12 border-t border-border">
         <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-4">
               <GraduationCap className="h-6 w-6 text-primary/30" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">MSBTE Result Analyzer © 2024</span>
            </div>
            <div className="flex gap-10">
               <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-primary transition-colors">Documentation</span>
               <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-primary transition-colors">Security</span>
               <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-primary transition-colors">Privacy Policy</span>
            </div>
         </div>
      </footer>
    </div>
  );
}
