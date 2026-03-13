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
               <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                <SettingsIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="font-display font-black text-3xl text-foreground tracking-tight block">Global Settings</span>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">System Configuration</p>
              </div>
            </div>
          }
          subtitle="Manage global system parameters and result extraction configurations." 
        />

        <main className="mx-auto max-w-7xl px-8 py-12 lg:px-12">
          <FadeInStagger className="grid gap-12">
            <FadeInStaggerItem>
              <Card className="overflow-hidden border-border shadow-xl rounded-[3rem] bg-white">
                <CardHeader className="border-b border-border bg-accent/30 px-12 py-10">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Globe className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-black text-foreground tracking-tight">Result Extraction Configuration</h3>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Target URL for student result data.</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-12">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-8">
                      <RefreshCw className="h-12 w-12 animate-spin text-primary opacity-20" />
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading Settings...</p>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Master Portal URL</label>
                          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Active Stream</span>
                          </div>
                        </div>
                        <div className="relative group/input">
                          <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30 group-focus-within/input:text-primary transition-colors" />
                          <Input 
                            value={msbteUrl}
                            onChange={(e) => setMsbteUrl(e.target.value)}
                            placeholder="https://msbte.org.in/..."
                            className="h-20 pl-16 bg-accent/20 border-border rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all font-mono text-sm text-foreground placeholder:text-muted-foreground/30"
                          />
                        </div>
                        <div className="p-8 rounded-[2.5rem] bg-rose-50 border border-rose-100 flex gap-6 group transition-all">
                           <AlertTriangle className="h-8 w-8 text-rose-500 shrink-0 opacity-40" />
                           <div className="space-y-1">
                              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block mb-1">Configuration Warning</span>
                               <p className="text-[11px] text-rose-700/70 leading-relaxed font-medium">
                                Changes to this URL affect all batch extractions. Ensure the URL points to a valid MSBTE result portal. Incorrect URLs will cause synchronization failures.
                               </p>
                           </div>
                        </div>
                      </div>

                      {message && (
                        <div className={cn(
                          "p-6 rounded-[2rem] text-[11px] font-bold uppercase tracking-widest border animate-in zoom-in-95 duration-500 shadow-lg",
                          message.type === "success" 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                            : "bg-rose-50 text-rose-600 border-rose-200"
                        )}>
                          <div className="flex items-center gap-4">
                             <div className={cn("h-6 w-6 rounded-lg flex items-center justify-center border", message.type === "success" ? "bg-emerald-100 border-emerald-200" : "bg-rose-100 border-rose-200")}>
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
                          className="h-16 px-12 rounded-[1.5rem] bg-primary text-white font-black uppercase tracking-widest text-[11px] hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 active:scale-95 group"
                        >
                          {saving ? (
                            <RefreshCw className="mr-3 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-3 h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                          )}
                          {saving ? "Saving..." : "Save Configuration"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeInStaggerItem>

            <FadeInStaggerItem>
              <div className="grid gap-8 md:grid-cols-2">
                <Card className="border-border shadow-xl rounded-[3rem] bg-white overflow-hidden group transition-all hover:-translate-y-1">
                  <CardContent className="p-10">
                    <div className="flex gap-8 items-start">
                      <div className="h-14 w-14 rounded-[1.5rem] bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100 group-hover:scale-110 transition-transform">
                        <Shield className="h-7 w-7 text-amber-500" />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">Administrator Role</span>
                        <h4 className="text-xl font-display font-black text-foreground tracking-tight">System Access Level</h4>
                        <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                          Your account is authenticated as a <span className="text-primary font-black uppercase tracking-widest">System Admin</span>. All global configuration changes are applied immediately across the entire institution database.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border shadow-xl rounded-[3rem] bg-white overflow-hidden group transition-all hover:-translate-y-1">
                  <CardContent className="p-10">
                    <div className="flex items-center justify-between h-full">
                      <div className="flex gap-8 items-start">
                         <div className="h-14 w-14 rounded-[1.5rem] bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-110 transition-transform">
                          <Cpu className="h-7 w-7 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Maintenance Hub</span>
                          <h4 className="text-xl font-display font-black text-foreground tracking-tight">System Recovery</h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                            Administrative tools for initializing database clusters and restoring primary credentials.
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-accent/20 border-border text-foreground hover:bg-primary hover:text-white transition-all active:scale-95"
                        onClick={async () => {
                          try {
                            await api.post("/admin/seed-admin");
                            alert("System re-indexed. Primary administrator restored.");
                          } catch {
                            alert("Initialization failure.");
                          }
                        }}
                      >
                        Reset Clusters
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
