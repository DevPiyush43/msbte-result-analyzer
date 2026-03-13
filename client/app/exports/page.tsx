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
      // Logic for export based on backend endpoints
      // window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/batches/${batchId}/export?type=${type}`;
      alert(`Exporting ${type} for batch ${batchId}...`);
    } catch (err) {
      alert("Export failed");
    }
  };

  return (
    <Protected>
      <AppShell>
        <PageHeader
          title={
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
                <FileJson className="h-7 w-7" />
              </div>
              <span className="font-display font-black text-3xl text-foreground tracking-tight">Smart Export Panel</span>
            </div>
          }
          subtitle="Generate and download customized academic performance reports."
        />

        <main className="mx-auto max-w-7xl px-8 py-12">
          <div className="mb-12 flex items-center justify-between gap-8">
             <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search by date (e.g. 2024)..." 
                  className="pl-12 h-14 rounded-2xl border-border bg-white shadow-sm focus:ring-primary/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-accent px-6 py-4 rounded-2xl border border-border">
                <Download className="h-4 w-4" />
                {batches.length} Batches Available
             </div>
          </div>

          {loading ? (
             <div className="grid gap-6 sm:grid-cols-2">
               {[1,2,3,4].map(i => <div key={i} className="h-64 bg-accent/30 rounded-[2.5rem] animate-pulse" />)}
             </div>
          ) : (
             <FadeInStagger className="grid gap-8">
               {filteredBatches.map((batch) => (
                 <FadeInStaggerItem key={batch.id}>
                    <Card className="border-border shadow-xl rounded-[2.5rem] bg-white overflow-hidden group hover:border-primary/20 transition-all">
                       <div className="flex flex-col lg:flex-row">
                          {/* Batch Info */}
                          <div className="lg:w-1/3 p-10 bg-accent/30 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-between">
                             <div className="space-y-4">
                               <div className="flex items-center gap-3">
                                 <Calendar className="h-5 w-5 text-primary" />
                                 <h3 className="text-xl font-display font-black text-foreground">
                                   {new Date(batch.uploadDate).toLocaleDateString(undefined, { 
                                     month: 'long', 
                                     day: 'numeric', 
                                     year: 'numeric' 
                                   })}
                                 </h3>
                               </div>
                               <div className="flex flex-wrap gap-2">
                                  <span className="px-3 py-1 rounded-full bg-white border border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground">{batch.totalStudents} Students</span>
                                  <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[9px] font-black uppercase tracking-widest text-emerald-600">Completed</span>
                               </div>
                             </div>
                             
                             <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-white border border-border">
                                   <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Pass Students</p>
                                   <p className="text-lg font-display font-black text-emerald-600">{batch.passCount}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white border border-border">
                                   <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Fail Students</p>
                                   <p className="text-lg font-display font-black text-rose-600">{batch.failCount}</p>
                                </div>
                             </div>
                          </div>

                          {/* Export Actions */}
                          <div className="lg:w-2/3 p-10 space-y-8">
                             <div className="flex items-center justify-between">
                                <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em]">Select Export Format</h4>
                                <div className="flex items-center gap-2">
                                   <div className="h-2 w-2 rounded-full bg-primary" />
                                   <span className="text-[10px] font-bold text-primary uppercase">Smart Formatting ON</span>
                                </div>
                             </div>

                             <div className="grid sm:grid-cols-2 gap-4">
                                {exportTypes.map((type) => {
                                  const Icon = type.icon;
                                  return (
                                    <button
                                      key={type.id}
                                      onClick={() => handleExport(batch.id, type.id)}
                                      className={cn(
                                        "flex items-center justify-between p-6 rounded-2xl border border-border bg-white hover:shadow-lg transition-all text-left group/btn",
                                        "hover:border-primary/20"
                                      )}
                                    >
                                      <div className="flex items-center gap-4">
                                        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center transition-all group-hover/btn:scale-110", type.bg, type.color)}>
                                          <Icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                          <p className="text-sm font-black text-foreground">{type.label}</p>
                                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Excel / CSV Format</p>
                                        </div>
                                      </div>
                                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover/btn:text-primary group-hover/btn:translate-x-1 transition-all" />
                                    </button>
                                  );
                                })}
                             </div>

                             <div className="pt-8 border-t border-border flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                   <FileSpreadsheet className="h-6 w-6 text-emerald-500" />
                                   <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">Generated reports are consistent with the <br/>MSBTE 2024 standardized format.</p>
                                </div>
                                <Button variant="outline" className="rounded-xl h-12 px-8 font-bold text-[10px] uppercase tracking-widest border-border hover:bg-primary hover:text-white transition-all">
                                   Download All
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
