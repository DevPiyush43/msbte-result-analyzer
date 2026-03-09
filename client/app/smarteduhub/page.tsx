"use client";

import Link from "next/link";
import { ExternalLink, Star, Users, ClipboardList, AlertCircle, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Protected } from "@/components/Protected";
import { PageHeader } from "@/components/PageHeader";
import { FadeIn, HoverLift } from "@/components/Animated";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SmartEduHubPage() {
  return (
    <Protected>
      <AppShell>
        <PageHeader 
          title={
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 text-orange-500 fill-orange-500" />
              <span>SmartEdu Hub</span>
            </div>
          }
          subtitle="The All-In-One Unified College Utility & Management System."
          backHref="/dashboard"
          backLabel="Back to Dashboard"
        />

        <main className="mx-auto max-w-5xl px-4 py-8">
          <FadeIn>
            <div className="mb-10 rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 p-8 shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
              
              <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-200">
                    Revolutionize <br/>College Management
                  </h1>
                  <p className="text-blue-100 text-lg leading-relaxed mb-8">
                    SmartEdu Hub connects teachers, administrators, and students under one single blazing-fast platform. Say goodbye to scattered spreadsheets and standalone tools.
                  </p>
                  
                  <Link href="https://tinyurl.com/yc7cx5dd" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-bold border-none shadow-xl shadow-orange-500/30 text-base">
                      Access Live Demo
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <div className="h-10 w-10 bg-blue-500/20 text-blue-200 rounded-full flex items-center justify-center mb-3">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="font-semibold mb-1">Live Attendance</div>
                    <div className="text-xs text-blue-200">Real-time tracking natively integrated.</div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 mt-6">
                    <div className="h-10 w-10 bg-emerald-500/20 text-emerald-200 rounded-full flex items-center justify-center mb-3">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div className="font-semibold mb-1">UT Marks Tracker</div>
                    <div className="text-xs text-blue-200">Automatically map and evaluate unit test scores.</div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <div className="h-10 w-10 bg-rose-500/20 text-rose-200 rounded-full flex items-center justify-center mb-3">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div className="font-semibold mb-1">Defaulters List</div>
                    <div className="text-xs text-blue-200">One-click defaulter generation and PDF exports.</div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 mt-6">
                    <div className="h-10 w-10 bg-purple-500/20 text-purple-200 rounded-full flex items-center justify-center mb-3">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="font-semibold mb-1">Data Security</div>
                    <div className="text-xs text-blue-200">Cloud backups and strict teacher role permissions.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <HoverLift>
                <Card className="h-full border-t-4 border-t-emerald-500">
                  <CardHeader>
                    <div className="text-emerald-600 font-semibold mb-1">Core Feature</div>
                    <h3 className="text-xl font-bold text-slate-900">Advanced Analytics</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Deep-dive into student performance metrics, identify learning gaps dynamically, and let the AI generate customized improvement roadmaps for underperforming departments.
                    </p>
                  </CardContent>
                </Card>
              </HoverLift>

              <HoverLift>
                <Card className="h-full border-t-4 border-t-blue-500">
                  <CardHeader>
                    <div className="text-blue-600 font-semibold mb-1">Core Feature</div>
                    <h3 className="text-xl font-bold text-slate-900">Parent Integration</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Automated SMS and email triggers send vital updates (like low attendance alerts or exam scores) directly to parents seamlessly without manual staff work.
                    </p>
                  </CardContent>
                </Card>
              </HoverLift>

              <HoverLift>
                <Card className="h-full border-t-4 border-t-orange-500">
                  <CardHeader>
                    <div className="text-orange-600 font-semibold mb-1">Core Feature</div>
                    <h3 className="text-xl font-bold text-slate-900">Seamless Sync</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Results automatically imported from our MSBTE Analyzer tool flow straight into the student's central master record. Double-data entry is effectively eliminated.
                    </p>
                  </CardContent>
                </Card>
              </HoverLift>
            </div>
            
          </FadeIn>
        </main>
      </AppShell>
    </Protected>
  );
}
