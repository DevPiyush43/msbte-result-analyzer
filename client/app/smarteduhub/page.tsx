"use client";

import Link from "next/link";
import { ExternalLink, Star, Users, ClipboardList, AlertCircle, ShieldCheck, Sparkles } from "lucide-react";
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
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-[0_0_20px_rgba(var(--orange-500),0.1)]">
                <Star className="h-6 w-6 text-orange-500 fill-orange-500/20" />
              </div>
              <div>
                <span className="font-display font-black text-3xl text-white tracking-tight block">SmartEdu Hub</span>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mt-1">Unified Intelligence Nexus</p>
              </div>
            </div>
          }
          subtitle="The All-In-One Unified College Utility & Management System."
          backHref="/dashboard"
          backLabel="Back to Dashboard"
        />

        <main className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
          <FadeIn>
            <div className="mb-16 rounded-[3rem] bg-indigo-600 shadow-[0_0_100px_rgba(79,70,229,0.1)] p-12 lg:p-16 text-white relative overflow-hidden border border-white/10">
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/[0.1] rounded-full blur-3xl opacity-50" />
              
              <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-10">
                  <div>
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 border border-white/10 font-black text-[10px] uppercase tracking-[0.3em] mb-6">
                      <Sparkles className="h-4 w-4 text-orange-400" />
                      Platform Alpha
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-display font-black tracking-tighter leading-[0.95] mb-6 whitespace-pre-wrap">
                      Revolutionize <br/>Management
                    </h1>
                    <p className="text-white/60 text-lg leading-relaxed max-w-lg font-medium">
                      SmartEdu Hub connects teachers, administrators, and students under one single blazing-fast platform. Say goodbye to scattered spreadsheets and standalone tools.
                    </p>
                  </div>
                  
                  <Link href="https://tinyurl.com/yc7cx5dd" target="_blank" rel="noopener noreferrer" className="block w-fit">
                    <Button size="lg" className="h-16 rounded-2xl bg-white text-indigo-600 font-black uppercase tracking-widest text-[11px] px-10 hover:bg-orange-500 hover:text-white transition-all shadow-2xl active:scale-95 group">
                      Access Live Demo
                      <ExternalLink className="ml-3 h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </Link>
                </div>
                
                <div className="grid grid-cols-2 gap-6 relative">
                  <div className="absolute inset-0 bg-white/5 blur-3xl rounded-[3rem] -z-10" />
                  <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl transform hover:scale-105 transition-all duration-500">
                    <div className="h-12 w-12 bg-blue-500/20 text-blue-200 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="font-display font-black text-white text-lg mb-2 uppercase tracking-tight">Live Attendance</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30 leading-relaxed">Real-time tracking natively integrated.</div>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl transform hover:scale-105 transition-all duration-500 lg:translate-y-12">
                    <div className="h-12 w-12 bg-emerald-500/20 text-emerald-200 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                      <ClipboardList className="h-6 w-6" />
                    </div>
                    <div className="font-display font-black text-white text-lg mb-2 uppercase tracking-tight">UT Marks Tracker</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30 leading-relaxed">Automatically map and evaluate unit test scores.</div>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl transform hover:scale-105 transition-all duration-500">
                    <div className="h-12 w-12 bg-rose-500/20 text-rose-200 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/20">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <div className="font-display font-black text-white text-lg mb-2 uppercase tracking-tight">Defaulters List</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30 leading-relaxed">One-click defaulter generation and PDF exports.</div>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl transform hover:scale-105 transition-all duration-500 lg:translate-y-12">
                    <div className="h-12 w-12 bg-purple-500/20 text-purple-200 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div className="font-display font-black text-white text-lg mb-2 uppercase tracking-tight">Data Security</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30 leading-relaxed">Cloud backups and strict teacher role permissions.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-12 md:grid-cols-3">
               <Card className="border-white/5 shadow-2xl rounded-[3rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden border-t-white/10 group transition-all hover:bg-white/[0.04]">
                  <CardHeader className="p-10 pb-6">
                    <div className="text-emerald-400 font-black uppercase text-[10px] tracking-[0.4em] mb-4">Core Architecture</div>
                    <h3 className="text-2xl font-display font-black text-white tracking-tight group-hover:text-primary transition-colors">Advanced Analytics</h3>
                  </CardHeader>
                  <CardContent className="px-10 pb-10">
                    <p className="text-sm font-medium text-white/40 leading-relaxed">
                      Deep-dive into student performance metrics, identify learning gaps dynamically, and let the AI generate customized improvement roadmaps for underperforming departments.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-white/5 shadow-2xl rounded-[3rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden border-t-white/10 group transition-all hover:bg-white/[0.04]">
                  <CardHeader className="p-10 pb-6">
                    <div className="text-blue-400 font-black uppercase text-[10px] tracking-[0.4em] mb-4">Protocol Integration</div>
                    <h3 className="text-2xl font-display font-black text-white tracking-tight group-hover:text-primary transition-colors">Parent Gateway</h3>
                  </CardHeader>
                  <CardContent className="px-10 pb-10">
                    <p className="text-sm font-medium text-white/40 leading-relaxed">
                      Automated SMS and email triggers send vital updates (like low attendance alerts or exam scores) directly to parents seamlessly without manual staff work.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-white/5 shadow-2xl rounded-[3rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden border-t-white/10 group transition-all hover:bg-white/[0.04]">
                  <CardHeader className="p-10 pb-6">
                    <div className="text-orange-400 font-black uppercase text-[10px] tracking-[0.4em] mb-4">Bi-directional Sync</div>
                    <h3 className="text-2xl font-display font-black text-white tracking-tight group-hover:text-primary transition-colors">Unified Datasets</h3>
                  </CardHeader>
                  <CardContent className="px-10 pb-10">
                    <p className="text-sm font-medium text-white/40 leading-relaxed">
                      Results automatically imported from our MSBTE Analyzer tool flow straight into the student's central master record. Double-data entry is effectively eliminated.
                    </p>
                  </CardContent>
                </Card>
            </div>
            
          </FadeIn>
        </main>
      </AppShell>
    </Protected>
  );
}
