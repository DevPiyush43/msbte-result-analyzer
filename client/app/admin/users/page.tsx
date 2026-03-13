"use client";

import * as React from "react";
import { 
  Shield, 
  UserPlus, 
  Search, 
  Filter, 
  Mail, 
  BadgeCheck, 
  MoreVertical, 
  Ban, 
  CheckCircle, 
  RefreshCw,
  Users,
  X,
  UserCircle,
  Building2,
  Lock,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { Protected } from "@/components/Protected";
import { FadeIn, FadeInStagger, FadeInStaggerItem } from "@/components/Animated";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type User = {
  _id: string;
  username: string;
  email: string;
  role: "SYSTEM_ADMIN" | "ADMIN" | "TEACHER";
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
};

export default function UserManagementPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [modalForm, setModalForm] = React.useState({
    username: "",
    email: "",
    password: "",
    role: "TEACHER" as "ADMIN" | "TEACHER",
    fullName: "",
    department: "",
    institution: "MSBTE College"
  });
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (authLoading) return;
    if (currentUser?.role !== "SYSTEM_ADMIN" && currentUser?.role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }

    fetchUsers();
  }, [currentUser, authLoading, router]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await api.post("/admin/users", modalForm);
      setIsModalOpen(false);
      setModalForm({
        username: "",
        email: "",
        password: "",
        role: "TEACHER",
        fullName: "",
        department: "",
        institution: "MSBTE College"
      });
      fetchUsers();
    } catch (err: any) {
      setFormError(err?.response?.data?.error?.message || "Internal provisioning failure");
    } finally {
      setSubmitting(false);
    }
  }

  const filteredUsers = React.useMemo(() => {
    return users.filter((u) => {
      const matchQuery = 
        u.username.toLowerCase().includes(query.toLowerCase()) || 
        u.email.toLowerCase().includes(query.toLowerCase());
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchQuery && matchRole;
    });
  }, [users, query, roleFilter]);

  async function toggleStatus(user: User) {
    try {
      const newStatus = user.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
      await api.patch(`/admin/users/${user._id}/status`, { status: newStatus });
      setUsers(users.map(u => u._id === user._id ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error("Failed to update status", err);
    }
  }

  return (
    <Protected>
      <AppShell>
        <PageHeader 
          title={
            <div className="flex items-center gap-6">
               <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <span className="font-display font-black text-3xl text-white tracking-tight block">Personnel Registry</span>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mt-1">Access Control & Operator Management</p>
              </div>
            </div>
          }
          subtitle="Manage secure access nodes for pedagogic staff and system controllers."
          actions={
            <Button 
              size="lg" 
              className="rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 h-16 px-10 bg-white text-black hover:bg-primary hover:text-white transition-all active:scale-95 group"
              onClick={() => setIsModalOpen(true)}
            >
              <UserPlus className="mr-3 h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
              Provision Operator
            </Button>
          }
        />

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-500">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               className="w-full max-w-2xl bg-[#0a0a0a] rounded-[3.5rem] shadow-[0_0_100px_rgba(var(--primary),0.1)] overflow-hidden border border-white/10 relative"
            >
              <div className="px-12 py-12 border-b border-white/5 bg-white/[0.01] relative">
                <div className="absolute top-12 right-12">
                   <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all" onClick={() => setIsModalOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div>
                  <h3 className="text-3xl font-display font-black text-white tracking-tight leading-none mb-3">Access Provisioning</h3>
                  <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">Staff identity registration portal</p>
                </div>
              </div>
              
              <form onSubmit={handleCreateUser} className="p-12 space-y-10">
                {formError && (
                  <div className="p-5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] animate-shake text-center shadow-2xl shadow-rose-500/10">
                    <div className="flex items-center justify-center gap-3">
                       <Shield className="h-4 w-4" />
                       {formError}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Unique Identifier</label>
                    <div className="relative group/input">
                      <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover/input:text-primary transition-colors" />
                      <Input 
                        required
                        value={modalForm.username}
                        onChange={e => setModalForm({...modalForm, username: e.target.value})}
                        placeholder="e.g. j.wilson"
                        className="h-16 pl-14 bg-white/5 border-white/10 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-white/5 shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Full Legal Name</label>
                    <Input 
                      required
                      value={modalForm.fullName}
                      onChange={e => setModalForm({...modalForm, fullName: e.target.value})}
                      placeholder="e.g. James Wilson"
                      className="h-16 bg-white/5 border-white/10 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-white/5 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Email Connection Node</label>
                  <div className="relative group/input">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover/input:text-primary transition-colors" />
                    <Input 
                      required
                      type="email"
                      value={modalForm.email}
                      onChange={e => setModalForm({...modalForm, email: e.target.value})}
                      placeholder="staff@institution.edu"
                      className="h-16 pl-14 bg-white/5 border-white/10 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-white/5 shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Security Cipher</label>
                    <div className="relative group/input">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover/input:text-primary transition-colors" />
                      <Input 
                        required
                        type="password"
                        value={modalForm.password}
                        onChange={e => setModalForm({...modalForm, password: e.target.value})}
                        placeholder="••••••••"
                        className="h-16 pl-14 bg-white/5 border-white/10 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-white/5 shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Access Lifecycle</label>
                    <div className="relative group/input">
                      <select 
                        className="h-16 w-full pl-6 pr-12 rounded-2xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/60 outline-none ring-offset-background focus:ring-4 focus:ring-primary/10 appearance-none shadow-sm cursor-pointer transition-all hover:border-white/20"
                        value={modalForm.role}
                        onChange={e => setModalForm({...modalForm, role: e.target.value as "ADMIN" | "TEACHER"})}
                      >
                        <option value="TEACHER">Staff Academician</option>
                        {currentUser?.role === "SYSTEM_ADMIN" && <option value="ADMIN">Controller</option>}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 pointer-events-none group-hover/input:text-primary transition-colors" />
                    </div>
                  </div>
                </div>

                {modalForm.role === "TEACHER" && (
                  <div className="grid grid-cols-2 gap-10 animate-in slide-in-from-top-6 duration-700">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Academic Department</label>
                      <div className="relative group/input">
                        <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover/input:text-primary transition-colors" />
                        <Input 
                          value={modalForm.department}
                          onChange={e => setModalForm({...modalForm, department: e.target.value})}
                          placeholder="CS Technology"
                          className="h-16 pl-14 bg-white/5 border-white/10 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-white/5 shadow-inner"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Institution Node</label>
                      <Input 
                        value={modalForm.institution}
                        onChange={e => setModalForm({...modalForm, institution: e.target.value})}
                        className="h-16 bg-white/5 border-white/10 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-12 flex items-center justify-end gap-8">
                  <Button type="button" variant="ghost" className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-16 px-10 border border-white/5 hover:bg-white/5 hover:text-white transition-all" onClick={() => setIsModalOpen(false)}>Abort Protocol</Button>
                  <Button 
                    type="submit" 
                    className="rounded-[1.5rem] px-14 h-16 font-black uppercase tracking-widest text-[11px] bg-white text-black shadow-2xl shadow-primary/20 transition-all hover:bg-primary hover:text-white active:scale-95 group"
                    disabled={submitting}
                  >
                    {submitting ? "Engaging Protocol..." : "Provision Node"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        <main className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
          <FadeInStagger className="space-y-12">
            <FadeInStaggerItem>
              <Card className="border-white/5 shadow-2xl bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] overflow-hidden border-t-white/10">
                <CardContent className="p-10">
                  <div className="flex flex-col md:flex-row gap-10">
                    <div className="relative flex-1 group/search">
                      <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-2xl opacity-0 group-hover/search:opacity-100 transition-opacity pointer-events-none" />
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover/search:text-primary transition-colors" />
                      <Input 
                        placeholder="Search personnel, communication nodes or identifiers..." 
                        className="pl-16 h-16 bg-white/5 border-white/10 rounded-[2rem] font-bold text-sm shadow-inner focus:ring-4 focus:ring-primary/10 transition-all hover:border-white/20"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="relative group/filter">
                        <Filter className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 pointer-events-none group-hover/filter:text-primary transition-colors" />
                        <select 
                          className="h-16 pl-14 pr-14 rounded-[2rem] border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 outline-none focus:ring-4 focus:ring-primary/10 appearance-none cursor-pointer shadow-sm transition-all hover:border-white/20"
                          value={roleFilter}
                          onChange={(e) => setRoleFilter(e.target.value)}
                        >
                          <option value="all">Global Access</option>
                          <option value="SYSTEM_ADMIN">Root Administrators</option>
                          <option value="ADMIN">System Controllers</option>
                          <option value="TEACHER">Staff Nodes</option>
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/10 pointer-events-none group-hover/filter:text-primary transition-colors" />
                      </div>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className={cn("h-16 w-16 rounded-[2rem] shadow-2xl bg-white/5 text-white border border-white/10 hover:bg-white hover:text-black transition-all", loading && 'animate-spin')} 
                        onClick={fetchUsers} 
                        disabled={loading}
                      >
                        <RefreshCw className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInStaggerItem>

            <FadeInStaggerItem>
              <Card className="border-white/5 shadow-2xl bg-white/[0.02] backdrop-blur-3xl rounded-[3.5rem] overflow-hidden border-t-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.01] border-b border-white/5">
                        <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Biological Identity</th>
                        <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Permission Class</th>
                        <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Current Status</th>
                        <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Initial Sync</th>
                        <th className="px-12 py-8 text-right text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Directives</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loading ? (
                         <tr>
                          <td colSpan={5} className="px-12 py-40 text-center">
                            <RefreshCw className="h-12 w-12 animate-spin text-primary opacity-20 mx-auto" />
                            <p className="mt-8 text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">Synchronizing Identity Grid...</p>
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-12 py-40 text-center">
                            <div className="h-20 w-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/5 text-white/10">
                               <Users className="h-10 w-10" />
                            </div>
                            <h3 className="text-white font-display font-black text-2xl tracking-tight mb-3">Zero Response Grid</h3>
                            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">No personnel matches the search vector</p>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u._id} className="hover:bg-white/[0.03] transition-all duration-500 group relative">
                            <td className="px-12 py-10">
                              <div className="flex items-center gap-6">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary/30 via-primary/5 to-indigo-500/30 p-[1px] shadow-2xl transform group-hover:rotate-12 transition-all duration-700">
                                  <div className="h-full w-full rounded-[15px] bg-[#0a0a0a] flex items-center justify-center text-primary text-base font-black border border-white/5 shadow-inner">
                                    {u.username.substring(0, 2).toUpperCase()}
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <div className="text-lg font-display font-black text-white tracking-tight group-hover:text-primary transition-colors">{u.username}</div>
                                  <div className="text-[10px] text-white/30 font-black flex items-center gap-3 uppercase tracking-widest">
                                    <Mail className="h-3.5 w-3.5 text-primary/60" />
                                    {u.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-12 py-10">
                              <span className={cn(
                                "inline-flex items-center gap-3 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-2xl transition-all duration-500",
                                u.role === 'SYSTEM_ADMIN' 
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/5' 
                                  : u.role === 'ADMIN'
                                    ? 'bg-primary/10 text-primary border-primary/20 shadow-primary/5'
                                    : 'bg-white/5 text-white/40 border-white/10'
                                )}>
                                {u.role === 'SYSTEM_ADMIN' && <Shield className="h-3.5 w-3.5" />}
                                {u.role === 'TEACHER' ? 'Instructor' : u.role}
                              </span>
                            </td>
                            <td className="px-12 py-10">
                              <div className={cn(
                                "inline-flex items-center gap-3 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500",
                                u.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'text-white/20 bg-white/5 border border-white/5'
                              )}>
                                <div className={cn(
                                  "h-1.5 w-1.5 rounded-full transition-all duration-500",
                                  u.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-white/10'
                                )} />
                                {u.status}
                              </div>
                            </td>
                            <td className="px-12 py-10 text-[11px] text-white/20 font-black tracking-[0.3em] uppercase transition-colors group-hover:text-white/40">
                              {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td className="px-12 py-10 text-right">
                              <div className="flex items-center justify-end gap-4">
                                 <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className={cn(
                                    "rounded-xl font-black text-[9px] uppercase tracking-widest h-12 px-8 border-white/5 shadow-2xl transition-all duration-500",
                                    u.status === 'ACTIVE' 
                                      ? "text-rose-400 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500 hover:text-white" 
                                      : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                                  )}
                                  onClick={() => toggleStatus(u)}
                                >
                                  {u.status === 'ACTIVE' ? <Ban className="h-4 w-4 mr-3" /> : <CheckCircle className="h-4 w-4 mr-3" />}
                                  {u.status === 'ACTIVE' ? 'Deactivate' : 'Restore'}
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12 text-white/20 bg-white/5 hover:bg-white/10 transition-colors">
                                  <MoreVertical className="h-5 w-5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </FadeInStaggerItem>
          </FadeInStagger>
        </main>
      </AppShell>
    </Protected>
  );
}
