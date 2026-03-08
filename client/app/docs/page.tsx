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
          title="User Guide & Documentation" 
          subtitle="Everything you need to know about navigating and understanding the MSBTE Result Analyzer."
          backHref="/dashboard"
          backLabel="Back to Dashboard"
        />

        <main className="mx-auto max-w-4xl px-4 py-8">
          <FadeIn>
            <div className="space-y-8">
              
              <section>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">How to Use the Application</h2>
                <div className="grid gap-6">
                  
                  <HoverLift>
                    <Card className="border-l-4 border-l-blue-600 shadow-sm transition-all hover:shadow-md">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                              <FileUp className="h-5 w-5" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">1. Uploading the Base Excel file</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">
                              Start by uploading an empty Excel sheet containing student enrollment numbers. Ensure your `.xlsx` file includes an <strong>Enrollment Number</strong> column. Our system will scan and batch these enrollments dynamically.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </HoverLift>

                  <HoverLift>
                    <Card className="border-l-4 border-l-indigo-600 shadow-sm transition-all hover:shadow-md">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                              <Clock className="h-5 w-5" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">2. Processing & Extraction Delays</h3>
                            <p className="text-slate-600 leading-relaxed text-sm mb-3">
                              Once uploaded, the system begins a background extraction task via headless browser interactions against the official MSBTE portal.
                            </p>
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                              <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-1">
                                <AlertCircle className="h-4 w-4" /> Why is there a delay?
                              </div>
                              <p className="text-amber-700 text-sm">
                                MSBTE servers employ strictly configured security measures, including <strong>CAPTCHA routines</strong> and <strong>Rate Limits</strong>. To respect their servers and prevent our application from getting IP-banned, we intentionally inject random delays (between 5-15 seconds) between extracting each student's marksheets. If a CAPTCHA occurs, the system automatically tries to solve it and slows down sequentially. Do not cancel the process if it feels slow, it is designed for stability!
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </HoverLift>

                  <HoverLift>
                    <Card className="border-l-4 border-l-emerald-600 shadow-sm transition-all hover:shadow-md">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                              <Search className="h-5 w-5" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">3. Analytics & Observation</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">
                              While the batch extracts, or after it completes, you can track performance metrics on the Results page. The Dashboard handles statistical aggregations (subject averages, passing rates, class topper) in real-time.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </HoverLift>

                  <HoverLift>
                    <Card className="border-l-4 border-l-purple-600 shadow-sm transition-all hover:shadow-md">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                              <Download className="h-5 w-5" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">4. Export Final Reports</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">
                              Once extraction concludes, click <strong>Download Analyzed Excel</strong>. The downloaded sheet securely formats records logically into multi-tab workbooks (Analytics, Top 3 Toppers, Details, Distinctions).
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </HoverLift>

                </div>
              </section>

              <div className="my-10 border-t border-slate-200"></div>

              <section>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">Implementation Brief</h2>
                <Card className="bg-slate-50 border-slate-200 shadow-inner">
                  <CardContent className="p-6">
                    <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                      <p>
                        <strong>Backend Engine:</strong> Based in Node.js, utilizing <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">puppeteer-core</code> to manage headless browser extraction asynchronously.
                      </p>
                      <p>
                        <strong>Data Visualization:</strong> Next.js and TailwindCSS provide the elegant responsive framework. Modern React practices drive our UI/UX, relying on unified states from our secure auth-context hooks to hydrate datasets seamlessly without page reloads.
                      </p>
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 text-slate-500">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span>All stored datasets implement JWT security boundaries meaning extracted metrics stay strictly visible only to your teacher ID.</span>
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
