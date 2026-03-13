"use client";

import * as React from "react";
import { 
  FileJson, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText,
  ChevronRight,
  Search,
  Calendar,
  BarChart,
  Trophy,
  Activity,
  Archive,
  Loader2,
  Package
} from "lucide-react";
import { motion } from "framer-motion";

import { Protected } from "@/components/Protected";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { FadeIn, FadeInStagger, FadeInStaggerItem } from "@/components/Animated";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type BatchSummary = {
  id: string;
  uploadDate: string;
  totalStudents: number;
  passCount: number;
  failCount: number;
  ktCount: number;
  status: string;
};

export default function ExportsPage() {
  const [batches, setBatches] = React.useState<BatchSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);
  const [downloadingZipId, setDownloadingZipId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/batches/recent");
        setBatches(res.data.batches || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredBatches = batches.filter(b => 
    new Date(b.uploadDate).toLocaleDateString().includes(search)
  );

  const exportTypes = [
    { id: "pass_students", label: "Pass Students", format: "Excel Document", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { id: "fail_students", label: "Fail Students", format: "Excel Document", icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
    { id: "kt_analysis", label: "KT Analysis", format: "Excel Document", icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
    { id: "full_consolidated", label: "Full Consolidated", format: "Excel Document", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    
    { id: "format_a", label: "Format A: Analysis", format: "Excel Document", icon: BarChart, color: "text-purple-600", bg: "bg-purple-50" },
    { id: "format_b", label: "Format B: Toppers", format: "Excel Document", icon: Trophy, color: "text-pink-600", bg: "bg-pink-50" },
    { id: "format_c", label: "Format C: Subject-wise", format: "Excel Document", icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
    { id: "comprehensive_summary", label: "Comprehensive Report", format: "Excel Document", icon: Archive, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  const handleExport = async (batchId: string, type: string) => {
    try {
      setDownloadingId(`${batchId}-${type}`);

      const res = await api.get(`/batches/${batchId}/export/v2`);
      const { reports } = res.data;
      
      const base64 = reports?.[type];
      
      if (!base64) {
        throw new Error("Report data missing from system.");
      }

      const binaryString = window.atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filenames: Record<string, string> = {
        pass_students: "Pass_Students_Report",
        fail_students: "Fail_Students_Report",
        kt_analysis: "KT_Analysis_Report",
        full_consolidated: "Full_Consolidated_Report",
        format_a: "Format_A_Analysis",
        format_b: "Format_B_Toppers",
        format_c: "Format_C_SubjectWise",
        comprehensive_summary: "Comprehensive_Report"
      };
      a.download = `${filenames[type] || "Report"}_${batchId.slice(-6)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to extract analytical report. Ensure batch processing is complete.");
    } finally {
      setDownloadingId(null);
    }
  };

  const downloadAllReports = async (batchId: string) => {
    try {
      setDownloadingZipId(batchId);
      const res = await api.get(`/batches/${batchId}/export/zip`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/zip" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `MSBTE_Result_Report_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setTimeout(() => alert("Comprehensive Report Downloaded Successfully"), 500);
    } catch (err) {
      alert("Some reports could not be generated. Please try again.");
    } finally {
      setDownloadingZipId(null);
    }
  };


  return (
    <Protected>
      <AppShell>
        <PageHeader
          title={
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg">
                <FileJson className="h-6 w-6" />
              </div>
              <span className="font-display font-black text-2xl text-slate-900 tracking-tight">Smart Reports</span>
            </div>
          }
          subtitle="Generate and download customized academic performance records."
        />

        <main className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search by date (e.g. 2024)..." 
                  className="pl-12 h-12 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-primary/20 text-slate-900"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-5 py-3 rounded-xl border border-slate-200">
                <Download className="h-4 w-4" />
                {batches.length} Records Detected
             </div>
          </div>

          {loading ? (
             <div className="grid gap-6 sm:grid-cols-2">
               {[1,2,3,4].map(i => <div key={i} className="h-48 bg-slate-50 rounded-3xl animate-pulse" />)}
             </div>
          ) : (
             <FadeInStagger className="grid gap-6">
               {filteredBatches.map((batch) => (
                 <FadeInStaggerItem key={batch.id}>
                    <Card className="border-slate-200 shadow-md rounded-3xl bg-white overflow-hidden group hover:border-primary/20 transition-all">
                       <div className="flex flex-col lg:flex-row">
                          {/* Batch Info */}
                          <div className="lg:w-[30%] p-8 bg-slate-50/50 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between">
                             <div className="space-y-3">
                               <div className="flex items-center gap-3">
                                 <Calendar className="h-4 w-4 text-primary" />
                                 <h3 className="text-lg font-display font-black text-slate-900">
                                   {new Date(batch.uploadDate).toLocaleDateString(undefined, { 
                                     month: 'short', 
                                     day: 'numeric', 
                                     year: 'numeric' 
                                   })}
                                 </h3>
                               </div>
                               <div className="flex flex-wrap gap-2">
                                  <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[8px] font-black uppercase tracking-widest text-slate-500">{batch.totalStudents} Students</span>
                                  <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[8px] font-black uppercase tracking-widest text-emerald-600">Verified</span>
                               </div>
                             </div>
                             
                             <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-white border border-slate-200">
                                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Students</p>
                                   <p className="text-lg font-display font-black text-slate-900">{batch.totalStudents}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white border border-slate-200">
                                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pass</p>
                                   <p className="text-lg font-display font-black text-emerald-600">{batch.passCount}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white border border-slate-200">
                                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fail</p>
                                   <p className="text-lg font-display font-black text-rose-600">{batch.failCount}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white border border-slate-200">
                                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">KT Cases</p>
                                   <p className="text-lg font-display font-black text-orange-600">{batch.ktCount}</p>
                                </div>
                             </div>
                          </div>

                           {/* Export Actions */}
                           <div className="lg:w-[70%] p-8 space-y-6 bg-slate-50/10">
                              <div className="flex items-center justify-between">
                                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-80">Export Configurations</h4>
                                 <div className="hidden sm:flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Format: MSBTE Standard</span>
                                 </div>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-3">
                                 {exportTypes.map((type) => {
                                   const Icon = type.icon;
                                   const isGenerating = downloadingId === `${batch.id}-${type.id}`;
                                   return (
                                     <button
                                       key={type.id}
                                       onClick={() => handleExport(batch.id, type.id)}
                                       disabled={isGenerating || downloadingZipId === batch.id}
                                       className={cn(
                                         "flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-left group/btn shadow-sm",
                                         "hover:border-primary/20 hover:shadow-md hover:scale-[1.02]",
                                         "disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100 h-[90px]"
                                       )}
                                     >
                                       <div className="flex items-center gap-3">
                                         <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-all group-hover/btn:scale-110", type.bg, type.color)}>
                                           {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}
                                         </div>
                                         <div>
                                           <p className="text-sm font-black text-slate-900 tracking-tight">{type.label}</p>
                                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{isGenerating ? "Generating..." : type.format}</p>
                                         </div>
                                       </div>
                                       <ChevronRight className="h-4 w-4 text-slate-400 group-hover/btn:text-primary group-hover/btn:translate-x-1 transition-all" />
                                     </button>
                                   );
                                 })}
                              </div>

                              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                 <div className="flex items-center gap-3">
                                    <Package className="h-5 w-5 text-indigo-500" />
                                    <p className="text-[9px] font-bold text-slate-500 leading-tight uppercase tracking-wider">Bundle generation<br className="hidden md:block" />Includes all 8 reports above</p>
                                 </div>
                                 <Button 
                                   variant="primary" 
                                   disabled={downloadingZipId === batch.id || downloadingId !== null}
                                   className="w-full sm:w-auto rounded-xl px-8 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white transition-all h-[50px]"
                                   onClick={() => downloadAllReports(batch.id)}
                                 >
                                    {downloadingZipId === batch.id ? (
                                      <>
                                        <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                                        Generating ZIP Package...
                                      </>
                                    ) : (
                                      <>
                                        <Download className="mr-3 h-4 w-4" />
                                        Download All Reports
                                      </>
                                    )}
                                 </Button>
                              </div>
                           </div>
                       </div>
                    </Card>
                 </FadeInStaggerItem>
               ))}
             </FadeInStagger>
          )}

          {!loading && filteredBatches.length === 0 && (
            <div className="py-20 text-center">
              <div className="mx-auto h-20 w-20 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300 mb-6">
                 <FileJson className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-display font-black text-slate-900">No Records Found</h3>
              <p className="text-sm text-slate-500 mt-2">Try searching with a different date range.</p>
            </div>
          )}
        </main>
      </AppShell>
    </Protected>
  );
}
