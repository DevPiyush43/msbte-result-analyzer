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
               <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <span className="font-display font-black text-3xl text-slate-900 tracking-tight block">User Management</span>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-1">Access Control & Staff Management</p>
              </div>
            </div>
          }
          subtitle="Manage secure access nodes for pedagogic staff and system controllers."
          actions={
            <Button 
              size="lg" 
              className="rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 h-16 px-10 bg-primary text-white hover:bg-primary/90 transition-all active:scale-95 group"
              onClick={() => setIsModalOpen(true)}
            >
              <UserPlus className="mr-3 h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
              Add New User
            </Button>
          }
        />

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-2xl animate-in fade-in duration-500">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               className="w-full max-w-2xl bg-white rounded-[3.5rem] shadow-[0_0_100px_rgba(var(--primary),0.05)] overflow-hidden border border-border relative"
            >
              <div className="px-12 py-12 border-b border-border bg-slate-50 relative">
                <div className="absolute top-12 right-12">
                   <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-white border border-border hover:bg-slate-50 transition-all" onClick={() => setIsModalOpen(false)}>
                    <X className="h-5 w-5 text-slate-400" />
                  </Button>
                </div>
                <div>
                  <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight leading-none mb-3">User Registration</h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Create new staff account</p>
                </div>
              </div>
              
              <form onSubmit={handleCreateUser} className="p-12 space-y-10">
                {formError && (
                  <div className="p-5 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] animate-shake text-center shadow-sm">
                    <div className="flex items-center justify-center gap-3">
                       <Shield className="h-4 w-4" />
                       {formError}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Username</label>
                    <div className="relative group/input">
                      <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40 group-hover/input:text-primary transition-colors" />
                      <Input 
                        required
                        value={modalForm.username}
                        onChange={e => setModalForm({...modalForm, username: e.target.value})}
                        placeholder="e.g. j.wilson"
                        className="h-16 pl-14 bg-slate-50 border-border rounded-2xl font-bold text-[13px] text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400/50 shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Full Legal Name</label>
                    <Input 
                      required
                      value={modalForm.fullName}
                      onChange={e => setModalForm({...modalForm, fullName: e.target.value})}
                      placeholder="e.g. James Wilson"
                      className="h-16 bg-slate-50 border-border rounded-2xl font-bold text-[13px] text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400/50 shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Email Address</label>
                  <div className="relative group/input">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40 group-hover/input:text-primary transition-colors" />
                    <Input 
                      required
                      type="email"
                      value={modalForm.email}
                      onChange={e => setModalForm({...modalForm, email: e.target.value})}
                      placeholder="staff@institution.edu"
                      className="h-16 pl-14 bg-slate-50 border-border rounded-2xl font-bold text-[13px] text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400/50 shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Password</label>
                    <div className="relative group/input">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40 group-hover/input:text-primary transition-colors" />
                      <Input 
                        required
                        type="password"
                        value={modalForm.password}
                        onChange={e => setModalForm({...modalForm, password: e.target.value})}
                        placeholder="••••••••"
                        className="h-16 pl-14 bg-slate-50 border-border rounded-2xl font-bold text-[13px] text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400/50 shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">User Role</label>
                    <div className="relative group/input">
                      <select 
                        className="h-16 w-full pl-6 pr-12 rounded-2xl border border-border bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 outline-none focus:ring-4 focus:ring-primary/10 appearance-none shadow-sm cursor-pointer transition-all hover:border-primary/20"
                        value={modalForm.role}
                        onChange={e => setModalForm({...modalForm, role: e.target.value as "ADMIN" | "TEACHER"})}
                      >
                        <option value="TEACHER">Instructor</option>
                        {currentUser?.role === "SYSTEM_ADMIN" && <option value="ADMIN">Administrator</option>}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40 pointer-events-none group-hover/input:text-primary transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="pt-12 flex items-center justify-end gap-8">
                  <Button type="button" variant="ghost" className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-16 px-10 border border-border hover:bg-slate-50 transition-all" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button 
                    type="submit" 
                    className="rounded-[1.5rem] px-14 h-16 font-black uppercase tracking-widest text-[11px] bg-primary text-white shadow-2xl shadow-primary/30 transition-all active:scale-95 group"
                    disabled={submitting}
                  >
                    {submitting ? "Processing..." : "Create Account"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        <main className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
          <FadeInStagger className="space-y-12">
            <FadeInStaggerItem>
              <Card className="border-border shadow-2xl bg-white rounded-[3rem] overflow-hidden">
                <CardContent className="p-10">
                  <div className="flex flex-col md:flex-row gap-10">
                    <div className="relative flex-1 group/search">
                      <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-2xl opacity-0 group-hover/search:opacity-100 transition-opacity pointer-events-none" />
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40 group-hover/search:text-primary transition-colors" />
                      <Input 
                        placeholder="Search by name, email or username..." 
                        className="pl-16 h-16 bg-slate-50 border-slate-200 rounded-[2rem] font-bold text-sm text-slate-900 shadow-sm focus:ring-4 focus:ring-primary/10 transition-all hover:border-primary/20 placeholder:text-slate-400"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="relative group/filter">
                        <Filter className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40 pointer-events-none group-hover/filter:text-primary transition-colors" />
                        <select 
                          className="h-16 pl-14 pr-14 rounded-[2rem] border border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 outline-none focus:ring-4 focus:ring-primary/10 appearance-none cursor-pointer shadow-sm transition-all hover:border-primary/20"
                          value={roleFilter}
                          onChange={(e) => setRoleFilter(e.target.value)}
                        >
                          <option value="all">All Users</option>
                          <option value="SYSTEM_ADMIN">System Admins</option>
                          <option value="ADMIN">Administrators</option>
                          <option value="TEACHER">Instruction Staff</option>
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40 pointer-events-none group-hover/filter:text-primary transition-colors" />
                      </div>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className={cn("h-16 w-16 rounded-[2rem] shadow-2xl bg-white text-primary border border-slate-200 hover:bg-primary hover:text-white transition-all", loading && 'animate-spin')} 
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
              <Card className="border-border shadow-2xl bg-white rounded-[3.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200">
                        <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Full identity</th>
                        <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Access tier</th>
                        <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Status</th>
                        <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Joined</th>
                        <th className="px-12 py-8 text-right text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                         <tr>
                          <td colSpan={5} className="px-12 py-40 text-center">
                            <RefreshCw className="h-12 w-12 animate-spin text-primary opacity-20 mx-auto" />
                            <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Syncing Records...</p>
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-12 py-40 text-center">
                            <div className="h-20 w-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-slate-200 text-slate-300">
                               <Users className="h-10 w-10" />
                            </div>
                            <h3 className="text-slate-900 font-display font-black text-2xl tracking-tight mb-3">No Results Found</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Query returned zero records</p>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u._id} className="hover:bg-blue-50/30 transition-all duration-500 group relative">
                            <td className="px-12 py-10">
                              <div className="flex items-center gap-6">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/5 to-blue-500/20 p-[1px] shadow-sm transform group-hover:rotate-6 transition-all duration-700">
                                  <div className="h-full w-full rounded-[15px] bg-white flex items-center justify-center text-primary text-base font-black border border-slate-100 shadow-inner">
                                    {u.username.substring(0, 2).toUpperCase()}
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <div className="text-lg font-display font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">{u.username}</div>
                                  <div className="text-[10px] text-slate-500 font-bold flex items-center gap-3 uppercase tracking-widest">
                                    <Mail className="h-3.5 w-3.5 text-primary/40" />
                                    {u.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-12 py-10">
                              <span className={cn(
                                "inline-flex items-center gap-3 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border shadow-sm transition-all duration-500",
                                u.role === 'SYSTEM_ADMIN' 
                                  ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-500/5' 
                                  : u.role === 'ADMIN'
                                    ? 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-500/5'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 shadow-slate-500/5'
                                )}>
                                {u.role === 'SYSTEM_ADMIN' && <Shield className="h-3.5 w-3.5" />}
                                {u.role === 'TEACHER' ? 'Instructor' : u.role}
                              </span>
                            </td>
                            <td className="px-12 py-10">
                              <div className={cn(
                                "inline-flex items-center gap-3 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border shadow-sm",
                                u.status === 'ACTIVE' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-slate-500 bg-slate-50 border-slate-200'
                              )}>
                                <div className={cn(
                                  "h-1.5 w-1.5 rounded-full transition-all duration-500",
                                  u.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)] animate-pulse' : 'bg-slate-300'
                                )} />
                                {u.status}
                              </div>
                            </td>
                            <td className="px-12 py-10 text-[11px] text-slate-500 font-black tracking-[0.1em] uppercase transition-colors group-hover:text-slate-900">
                              {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td className="px-12 py-10 text-right">
                              <div className="flex items-center justify-end gap-4">
                                 <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className={cn(
                                    "rounded-xl font-black text-[9px] uppercase tracking-widest h-12 px-8 border-slate-200 shadow-sm transition-all duration-500",
                                    u.status === 'ACTIVE' 
                                      ? "text-rose-600 bg-white border-rose-100 hover:bg-rose-600 hover:text-white hover:border-rose-600" 
                                      : "text-emerald-600 bg-white border-emerald-100 hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                                  )}
                                  onClick={() => toggleStatus(u)}
                                >
                                  {u.status === 'ACTIVE' ? <Ban className="h-4 w-4 mr-3" /> : <CheckCircle className="h-4 w-4 mr-3" />}
                                  {u.status === 'ACTIVE' ? 'Deactivate' : 'Restore'}
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12 text-slate-400 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
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
