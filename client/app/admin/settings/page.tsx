"use client";

import * as React from "react";
import { Settings as SettingsIcon, Save, RefreshCw, Globe } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Protected } from "@/components/Protected";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

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
      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || "Failed to save settings";
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
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-slate-700" />
              <span>System Settings</span>
            </div>
          }
          subtitle="Configure core system parameters and integrations."
        />

        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="grid gap-6">
            <Card className="overflow-hidden border-none shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <div className="text-base font-bold text-slate-800 tracking-tight">MSBTE Source Configuration</div>
                </div>
                <div className="text-xs text-slate-500 font-medium">Update the source URL used for result extraction.</div>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-700 ml-1 italic">Official MSBTE Result URL</label>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Fetch Source</span>
                      </div>
                      <Input 
                        value={msbteUrl}
                        onChange={(e) => setMsbteUrl(e.target.value)}
                        placeholder="https://msbte.org.in/..."
                        className="h-12 bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm"
                      />
                      <p className="text-[11px] text-slate-500 leading-relaxed pl-1">
                        <span className="font-bold text-slate-700 underline">Note:</span> This URL is used as the base for all automated result fetching sessions. Ensure it points to the correct semester result page as provided by MSBTE.
                      </p>
                    </div>

                    {message && (
                      <div className={`p-4 rounded-2xl text-sm font-medium border animate-in fade-in slide-in-from-top-2 duration-300 ${
                        message.type === "success" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                        {message.text}
                      </div>
                    )}

                    <div className="pt-4 flex items-center justify-end">
                      <Button 
                        onClick={handleSave} 
                        disabled={saving || !msbteUrl.trim()}
                        className="h-11 px-8 bg-slate-900 border-none hover:bg-slate-800 shadow-lg shadow-slate-200 active:scale-95 transition-all font-bold"
                      >
                        {saving ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        {saving ? "Deploying Changes..." : "Commit Changes"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-slate-50/50 border border-slate-100">
              <CardContent className="py-6">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 h-8 w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-inner">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 tracking-tight">Security Protocol</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Changes made here affect the entire application in real-time. Only <span className="text-slate-900 font-bold underline">System Administrators</span> have the clearance to modify these parameters. All updates are logged for security auditing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-orange-50/20 border border-orange-100">
              <CardHeader>
                <div className="text-sm font-bold text-orange-800">System Maintenance</div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-600 max-w-sm">
                    If the default system admin is missing or credentials don't work, you can force seed the system admin account.
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={async () => {
                      try {
                        await api.post("/admin/seed-admin");
                        alert("System admin seeding triggered successfully.");
                      } catch {
                        alert("Failed to trigger seeding.");
                      }
                    }}
                  >
                    Force Seed Admin
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </AppShell>
    </Protected>
  );
}

// Helper to use Shield icon
import { Shield } from "lucide-react";
