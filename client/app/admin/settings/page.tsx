"use client";

import * as React from "react";
import { Settings as SettingsIcon, Save, RefreshCw, Globe, Shield, Terminal, AlertTriangle, Cpu } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Protected } from "@/components/Protected";
import { FadeIn, FadeInStagger, FadeInStaggerItem } from "@/components/Animated";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [msbteUrl, setMsbteUrl] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    if (authLoading) return;
    if (user?.role !== "SYSTEM_ADMIN") {
      router.replace("/dashboard");
      return;
    }

    async function fetchSettings() {
      try {
        const res = await api.get("/admin/settings/MSBTE_RESULT_URL");
        if (res.data?.setting?.value) {
          setMsbteUrl(res.data.setting.value);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [user, authLoading, router]);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await api.put("/admin/settings/MSBTE_RESULT_URL", {
        value: msbteUrl.trim(),
        description: "Official MSBTE Result URL for fetching results"
      });
      setMessage({ type: "success", text: "Global configuration synchronized successfully." });
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || "Internal configuration error";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Protected>
      <AppShell>
        <PageHeader 
          title={
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_20px_rgba(79,70,229,0.1)]">
                <SettingsIcon className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <span className="font-display font-black text-3xl text-white tracking-tight block">Root Configuration</span>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mt-1">Deep System Override Layer</p>
              </div>
            </div>
          }
          subtitle="Advanced system directives for administrative overriding and integration tuning." 
        />

        <main className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
          <FadeInStagger className="grid gap-12">
            <FadeInStaggerItem>
              <Card className="overflow-hidden border-white/5 shadow-2xl rounded-[3rem] bg-white/[0.02] backdrop-blur-3xl border-t-white/10">
                <CardHeader className="border-b border-white/5 bg-white/[0.01] px-12 py-10">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Globe className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-black text-white tracking-tight">Scraping Engine Directives</h3>
                      <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em] mt-1">Source trajectory for the MSBTE extraction module.</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-12">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-8">
                      <RefreshCw className="h-12 w-12 animate-spin text-primary opacity-20" />
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] animate-pulse">Compiling Settings...</p>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Master Extraction URL</label>
                          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active Stream</span>
                          </div>
                        </div>
                        <div className="relative group/input">
                          <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-2xl opacity-0 group-hover/input:opacity-100 transition-opacity pointer-events-none" />
                          <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover/input:text-primary transition-colors" />
                          <Input 
                            value={msbteUrl}
                            onChange={(e) => setMsbteUrl(e.target.value)}
                            placeholder="https://msbte.org.in/..."
                            className="h-20 pl-16 bg-white/5 border-white/10 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-mono text-sm text-primary placeholder:text-white/10 shadow-inner group-hover/input:border-white/20"
                          />
                        </div>
                        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex gap-6 group transition-all hover:bg-white/[0.04]">
                           <AlertTriangle className="h-8 w-8 text-amber-500 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                           <div className="space-y-1">
                              <span className="text-[10px] font-black text-white uppercase tracking-widest block mb-1">Critical Directive Required</span>
                              <p className="text-[11px] text-white/40 leading-relaxed font-medium">
                                This URI serves as the root for all session-based crawlers. Incorrect patterns will cause immediate extraction latency or failure. Ensure SSL certificates are valid for the target MSBTE endpoint.
                              </p>
                           </div>
                        </div>
                      </div>

                      {message && (
                        <div className={cn(
                          "p-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] border animate-in zoom-in-95 duration-500 shadow-2xl",
                          message.type === "success" 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
                        )}>
                          <div className="flex items-center gap-4">
                             <div className={cn("h-6 w-6 rounded-lg flex items-center justify-center border", message.type === "success" ? "bg-emerald-500/20 border-emerald-500/20" : "bg-rose-500/20 border-rose-500/20")}>
                                {message.type === "success" ? <Shield className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                             </div>
                             {message.text}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-end">
                        <Button 
                          size="lg"
                          onClick={handleSave} 
                          disabled={saving || !msbteUrl.trim()}
                          className="h-16 px-12 rounded-[1.5rem] bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] hover:bg-primary hover:text-white transition-all shadow-2xl active:scale-95 group"
                        >
                          {saving ? (
                            <RefreshCw className="mr-3 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-3 h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                          )}
                          {saving ? "Synchronizing..." : "Commit Directive"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeInStaggerItem>

            <FadeInStaggerItem>
              <div className="grid gap-8 md:grid-cols-2">
                <Card className="border-white/5 shadow-2xl rounded-[3rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden border-t-white/10 group transition-all hover:bg-white/[0.04]">
                  <CardContent className="p-10">
                    <div className="flex gap-8 items-start">
                      <div className="h-14 w-14 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:scale-110 transition-transform shadow-inner">
                        <Shield className="h-7 w-7 text-amber-400" />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">Root Executive Status</span>
                        <h4 className="text-xl font-display font-black text-white tracking-tight">Privileged Execution</h4>
                        <p className="text-[11px] text-white/40 leading-relaxed font-medium">
                          You are currently authenticated as <span className="text-primary font-black">System Root</span>. All modifications are permanent and propagated across all active extraction clusters globally.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/5 shadow-2xl rounded-[3rem] bg-white/[0.02] backdrop-blur-3xl overflow-hidden border-t-white/10 group transition-all hover:bg-white/[0.04]">
                  <CardContent className="p-10">
                    <div className="flex items-center justify-between h-full">
                      <div className="flex gap-8 items-start">
                         <div className="h-14 w-14 rounded-[1.5rem] bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-110 transition-transform shadow-inner">
                          <Cpu className="h-7 w-7 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Kernel Sub-routines</span>
                          <h4 className="text-xl font-display font-black text-white tracking-tight">Initialization Control</h4>
                          <p className="text-[11px] text-white/40 leading-relaxed font-medium">
                            Recovery directives for catastrophic identity loss or cluster misalignment.
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-white/5 border-white/10 text-white hover:bg-white hover:text-black transition-all active:scale-95"
                        onClick={async () => {
                          try {
                            await api.post("/admin/seed-admin");
                            alert("System clusters re-indexed. Primary admin restored.");
                          } catch {
                            alert("Initialization failure.");
                          }
                        }}
                      >
                        Trigger Seed
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </FadeInStaggerItem>
          </FadeInStagger>
        </main>
      </AppShell>
    </Protected>
  );
}
