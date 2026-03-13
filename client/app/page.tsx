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
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-primary selection:text-white relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] h-[60rem] w-[60rem] rounded-full bg-primary/20 blur-[150px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50rem] w-[50rem] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
      </div>

      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-10 relative z-10 lg:px-12">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-primary shadow-[0_0_20px_rgba(var(--primary),0.3)] backdrop-blur-xl group hover:scale-110 transition-transform duration-500">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-display font-black tracking-tight text-white leading-none">Quantumsync</div>
            <div className="text-[9px] uppercase font-black tracking-[0.35em] text-muted-foreground opacity-50 mt-1">Advanced Academic Node</div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login">
            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 rounded-xl px-6">Login</Button>
          </Link>
          <Link href="/login">
            <Button className="text-[10px] font-black uppercase tracking-widest rounded-xl px-8 h-10 bg-white text-black hover:bg-primary hover:text-white transition-all shadow-xl shadow-white/5">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-16 relative z-10 lg:px-12">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <FadeIn className="space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-sm hover:border-primary/50 transition-colors">
                <Sparkles className="h-3.5 w-3.5" />
                Next Generation Extraction
              </div>
              <h1 className="text-6xl font-display font-black tracking-tight text-white leading-[1.05] md:text-7xl">
                Infinite scale.<br />
                <span className="bg-gradient-to-r from-primary via-indigo-400 to-white bg-clip-text text-transparent">
                  Zero friction.
                </span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground font-medium opacity-80">
                Transform MSBTE academic rosters into deep-intelligence dashboards. Upload, sync, and generate comprehensive merit yields with millisecond latency.
              </p>
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10">
                  Launch Console
                </Button>
              </Link>
              <div className="flex -space-x-3 items-center ml-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-8 w-8 rounded-full bg-white/10 border-2 border-[#0a0a0a] backdrop-blur-md flex items-center justify-center text-[10px] font-black">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <span className="ml-6 text-[10px] font-black text-white/40 uppercase tracking-widest">Trusted by 500+ Nodes</span>
              </div>
            </div>

            <div className="grid gap-4 pt-10 border-t border-white/5">
              <div className="flex items-center gap-3 group">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-white/60">Real-time Telemetry Extraction</span>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-white/60">Distributed Failure Recovery</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 blur-3xl opacity-30 rounded-full animate-pulse" />
              <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-3xl rounded-[3rem] shadow-2xl p-2">
                <div className="bg-[#0f0f0f] rounded-[2.5rem] overflow-hidden border border-white/5">
                  <div className="px-10 py-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="space-y-1">
                      <div className="text-xs font-black uppercase tracking-widest text-white">System Operations</div>
                      <div className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground opacity-40 italic">Handshake Protocol: Active</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-2 w-2 rounded-full bg-rose-500/50" />
                      <div className="h-2 w-2 rounded-full bg-amber-500/50" />
                      <div className="h-2 w-2 rounded-full bg-emerald-500/50" />
                    </div>
                  </div>
                  <div className="p-10 space-y-10">
                    <div className="flex items-start gap-6 group">
                      <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                        <FileSpreadsheet className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-display font-bold text-white text-lg">Input Stream</div>
                        <div className="text-xs text-muted-foreground font-medium leading-relaxed opacity-60">
                          Direct Excel payload ingestion with automatic schema recognition.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-6 group">
                      <div className="h-12 w-12 shrink-0 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-display font-bold text-white text-lg">Sync Engine</div>
                        <div className="text-xs text-muted-foreground font-medium leading-relaxed opacity-60">
                          High-velocity Puppeteer cluster for massive data synchronization.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-6 group">
                      <div className="h-12 w-12 shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <BarChart3 className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-display font-bold text-white text-lg">Yield Analysis</div>
                        <div className="text-xs text-muted-foreground font-medium leading-relaxed opacity-60">
                          Advanced cohort clustering and subject excellence metrics.
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
            { icon: Upload, title: "Bulk Pulse", desc: "Sync 500+ nodes simultaneously", color: "text-primary", bg: "bg-primary/5" },
            { icon: FileSpreadsheet, title: "Vector Reports", desc: "Automated Excel yield generation", color: "text-indigo-400", bg: "bg-indigo-500/5" },
            { icon: Lock, title: "Secure Apex", desc: "Enterprise JWT auth layer", color: "text-emerald-400", bg: "bg-emerald-500/5" },
          ].map((feature, i) => (
            <FadeIn key={i} delay={0.1 * (i + 1)}>
              <Card className="border-white/5 bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-10 group hover:border-white/10 transition-all hover:bg-white/[0.05] hover:-translate-y-2">
                <div className={`h-14 w-14 rounded-2xl ${feature.bg} flex items-center justify-center ${feature.color} mb-8 mb-8 border border-white/5 group-hover:scale-110 transition-all`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <div className="space-y-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{feature.title}</div>
                  <div className="text-xl font-display font-bold text-white leading-tight">{feature.desc}</div>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>
      </main>

      <footer className="mx-auto max-w-7xl px-6 py-20 relative z-10 lg:px-12 border-t border-white/5">
         <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-4">
               <GraduationCap className="h-6 w-6 text-white/20" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Quantumsync Infrastructure</span>
            </div>
            <div className="flex gap-10">
               <span className="text-[10px] font-black uppercase tracking-widest text-white/40 cursor-pointer hover:text-white transition-colors">Documentation</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-white/40 cursor-pointer hover:text-white transition-colors">Security</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-white/40 cursor-pointer hover:text-white transition-colors">Terms of Service</span>
            </div>
         </div>
      </footer>
    </div>
  );
}
