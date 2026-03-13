"use client";

import * as React from "react";
import Link from "next/link";
import {
  Layers, ExternalLink, Users, CheckSquare, AlertTriangle, BookOpen,
  Shield, GraduationCap, BarChart3, Bell, Calendar, ClipboardList,
  UserCheck, Star, ArrowRight, Globe, Smartphone, Lock, Activity,
  MessageSquare, ChevronRight, Zap, School, Phone, Mail, MapPin
} from "lucide-react";
import { motion } from "framer-motion";

import { Protected } from "@/components/Protected";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── DEMO URL — Replace with actual link when ready ──────────────────────
const SMART_EDU_HUB_URL = "https://smart-edu-hub-demo.vercel.app"; // placeholder

export default function SmartEduHubPage() {
  const [activeTab, setActiveTab] = React.useState<"overview" | "features" | "roles">("overview");

  return (
    <Protected>
      <AppShell>
        <PageHeader
          title={
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <span className="font-display font-black text-2xl text-slate-900 tracking-tight block">Smart Edu Hub</span>
                <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 mt-0.5">College Utility App · Companion Project</p>
              </div>
            </div>
          }
          subtitle="A comprehensive college management utility with attendance, roles, and student monitoring."
          backHref="/dashboard"
          actions={
            <a href={SMART_EDU_HUB_URL} target="_blank" rel="noopener noreferrer">
              <Button className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg transition-all hover:-translate-y-0.5">
                <ExternalLink className="h-4 w-4 mr-3" />
                Open App
              </Button>
            </a>
          }
        />

        <div className="mx-auto max-w-7xl px-6 py-10 relative z-10 space-y-10">

          {/* Hero Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
            <div className="relative px-10 py-16 flex flex-col lg:flex-row gap-10 items-center">
              <div className="flex-1 text-white">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest mb-6">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                  Companion Project by Piyush
                </div>
                <h1 className="text-4xl font-black tracking-tight leading-tight mb-4">
                  Smart Edu Hub
                </h1>
                <p className="text-emerald-100 text-base leading-relaxed max-w-lg mb-8">
                  A modern college utility application designed to streamline <strong className="text-white">attendance marking</strong>, 
                  automate <strong className="text-white">defaulter list creation</strong>, and enable seamless 
                  <strong className="text-white"> teacher-parent-student-admin</strong> communication and monitoring.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href={SMART_EDU_HUB_URL} target="_blank" rel="noopener noreferrer">
                    <Button className="h-12 px-8 bg-white text-emerald-700 hover:bg-emerald-50 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl transition-all hover:-translate-y-0.5">
                      <Globe className="h-4 w-4 mr-3" />
                      Visit Website (Demo)
                    </Button>
                  </a>
                  <Button variant="ghost" className="h-12 px-6 bg-white/10 text-white border border-white/20 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/20 transition-all">
                    <Smartphone className="h-4 w-4 mr-3" />
                    Mobile Friendly
                  </Button>
                </div>
              </div>
              <div className="hidden lg:flex shrink-0 w-72 flex-col gap-4">
                {[
                  { label: "Attendance Marking", icon: CheckSquare, color: "bg-white/10 border-white/20" },
                  { label: "Defaulter Alerts", icon: AlertTriangle, color: "bg-white/10 border-white/20" },
                  { label: "Student Monitoring", icon: Activity, color: "bg-white/10 border-white/20" },
                  { label: "Parent Dashboard", icon: Phone, color: "bg-white/10 border-white/20" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className={cn("flex items-center gap-4 px-5 py-4 rounded-xl border backdrop-blur-sm text-white", item.color)}
                    >
                      <Icon className="h-5 w-5 shrink-0 text-emerald-200" />
                      <span className="text-[11px] font-black uppercase tracking-wider">{item.label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Tab Nav */}
          <div className="flex gap-2 p-1 rounded-xl bg-slate-100 w-fit">
            {([
              { key: "overview", label: "Overview" },
              { key: "features", label: "Features" },
              { key: "roles", label: "User Roles" },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-5">
                {[
                  { label: "Total Users", value: "4 Roles", icon: Users, color: "bg-blue-50 text-blue-600 border-blue-100" },
                  { label: "Core Modules", value: "5+", icon: Layers, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                  { label: "Platform", value: "Web + Mobile", icon: Smartphone, color: "bg-purple-50 text-purple-600 border-purple-100" },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className={cn("p-6 rounded-2xl border bg-white text-center")}>
                      <div className={cn("h-12 w-12 rounded-2xl mx-auto mb-3 flex items-center justify-center border", s.color)}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <p className="text-2xl font-black text-slate-900">{s.value}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{s.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-7 rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">What is Smart Edu Hub?</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    Smart Edu Hub is a college management web application built as a companion project to MSBTE Result Analyzer. 
                    It solves day-to-day institutional workflow problems like attendance marking, defaulter management, and cross-role communication.
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    It supports four user types — <strong>Admin</strong>, <strong>Teacher</strong>, <strong>Student</strong>, and <strong>Parent</strong> — 
                    each with dedicated dashboards, role-appropriate permissions, and real-time monitoring capability.
                  </p>
                </div>
                <div className="p-7 rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Key Highlights</h3>
                  <div className="space-y-3">
                    {[
                      "Real-time attendance tracking with subject-wise breakdown",
                      "Automatic defaulter list generation (<75% threshold)",
                      "Parent notification for low attendance and poor marks",
                      "Teacher can upload marks and view class analytics",
                      "Admin controls all users and institutional settings",
                      "Student can view attendance, marks, and timetable",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3 text-sm text-slate-700">
                        <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Demo Notice */}
              <div className="p-6 rounded-2xl border border-emerald-100 bg-emerald-50 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-md">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-emerald-900">Demo Link Available</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Live demo is hosted at the button below. A permanent URL will be configured by the project author.</p>
                  </div>
                </div>
                <a href={SMART_EDU_HUB_URL} target="_blank" rel="noopener noreferrer">
                  <Button className="shrink-0 h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all">
                    Open Demo <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </a>
              </div>
            </motion.div>
          )}

          {/* Tab: Features */}
          {activeTab === "features" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: CheckSquare, color: "bg-blue-100 text-blue-700", title: "Attendance Marking", desc: "Teachers mark daily attendance per subject/period. System calculates percentage automatically and flags shortage below threshold." },
                { icon: AlertTriangle, color: "bg-red-100 text-red-700", title: "Defaulter List", desc: "Auto-generated defaulter report for students with <75% attendance. Exportable as PDF for institutional notices." },
                { icon: Users, color: "bg-purple-100 text-purple-700", title: "Multi-Role System", desc: "Admin, Teacher, Student, and Parent — each with separate login, scoped dashboard, and role-specific permissions." },
                { icon: Activity, color: "bg-amber-100 text-amber-700", title: "Analytics & Reports", desc: "Class-level attendance trends, subject-wise reports, and student performance charts for data-driven decisions." },
                { icon: Bell, color: "bg-rose-100 text-rose-700", title: "Notifications", desc: "Parents receive automated alerts when their ward's attendance drops or when exam marks are uploaded by the teacher." },
                { icon: ClipboardList, color: "bg-indigo-100 text-indigo-700", title: "Mark Management", desc: "Teachers can upload unit test, midterm, and final marks. Students view their marks per subject with grade projection." },
                { icon: Calendar, color: "bg-teal-100 text-teal-700", title: "Timetable View", desc: "Students can access their weekly timetable. Teachers see their class schedule for the day with room/subject info." },
                { icon: Shield, color: "bg-slate-100 text-slate-700", title: "Secure Auth", desc: "JWT-based authentication with role-verified access control. Each user sees only data they are authorized to access." },
                { icon: Smartphone, color: "bg-green-100 text-green-700", title: "Mobile-First UI", desc: "Fully responsive design optimized for mobile devices. Students and parents can check data on their phones anytime." },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
                    <div className={cn("h-10 w-10 rounded-xl mb-4 flex items-center justify-center", f.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-2">{f.title}</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* Tab: Roles */}
          {activeTab === "roles" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {[
                {
                  role: "Admin",
                  icon: Shield,
                  gradient: "from-purple-600 to-indigo-600",
                  badge: "bg-purple-50 text-purple-700 border-purple-100",
                  desc: "Full administrative control over the entire institution. Manages all users, departments, and system configuration.",
                  abilities: [
                    "Create and manage teacher/student/parent accounts",
                    "Configure departments, courses, and subjects",
                    "View all attendance and mark records",
                    "Generate institution-wide reports",
                    "Send broadcast notifications",
                    "Manage academic calendar and timetables",
                  ]
                },
                {
                  role: "Teacher",
                  icon: GraduationCap,
                  gradient: "from-blue-600 to-cyan-600",
                  badge: "bg-blue-50 text-blue-700 border-blue-100",
                  desc: "Subject teachers who mark daily attendance, upload marks, and monitor the academic progress of their assigned classes.",
                  abilities: [
                    "Mark subject-wise attendance for assigned classes",
                    "Upload unit test and exam marks",
                    "View class attendance summary and analytics",
                    "Generate and download defaulter lists",
                    "Send subject-specific notifications",
                    "View student profiles for their class",
                  ]
                },
                {
                  role: "Student",
                  icon: BookOpen,
                  gradient: "from-emerald-600 to-teal-600",
                  badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
                  desc: "Students can monitor their own academic data including attendance, marks, and timetable through a personalized dashboard.",
                  abilities: [
                    "View own subject-wise attendance percentage",
                    "See uploaded marks for all subjects",
                    "Check weekly timetable",
                    "Receive notifications from teachers/admin",
                    "Track defaulter status (if applicable)",
                    "View academic progress charts",
                  ]
                },
                {
                  role: "Parent",
                  icon: Phone,
                  gradient: "from-amber-600 to-orange-600",
                  badge: "bg-amber-50 text-amber-700 border-amber-100",
                  desc: "Parents get a transparent view of their ward's academic performance and receive automated alerts for attendance or mark issues.",
                  abilities: [
                    "Monitor ward's attendance in real-time",
                    "Receive auto-alerts for attendance shortage",
                    "View uploaded marks and grades",
                    "Get notifications from school/teacher",
                    "Access ward's timetable",
                    "Track academic performance over time",
                  ]
                },
              ].map((r) => {
                const Icon = r.icon;
                return (
                  <div key={r.role} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className={cn("bg-gradient-to-r px-8 py-6 text-white flex items-center gap-5", r.gradient)}>
                      <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black">{r.role}</h3>
                        <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest">User Role</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-slate-600 mb-5">{r.desc}</p>
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {r.abilities.map((a) => (
                          <div key={a} className="flex items-start gap-2 text-[11px] text-slate-700 font-bold">
                            <CheckSquare className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            {a}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* Bottom CTA */}
          <div className="rounded-2xl bg-slate-900 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white">
              <p className="font-black text-xl mb-1">Ready to explore Smart Edu Hub?</p>
              <p className="text-slate-400 text-sm">Open the live demo or wait for the production URL to be configured.</p>
            </div>
            <div className="flex gap-4 shrink-0">
              <a href={SMART_EDU_HUB_URL} target="_blank" rel="noopener noreferrer">
                <Button className="h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all">
                  <ExternalLink className="h-4 w-4 mr-3" />
                  Open Demo
                </Button>
              </a>
              <Link href="/docs">
                <Button variant="ghost" className="h-12 px-6 bg-slate-800 text-slate-200 border border-slate-700 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-700 transition-all">
                  <BookOpen className="h-4 w-4 mr-3" />
                  View Our Docs
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </AppShell>
    </Protected>
  );
}
