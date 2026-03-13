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
  Calendar
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
  status: string;
};

export default function ExportsPage() {
  const [batches, setBatches] = React.useState<BatchSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
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
    { id: "pass", label: "Pass Students", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
    { id: "fail", label: "Fail Students", icon: XCircle, color: "text-rose-500", bg: "bg-rose-50" },
    { id: "kt", label: "KT Analysis", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
    { id: "full", label: "Full Report", icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
  ];

  const handleExport = async (batchId: string, type: string) => {
    try {
      const res = await api.get(`/batches/${batchId}/export/v2`);
      const { reports } = res.data;
      
      const mapping: Record<string, string> = {
        pass: "pass_students",
        fail: "fail_students",
        kt: "kt_analysis",
        full: "result_summary"
      };

      const key = mapping[type];
      const base64 = reports?.[key];
      
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
      a.download = `${type}_report_${batchId.slice(-6)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to extract analytical report. Ensure batch processing is complete.");
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
              <span className="font-display font-black text-2xl text-foreground tracking-tight">Smart Reports</span>
            </div>
          }
          subtitle="Generate and download customized academic performance records."
        />

        <main className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by date (e.g. 2024)..." 
                  className="pl-12 h-12 rounded-xl border-border bg-white shadow-sm focus:ring-primary/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-accent px-5 py-3 rounded-xl border border-border">
                <Download className="h-4 w-4" />
                {batches.length} Records Detected
             </div>
          </div>

          {loading ? (
             <div className="grid gap-6 sm:grid-cols-2">
               {[1,2,3,4].map(i => <div key={i} className="h-48 bg-accent/30 rounded-3xl animate-pulse" />)}
             </div>
          ) : (
             <FadeInStagger className="grid gap-6">
               {filteredBatches.map((batch) => (
                 <FadeInStaggerItem key={batch.id}>
                    <Card className="border-border shadow-md rounded-3xl bg-white overflow-hidden group hover:border-primary/20 transition-all">
                       <div className="flex flex-col lg:flex-row">
                          {/* Batch Info */}
                          <div className="lg:w-[30%] p-8 bg-accent/20 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-between">
                             <div className="space-y-3">
                               <div className="flex items-center gap-3">
                                 <Calendar className="h-4 w-4 text-primary" />
                                 <h3 className="text-lg font-display font-black text-foreground">
                                   {new Date(batch.uploadDate).toLocaleDateString(undefined, { 
                                     month: 'short', 
                                     day: 'numeric', 
                                     year: 'numeric' 
                                   })}
                                 </h3>
                               </div>
                               <div className="flex flex-wrap gap-2">
                                  <span className="px-3 py-1 rounded-full bg-white border border-border text-[8px] font-black uppercase tracking-widest text-muted-foreground">{batch.totalStudents} Students</span>
                                  <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[8px] font-black uppercase tracking-widest text-emerald-600">Verified</span>
                               </div>
                             </div>
                             
                             <div className="mt-6 grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-white border border-border">
                                   <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Pass</p>
                                   <p className="text-lg font-display font-black text-emerald-600">{batch.passCount}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white border border-border">
                                   <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Fail</p>
                                   <p className="text-lg font-display font-black text-rose-600">{batch.failCount}</p>
                                </div>
                             </div>
                          </div>

                          {/* Export Actions */}
                          <div className="lg:w-[70%] p-8 space-y-6">
                             <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Export Configurations</h4>
                                <div className="hidden sm:flex items-center gap-2">
                                   <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                   <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Format: MSBTE-XLSX</span>
                                </div>
                             </div>

                             <div className="grid sm:grid-cols-2 gap-3">
                                {exportTypes.map((type) => {
                                  const Icon = type.icon;
                                  return (
                                    <button
                                      key={type.id}
                                      onClick={() => handleExport(batch.id, type.id)}
                                      className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border border-border bg-white hover:bg-accent/30 transition-all text-left group/btn",
                                        "hover:border-primary/20"
                                      )}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center transition-all group-hover/btn:scale-110", type.bg, type.color)}>
                                          <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                          <p className="text-xs font-black text-foreground">{type.label}</p>
                                          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Excel Document</p>
                                        </div>
                                      </div>
                                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover/btn:text-primary group-hover/btn:translate-x-1 transition-all" />
                                    </button>
                                  );
                                })}
                             </div>

                             <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                   <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                                   <p className="text-[9px] font-bold text-muted-foreground leading-tight">Reports adhere to institutional <br className="hidden md:block" />standardized documentation protocols.</p>
                                </div>
                                <Button 
                                  variant="primary" 
                                  className="w-full sm:w-auto rounded-xl h-10 px-6 font-bold text-[9px] uppercase tracking-widest shadow-sm"
                                  onClick={() => handleExport(batch.id, "full")}
                                >
                                   Comprehensive Report
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
              <div className="mx-auto h-20 w-20 rounded-3xl bg-accent flex items-center justify-center text-muted-foreground mb-6">
                 <FileJson className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-display font-black text-foreground">No Records Found</h3>
              <p className="text-sm text-muted-foreground mt-2">Try searching with a different date range.</p>
            </div>
          )}
        </main>
      </AppShell>
    </Protected>
  );
}
