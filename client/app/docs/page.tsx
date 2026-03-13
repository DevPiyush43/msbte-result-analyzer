"use client";

import { AppShell } from "@/components/AppShell";
import { Protected } from "@/components/Protected";
import { PageHeader } from "@/components/PageHeader";
import { FadeIn, HoverLift } from "@/components/Animated";
import { Card, CardContent } from "@/components/ui/card";
import { FileUp, Search, Download, ShieldCheck, AlertCircle, Clock } from "lucide-react";

export default function DocsPage() {
  return (
    <Protected>
      <AppShell>
        <PageHeader 
          title={
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]">
                <FileUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="font-display font-black text-3xl text-white tracking-tight block">User Guide</span>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mt-1">Operational Protocol Documentation</p>
              </div>
            </div>
          }
          subtitle="Everything you need to know about navigating and understanding the MSBTE Result Analyzer."
          backHref="/dashboard"
          backLabel="Back to Dashboard"
        />

        <main className="mx-auto max-w-5xl px-6 py-12 lg:px-12">
          <FadeIn>
            <div className="space-y-16">
              
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-white/5" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Operational Workflow</h2>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                
                <div className="grid gap-8">
                  
                  <Card className="border-white/5 shadow-2xl rounded-[2.5rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden border-l-4 border-l-blue-500/50 group transition-all hover:bg-white/[0.04]">
                    <CardContent className="p-10">
                      <div className="flex gap-8">
                        <div className="flex-shrink-0">
                          <div className="h-14 w-14 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                            <FileUp className="h-7 w-7" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 tabular-nums">Step 01</span>
                            <h3 className="text-xl font-display font-black text-white tracking-tight">Base Ingress</h3>
                          </div>
                          <p className="text-white/40 leading-relaxed font-medium">
                            Start by uploading a binary Excel dataset containing student enrollment numbers. Ensure your <code className="text-blue-400 font-mono text-xs">.xlsx</code> file includes a validated <strong className="text-white/60">Enrollment Number</strong> field. Our system scans and batch-partitions these records dynamically.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/5 shadow-2xl rounded-[2.5rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden border-l-4 border-l-amber-500/50 group transition-all hover:bg-white/[0.04]">
                    <CardContent className="p-10">
                      <div className="flex gap-8">
                        <div className="flex-shrink-0">
                          <div className="h-14 w-14 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                            <Clock className="h-7 w-7" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 tabular-nums">Step 02</span>
                            <h3 className="text-xl font-display font-black text-white tracking-tight">Extraction Latency Protocols</h3>
                          </div>
                          <p className="text-white/40 leading-relaxed font-medium mb-6">
                            Once ingested, the system initiates a high-concurrency extraction task via headless browser instances against the official MSBTE portal.
                          </p>
                          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group/alert">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="flex items-center gap-3 text-amber-500 font-black text-[10px] uppercase tracking-[0.3em] mb-3">
                              <AlertCircle className="h-4 w-4" /> Latency Paradox Explained
                            </div>
                            <p className="text-white/40 text-sm leading-relaxed italic">
                              Node servers employ strict rate-limiting and <strong className="text-white/60">CAPTCHA sub-routines</strong>. To ensure protocol stability and prevent global IP bans, we inject randomized delays (5-15s) per node. Do not interrupt the handshake; the system is self-healing.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/5 shadow-2xl rounded-[2.5rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden border-l-4 border-l-emerald-500/50 group transition-all hover:bg-white/[0.04]">
                    <CardContent className="p-10">
                      <div className="flex gap-8">
                        <div className="flex-shrink-0">
                          <div className="h-14 w-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                            <Search className="h-7 w-7" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 tabular-nums">Step 03</span>
                            <h3 className="text-xl font-display font-black text-white tracking-tight">Real-time Observation</h3>
                          </div>
                          <p className="text-white/40 leading-relaxed font-medium">
                            Monitor live performance telemetry via the Metrics interface. The Analytical Engine handles statistical aggregations (subject coefficients, class medians, and toppers) in real-time as data converges.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/5 shadow-2xl rounded-[2.5rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden border-l-4 border-l-purple-500/50 group transition-all hover:bg-white/[0.04]">
                    <CardContent className="p-10">
                      <div className="flex gap-8">
                        <div className="flex-shrink-0">
                          <div className="h-14 w-14 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                            <Download className="h-7 w-7" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 tabular-nums">Step 04</span>
                            <h3 className="text-xl font-display font-black text-white tracking-tight">Export Synthesis</h3>
                          </div>
                          <p className="text-white/40 leading-relaxed font-medium">
                            Finalize the protocol by downloading the <strong className="text-white/60">Synthesized Excel Workbook</strong>. The output contains logical multi-tab partitioning (Core Analytics, Top 3 Metrics, Detailed Registry, and Distinctions).
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-10">
                  <div className="h-px flex-1 bg-white/5" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">System Architecture</h2>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                
                <Card className="border-white/5 shadow-2xl rounded-[3rem] bg-white/[0.01] backdrop-blur-3xl overflow-hidden border-t-white/10">
                  <CardContent className="p-12">
                    <div className="grid md:grid-cols-2 gap-12">
                       <div className="space-y-6">
                         <div className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded bg-primary/20 border border-primary/20 flex items-center justify-center">
                               <ShieldCheck className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Core Integrity</span>
                         </div>
                         <p className="text-white/40 text-sm leading-relaxed font-medium">
                            Our proprietary <strong className="text-white/60">Quantumsync Engine</strong> utilizes Node.js and <code className="text-primary font-mono text-xs bg-primary/10 px-2 py-0.5 rounded">puppeteer-core</code> to simulate human-like interactions across MSBTE nodes while maintaining strict data integrity.
                         </p>
                       </div>
                       <div className="space-y-6">
                         <div className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center">
                               <ShieldCheck className="h-3 w-3 text-emerald-400" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Secure Boundaries</span>
                         </div>
                         <p className="text-white/40 text-sm leading-relaxed font-medium">
                            All stored datasets implement <strong className="text-white/60">JWT Security Silos</strong>, ensuring extracted telemetry remains strictly visible only to authenticated teacher identities within your department cluster.
                         </p>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

            </div>
          </FadeIn>
        </main>
      </AppShell>
    </Protected>
  );
}
