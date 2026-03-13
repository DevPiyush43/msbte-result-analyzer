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
               <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-sm">
                <Star className="h-5 w-5 text-orange-500 fill-orange-500/20" />
              </div>
              <div>
                <span className="font-display font-black text-2xl text-foreground tracking-tight block">SmartEdu Hub</span>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Management System</p>
              </div>
            </div>
          }
          subtitle="The complete institutional utility for student management."
          backHref="/dashboard"
          backLabel="Back to Dashboard"
        />

        <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <FadeIn>
            <div className="mb-12 rounded-[2.5rem] bg-primary shadow-xl p-10 lg:p-14 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
              <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div>
                    <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 font-black text-[9px] uppercase tracking-[0.2em] mb-4">
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
                <Card className="border-border shadow-xl rounded-[3rem] bg-white overflow-hidden group transition-all hover:-translate-y-1">
                  <CardHeader className="p-10 pb-6">
                    <div className="text-secondary font-bold uppercase text-[10px] tracking-widest mb-4">Academic Data Layers</div>
                    <h3 className="text-2xl font-display font-black text-foreground tracking-tight group-hover:text-primary transition-colors">Advanced Analytics</h3>
                  </CardHeader>
                  <CardContent className="px-10 pb-10">
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      Deep-dive into student performance metrics, identify learning gaps dynamically, and generate customized improvement plans for individual departments.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border shadow-xl rounded-[3rem] bg-white overflow-hidden group transition-all hover:-translate-y-1">
                  <CardHeader className="p-10 pb-6">
                    <div className="text-blue-600 font-bold uppercase text-[10px] tracking-widest mb-4">Communication Hub</div>
                    <h3 className="text-2xl font-display font-black text-foreground tracking-tight group-hover:text-primary transition-colors">Parent Gateway</h3>
                  </CardHeader>
                  <CardContent className="px-10 pb-10">
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      Automated SMS and email notifications send vital updates like attendance alerts or exam scores directly to parents, ensuring constant academic engagement.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border shadow-xl rounded-[3rem] bg-white overflow-hidden group transition-all hover:-translate-y-1">
                  <CardHeader className="p-10 pb-6">
                    <div className="text-orange-600 font-bold uppercase text-[10px] tracking-widest mb-4">Unified Academic Sync</div>
                    <h3 className="text-2xl font-display font-black text-foreground tracking-tight group-hover:text-primary transition-colors">Centralized Records</h3>
                  </CardHeader>
                  <CardContent className="px-10 pb-10">
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      Results automatically imported from our MSBTE Analyzer tool flow straight into the central master records, effectively eliminating manual data entry errors.
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
