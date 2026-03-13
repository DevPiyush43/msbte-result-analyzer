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
               <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                <FileUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="font-display font-black text-3xl text-foreground tracking-tight block">User Guide</span>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Operational Documentation</p>
              </div>
            </div>
          }
          subtitle="Learn how to navigate and utilize the MSBTE Result Analyzer efficiently."
          backHref="/dashboard"
          backLabel="Back to Dashboard"
        />

        <main className="mx-auto max-w-5xl px-8 py-12 lg:px-12">
          <FadeIn>
            <div className="space-y-16">
              
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-border" />
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">System Workflow</h2>
                  <div className="h-px flex-1 bg-border" />
                </div>
                
                <div className="grid gap-8">
                  
                  <Card className="border-border shadow-xl rounded-[2.5rem] bg-white overflow-hidden border-l-4 border-l-primary group transition-all hover:-translate-y-1">
                    <CardContent className="p-10">
                      <div className="flex gap-8">
                        <div className="flex-shrink-0">
                          <div className="h-14 w-14 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <FileUp className="h-7 w-7" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 tabular-nums">Step 01</span>
                            <h3 className="text-xl font-display font-black text-foreground tracking-tight">Upload Students</h3>
                          </div>
                          <p className="text-muted-foreground leading-relaxed font-medium">
                            Start by uploading an Excel file containing student enrollment numbers. Ensure your <code className="text-primary font-mono text-xs">.xlsx</code> file includes a column named <strong className="text-foreground">Enrollment Number</strong>. The system will automatically validate and organize these records.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border shadow-xl rounded-[2.5rem] bg-white overflow-hidden border-l-4 border-l-secondary group transition-all hover:-translate-y-1">
                    <CardContent className="p-10">
                      <div className="flex gap-8">
                        <div className="flex-shrink-0">
                          <div className="h-14 w-14 bg-secondary/10 border border-secondary/20 text-secondary rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Clock className="h-7 w-7" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-[10px] font-black text-secondary uppercase tracking-widest px-3 py-1 rounded-lg bg-secondary/10 border border-secondary/20 tabular-nums">Step 02</span>
                            <h3 className="text-xl font-display font-black text-foreground tracking-tight">Result Extraction</h3>
                          </div>
                          <p className="text-muted-foreground leading-relaxed font-medium mb-6">
                            Once uploaded, click 'Extract Results'. The system will fetch actual student marks directly from the MSBTE portal using secure automated browsing.
                          </p>
                          <div className="bg-accent/40 p-8 rounded-[2rem] border border-border relative overflow-hidden">
                            <div className="flex items-center gap-3 text-secondary font-black text-[10px] uppercase tracking-widest mb-3">
                              <AlertCircle className="h-4 w-4" /> Why does it take time?
                            </div>
                            <p className="text-muted-foreground text-sm leading-relaxed italic">
                              To prevent server overloads and ensure data accuracy, the system processes results in small batches. This prevents IP bans from MSBTE servers and ensures every student's data is verified successfully. Please do not close the window during processing.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border shadow-xl rounded-[2.5rem] bg-white overflow-hidden border-l-4 border-l-emerald-500 group transition-all hover:-translate-y-1">
                    <CardContent className="p-10">
                      <div className="flex gap-8">
                        <div className="flex-shrink-0">
                          <div className="h-14 w-14 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Search className="h-7 w-7" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-100 tabular-nums">Step 03</span>
                            <h3 className="text-xl font-display font-black text-foreground tracking-tight">Dashboard Analytics</h3>
                          </div>
                          <p className="text-muted-foreground leading-relaxed font-medium">
                            Once extraction is complete, view the Teacher Dashboard for comprehensive analytics. The system generates subject-wise failure heatmaps, merit lists, and overall class performance statistics automatically.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border shadow-xl rounded-[2.5rem] bg-white overflow-hidden border-l-4 border-l-blue-500 group transition-all hover:-translate-y-1">
                    <CardContent className="p-10">
                      <div className="flex gap-8">
                        <div className="flex-shrink-0">
                          <div className="h-14 w-14 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Download className="h-7 w-7" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-3 py-1 rounded-lg bg-blue-50 border border-blue-100 tabular-nums">Step 04</span>
                            <h3 className="text-xl font-display font-black text-foreground tracking-tight">Download Reports</h3>
                          </div>
                          <p className="text-muted-foreground leading-relaxed font-medium">
                            Finalize your analysis by downloading formatted Excel reports. These include multi-tab workbooks with the Top 3 Students, All Student Results, and Subject-wise Distinctions for your department records.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-10">
                  <div className="h-px flex-1 bg-border" />
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Security & Integrity</h2>
                  <div className="h-px flex-1 bg-border" />
                </div>
                
                <Card className="border-border shadow-xl rounded-[3rem] bg-white overflow-hidden border-t-accent/50">
                  <CardContent className="p-12">
                    <div className="grid md:grid-cols-2 gap-12">
                       <div className="space-y-6">
                         <div className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
                               <ShieldCheck className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data Accuracy</span>
                         </div>
                         <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                            The <strong className="text-foreground">MSBTE Result Engine</strong> uses authenticated scraping protocols to ensure every mark is extracted exactly as it appears on the official portal, eliminating human entry errors.
                         </p>
                       </div>
                       <div className="space-y-6">
                         <div className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                               <ShieldCheck className="h-3 w-3 text-emerald-600" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Privacy Protection</span>
                         </div>
                         <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                            Student data is stored using secure encryption and is only accessible to authenticated faculty members. Your extracted datasets are private to your account and department.
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
