"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen, Code2, Database, Server, Layout, Shield, Upload, BarChart3, FileJson,
  ChevronRight, ExternalLink, CheckCircle2, AlertCircle, Info, Zap, Globe,
  GraduationCap, Users, Activity, FileText, Terminal, Layers, Lock, Settings,
  ArrowRight, HelpCircle, Star
} from "lucide-react";
import { motion } from "framer-motion";

import { Protected } from "@/components/Protected";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sections = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "getting-started", label: "Getting Started", icon: Zap },
  { id: "architecture", label: "Architecture", icon: Layers },
  { id: "features", label: "Features", icon: Star },
  { id: "user-roles", label: "User Roles", icon: Users },
  { id: "upload-guide", label: "Upload Guide", icon: Upload },
  { id: "reports", label: "Reports & Exports", icon: FileJson },
  { id: "api-reference", label: "API Reference", icon: Code2 },
  { id: "faq", label: "FAQ", icon: HelpCircle },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = React.useState("overview");

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Protected>
      <AppShell>
        <PageHeader
          title={
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <span className="font-display font-black text-2xl text-slate-900 tracking-tight block">Documentation</span>
                <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 mt-0.5">MSBTE Result Analyzer System · v2.0</p>
              </div>
            </div>
          }
          subtitle="Complete guide for setup, usage, and administration of the platform."
          backHref="/dashboard"
        />

        <div className="mx-auto max-w-7xl px-6 py-10 relative z-10">
          <div className="flex gap-8">
            {/* Sidebar TOC */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-8">
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Table of Contents</p>
                  </div>
                  <nav className="p-3 space-y-0.5">
                    {sections.map((s) => {
                      const Icon = s.icon;
                      return (
                        <button
                          key={s.id}
                          onClick={() => scrollTo(s.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-[11px] font-bold uppercase tracking-wider",
                            activeSection === s.id
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          <Icon className={cn("h-4 w-4 shrink-0", activeSection === s.id ? "text-indigo-600" : "text-slate-400")} />
                          {s.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mb-2">Quick Links</p>
                  <div className="space-y-2">
                    <Link href="/upload" className="flex items-center gap-2 text-[10px] font-bold text-indigo-700 hover:text-indigo-900">
                      <ArrowRight className="h-3 w-3" /> Upload Batch
                    </Link>
                    <Link href="/dashboard" className="flex items-center gap-2 text-[10px] font-bold text-indigo-700 hover:text-indigo-900">
                      <ArrowRight className="h-3 w-3" /> Teacher Dashboard
                    </Link>
                    <Link href="/exports" className="flex items-center gap-2 text-[10px] font-bold text-indigo-700 hover:text-indigo-900">
                      <ArrowRight className="h-3 w-3" /> Smart Reports
                    </Link>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0 space-y-12">

              {/* Overview */}
              <section id="overview" className="scroll-mt-8">
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-10 text-white">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black tracking-tight">MSBTE Result Analyzer System</h2>
                        <p className="text-indigo-200 text-[11px] font-bold uppercase tracking-widest">Academic Performance Intelligence Platform</p>
                      </div>
                    </div>
                    <p className="text-indigo-100 text-sm leading-relaxed max-w-2xl">
                      A full-stack web application designed for polytechnic teachers to automate bulk MSBTE student result extraction, 
                      analyze academic performance, and generate institutional-grade Excel reports — eliminating manual record checking.
                    </p>
                  </div>
                  <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: "Total Students", value: "500+", icon: Users, color: "text-blue-600 bg-blue-50" },
                      { label: "Report Formats", value: "3 Types", icon: FileJson, color: "text-emerald-600 bg-emerald-50" },
                      { label: "Auto Extraction", value: "MSBTE API", icon: Zap, color: "text-amber-600 bg-amber-50" },
                      { label: "User Roles", value: "3 Levels", icon: Shield, color: "text-purple-600 bg-purple-50" },
                    ].map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div key={stat.label} className="text-center">
                          <div className={cn("h-12 w-12 rounded-2xl mx-auto mb-3 flex items-center justify-center", stat.color)}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <p className="text-xl font-black text-slate-900">{stat.value}</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{stat.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Getting Started */}
              <section id="getting-started" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Getting Started</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { step: "01", title: "Login to the System", desc: "Use your assigned username and password at the Login Portal. Teachers use individual credentials (e.g., CSS/CSS123). Admins use admin/admin123.", icon: Lock },
                    { step: "02", title: "Prepare your XLSX File", desc: "Export the student enrollment list from MSBTE portal. Ensure columns: Enrollment Number is present. The file must be in .xlsx format.", icon: FileText },
                    { step: "03", title: "Upload the Batch", desc: "Navigate to Upload → Select Batch File → Click Upload Records. The system will parse enrollments and initiate extraction.", icon: Upload },
                    { step: "04", title: "Start Extraction", desc: "On the Batch Details page, click Start Protocol. The system will fetch results from MSBTE for each student. Enter the CAPTCHA when prompted.", icon: Zap },
                    { step: "05", title: "Download Reports", desc: "Once extraction completes, go to Smart Reports to download Format A (Full), Format B (Top 3), or Format C (Subject-wise).", icon: FileJson },
                  ].map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.step} className="flex gap-5 p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all">
                        <div className="shrink-0">
                          <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md">
                            {s.step}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Icon className="h-4 w-4 text-indigo-600" />
                            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">{s.title}</h3>
                          </div>
                          <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Architecture */}
              <section id="architecture" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Layers className="h-4 w-4 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">System Architecture</h2>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    {[
                      { 
                        label: "Frontend", icon: Layout, color: "bg-blue-50 text-blue-600",
                        tech: ["Next.js 15 (App Router)", "TypeScript", "Tailwind CSS", "Framer Motion", "Axios", "React Hook Form"],
                        desc: "Responsive SPA with institutional theme, real-time extraction monitor, and multi-format export triggering."
                      },
                      { 
                        label: "Backend", icon: Server, color: "bg-emerald-50 text-emerald-600",
                        tech: ["Node.js (Express)", "MongoDB (Mongoose)", "JWT Auth", "bcryptjs", "ExcelJS", "Puppeteer / Axios"],
                        desc: "RESTful API handling batch processing, MSBTE portal scraping, user management, and XLSX generation."
                      },
                      { 
                        label: "Infrastructure", icon: Database, color: "bg-amber-50 text-amber-600",
                        tech: ["MongoDB Atlas (Cloud DB)", "Vercel (Frontend)", "Railway / Render (Backend)", "Environment Variables", "CORS Config"],
                        desc: "Serverless-friendly deployment with environment-based config across dev and production stages."
                      },
                    ].map((tier) => {
                      const Icon = tier.icon;
                      return (
                        <div key={tier.label} className="p-7">
                          <div className={cn("h-10 w-10 rounded-xl mb-4 flex items-center justify-center", tier.color)}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-2">{tier.label}</h3>
                          <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">{tier.desc}</p>
                          <div className="space-y-1.5">
                            {tier.tech.map((t) => (
                              <div key={t} className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                                {t}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Features */}
              <section id="features" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Star className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Core Features</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { icon: Upload, color: "bg-blue-100 text-blue-700", title: "Bulk XLSX Upload", desc: "Upload a standardized MSBTE student list. The system parses enrollment numbers and queues all students for automated result fetching." },
                    { icon: Zap, color: "bg-amber-100 text-amber-700", title: "Automated Extraction", desc: "Connects to MSBTE portal in the background, fetches result pages per student, and parses HTML for marks, grade, and status." },
                    { icon: Activity, color: "bg-purple-100 text-purple-700", title: "Real-time Monitoring", desc: "Live extraction progress dashboard showing processed/success/failed counts with a CAPTCHA bypass interface when required." },
                    { icon: BarChart3, color: "bg-indigo-100 text-indigo-700", title: "Analytics Dashboard", desc: "Batch-level and aggregate analytics: pass rate, KT count, class distribution, subject averages, and top performer identification." },
                    { icon: FileJson, color: "bg-emerald-100 text-emerald-700", title: "Smart Reports (3 Formats)", desc: "Export Format A (full result sheet), Format B (top 3 students), or Format C (subject-wise performance analysis) — all as Excel." },
                    { icon: Users, color: "bg-rose-100 text-rose-700", title: "Teacher Management", desc: "Admin can create, disable, and manage teacher accounts. Each teacher operates independently with their own batch history." },
                    { icon: Shield, color: "bg-slate-100 text-slate-700", title: "Role-based Access", desc: "3-tier role system: SYSTEM_ADMIN (full access), ADMIN (user management), TEACHER (batch operations only)." },
                    { icon: GraduationCap, color: "bg-teal-100 text-teal-700", title: "Student Profiles", desc: "Detailed individual student profile pages showing subject-wise marks, percentage, result class, and other extracted metadata." },
                  ].map((f) => {
                    const Icon = f.icon;
                    return (
                      <div key={f.title} className="p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all group">
                        <div className={cn("h-10 w-10 rounded-xl mb-4 flex items-center justify-center", f.color)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-2">{f.title}</h3>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{f.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* User Roles */}
              <section id="user-roles" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-xl bg-rose-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-rose-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">User Roles & Credentials</h2>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      role: "SYSTEM_ADMIN", badge: "bg-purple-100 text-purple-700 border-purple-200",
                      desc: "Full system access. Can manage all users, view all batches, access settings, and seed/reset the database.",
                      permissions: ["Manage all teachers", "Manage admins", "System settings", "View all batches", "All exports"],
                      creds: { user: "system_admin", pass: "(set via env)" }
                    },
                    {
                      role: "ADMIN", badge: "bg-blue-100 text-blue-700 border-blue-200",
                      desc: "Manages teacher accounts. Cannot access individual teacher batch data but can create/disable accounts.",
                      permissions: ["Create teacher accounts", "Disable/enable teachers", "View user list", "Access dashboard"],
                      creds: { user: "admin", pass: "admin123" }
                    },
                    {
                      role: "TEACHER", badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
                      desc: "Primary user. Can upload batches, run extractions, view analytics, and download reports.",
                      permissions: ["Upload XLSX batches", "Run extraction", "View results", "Download reports", "Student profiles"],
                      creds: null
                    }
                  ].map((r) => (
                    <div key={r.role} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border", r.badge)}>{r.role}</span>
                        {r.creds && (
                          <div className="flex items-center gap-3 ml-auto">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Login:</span>
                            <code className="text-[10px] font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg">{r.creds.user} / {r.creds.pass}</code>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-4">{r.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        {r.permissions.map((p) => (
                          <span key={p} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[9px] font-bold text-slate-600 uppercase tracking-wider">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Teacher Accounts Table */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                      <Shield className="h-4 w-4 text-indigo-600" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">Predefined Teacher Accounts</p>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                          <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-left">Username</th>
                          <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-left">Password</th>
                          <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-left">Role</th>
                          <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { user: "CSS", pass: "CSS123" },
                          { user: "DFH", pass: "Dfh123" },
                          { user: "ETI", pass: "ETI123" },
                          { user: "MAN", pass: "MAN123" },
                          { user: "NIS", pass: "Nis123" },
                          { user: "SFT", pass: "SFT123" },
                        ].map((t) => (
                          <tr key={t.user} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4"><code className="text-[11px] font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">{t.user}</code></td>
                            <td className="px-6 py-4"><code className="text-[11px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">{t.pass}</code></td>
                            <td className="px-6 py-4"><span className="text-[9px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">Teacher</span></td>
                            <td className="px-6 py-4"><span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Active</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Upload Guide */}
              <section id="upload-guide" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Upload className="h-4 w-4 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Upload Guide</h2>
                </div>
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl border border-blue-100 bg-blue-50">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-blue-800 mb-1">File Requirements</p>
                        <p className="text-sm text-blue-700">Upload only <strong>.xlsx</strong> files. The spreadsheet must contain student enrollment numbers in the first column. Files with extra sheets or non-standard formatting may fail validation.</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl border border-amber-100 bg-amber-50">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-amber-800 mb-1">CAPTCHA Notice</p>
                        <p className="text-sm text-amber-700">MSBTE portal shows a CAPTCHA for each result fetch. The system will pause and prompt you to solve the CAPTCHA. Enter it in the large input field and click <strong>Submit Authorization</strong>. The image is enlarged for easier reading.</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700 mb-4">Extraction Controls</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { label: "Start Extraction", desc: "Initiates automated fetching from MSBTE for all students in the batch.", color: "text-blue-700" },
                        { label: "Emergency Halt", desc: "Stops the extraction mid-process. You can resume by clicking Start again.", color: "text-rose-700" },
                        { label: "Reparse Dataset", desc: "Re-processes already fetched HTML data without hitting MSBTE again.", color: "text-emerald-700" },
                        { label: "Retry Unverified", desc: "Re-queues students with Unknown or Error status for another fetch attempt.", color: "text-amber-700" },
                      ].map((c) => (
                        <div key={c.label} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", c.color)}>{c.label}</p>
                          <p className="text-[11px] text-slate-500">{c.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Reports */}
              <section id="reports" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <FileJson className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Reports & Exports</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { format: "Format A", title: "Full Result Sheet", badge: "bg-blue-50 text-blue-700", desc: "Complete student data including enrollment, seat number, name, subject-wise marks, total, percentage, and pass/fail status for all students in the batch.", fields: ["Enrollment No.", "Seat No.", "Student Name", "Subject Marks", "Total / Percentage", "Result Status"] },
                    { format: "Format B", title: "Top 3 Performers", badge: "bg-amber-50 text-amber-700", desc: "Highlights the top 3 students by percentage in the batch. Useful for merit certificates and institutional recognition records.", fields: ["Rank 1/2/3", "Student Name", "Total Marks", "Percentage Obtained", "Batch Info"] },
                    { format: "Format C", title: "Subject-wise Analysis", badge: "bg-emerald-50 text-emerald-700", desc: "Per-subject breakdown with number of students appeared, passed, failed, and average marks. KT students are flagged appropriately.", fields: ["Subject Name", "Total Appeared", "Total Passed", "Total Failed", "Average Marks", "KT Remarks"] },
                  ].map((r) => (
                    <div key={r.format} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className={cn("inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mb-3", r.badge)}>{r.format}</div>
                      <h3 className="font-black text-slate-900 text-sm mb-2">{r.title}</h3>
                      <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">{r.desc}</p>
                      <div className="space-y-1">
                        {r.fields.map((f) => (
                          <div key={f} className="flex items-center gap-2 text-[10px] text-slate-600 font-bold">
                            <div className="h-1 w-1 rounded-full bg-slate-400" />
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* API Reference */}
              <section id="api-reference" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Code2 className="h-4 w-4 text-slate-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">API Reference</h2>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-900">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Core API Endpoints · Base URL: /api</p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {[
                      { method: "POST", method_color: "bg-blue-600", path: "/v2/auth/login", desc: "Authenticate with username + password. Returns JWT token." },
                      { method: "GET", method_color: "bg-emerald-600", path: "/v2/auth/me", desc: "Get current logged-in user profile (requires Bearer token)." },
                      { method: "POST", method_color: "bg-blue-600", path: "/batches/upload", desc: "Upload XLSX file. Returns batchId and parsed enrollment list." },
                      { method: "GET", method_color: "bg-emerald-600", path: "/batches/recent", desc: "Fetch the most recent batches for dashboard display." },
                      { method: "GET", method_color: "bg-emerald-600", path: "/batches/:id", desc: "Get detailed batch data including all student results." },
                      { method: "POST", method_color: "bg-blue-600", path: "/fetch/start/:batchId", desc: "Start automated extraction for a batch." },
                      { method: "POST", method_color: "bg-blue-600", path: "/fetch/captcha/:batchId", desc: "Submit CAPTCHA solution to resume extraction." },
                      { method: "GET", method_color: "bg-emerald-600", path: "/batches/:id/export", desc: "Download Format A full Excel report for a batch." },
                      { method: "GET", method_color: "bg-emerald-600", path: "/batches/analytics/summary", desc: "Get aggregate analytics across all batches." },
                      { method: "GET", method_color: "bg-amber-600", path: "/admin/users", desc: "List all users (ADMIN/SYSTEM_ADMIN only)." },
                    ].map((ep) => (
                      <div key={ep.path} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                        <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black text-white uppercase shrink-0", ep.method_color)}>{ep.method}</span>
                        <code className="text-[11px] font-mono font-bold text-slate-800 flex-1">{ep.path}</code>
                        <p className="text-[10px] text-slate-500 hidden md:block">{ep.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* FAQ */}
              <section id="faq" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-xl bg-orange-100 flex items-center justify-center">
                    <HelpCircle className="h-4 w-4 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { q: "Why are some students showing 'Unknown' status?", a: "Unknown typically means the extraction ran but the result page returned an unexpected format. Use 'Retry Unverified' to re-attempt those students." },
                    { q: "The CAPTCHA is hard to read. Can I refresh it?", a: "Yes! Click the circular refresh button (↻) on the top-right corner of the CAPTCHA image box to load a new CAPTCHA image." },
                    { q: "Can I upload multiple batches at the same time?", a: "Only one active extraction should run at a time per account. You can upload multiple batches and run them sequentially." },
                    { q: "Why is the percentage showing 0% for some students?", a: "Students with KT (failed) status may show 0% or KT as their percentage. This is pulled directly from MSBTE data." },
                    { q: "How do I add a new teacher?", a: "Login as admin (admin/admin123), navigate to User Management, and click 'Add New User'. Fill in the teacher details including username and password." },
                    { q: "Are reports saved on the server?", a: "Reports are generated on-demand and not stored. Each download generates a fresh Excel file from the current database state." },
                  ].map((faq) => (
                    <details key={faq.q} className="group rounded-xl border border-slate-200 bg-white overflow-hidden">
                      <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-black text-sm text-slate-900 hover:bg-slate-50 transition-colors list-none">
                        <span>{faq.q}</span>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-open:rotate-90 transition-transform shrink-0" />
                      </summary>
                      <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </section>

              {/* Footer CTA */}
              <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white text-center">
                <GraduationCap className="h-10 w-10 mx-auto mb-4 opacity-80" />
                <h3 className="text-xl font-black mb-2">Ready to get started?</h3>
                <p className="text-indigo-200 text-sm mb-6">Upload your first MSBTE result batch and experience automated academic analysis.</p>
                <Link href="/upload">
                  <Button className="bg-white text-indigo-700 hover:bg-indigo-50 font-black px-8 h-12 rounded-xl uppercase tracking-widest text-[11px] shadow-lg">
                    <Upload className="h-4 w-4 mr-3" />
                    Upload First Batch
                  </Button>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}
