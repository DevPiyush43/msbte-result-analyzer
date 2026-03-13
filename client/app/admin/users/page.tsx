"use client";

import * as React from "react";
import { Shield, UserPlus, Search, Filter, Mail, BadgeCheck, MoreVertical, Ban, CheckCircle, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Protected } from "@/components/Protected";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

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
      setFormError(err?.response?.data?.error?.message || "Failed to create user");
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
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              <span>User Management</span>
            </div>
          }
          subtitle="Manage authorized staff and system administrators."
          actions={
            <Button 
              size="sm" 
              className="bg-indigo-600 hover:bg-indigo-700 font-bold border-none shadow-lg shadow-indigo-200"
              onClick={() => setIsModalOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Provision New User
            </Button>
          }
        />

        {/* Create User Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Provision Staff Account</h3>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => setIsModalOpen(false)}>×</Button>
              </div>
              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl">
                    {formError}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Username</label>
                    <Input 
                      required
                      value={modalForm.username}
                      onChange={e => setModalForm({...modalForm, username: e.target.value})}
                      placeholder="jdoe"
                      className="h-10 bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Full Name</label>
                    <Input 
                      required
                      value={modalForm.fullName}
                      onChange={e => setModalForm({...modalForm, fullName: e.target.value})}
                      placeholder="John Doe"
                      className="h-10 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Email Address</label>
                  <Input 
                    required
                    type="email"
                    value={modalForm.email}
                    onChange={e => setModalForm({...modalForm, email: e.target.value})}
                    placeholder="john@college.edu"
                    className="h-10 bg-slate-50/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Password</label>
                    <Input 
                      required
                      type="password"
                      value={modalForm.password}
                      onChange={e => setModalForm({...modalForm, password: e.target.value})}
                      placeholder="••••••••"
                      className="h-10 bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">System Role</label>
                    <select 
                      className="h-10 w-full px-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium outline-none"
                      value={modalForm.role}
                      onChange={e => setModalForm({...modalForm, role: e.target.value as "ADMIN" | "TEACHER"})}
                    >
                      <option value="TEACHER">Teacher</option>
                      {currentUser?.role === "SYSTEM_ADMIN" && <option value="ADMIN">Administrator</option>}
                    </select>
                  </div>
                </div>

                {modalForm.role === "TEACHER" && (
                  <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 ml-1">Department</label>
                      <Input 
                        value={modalForm.department}
                        onChange={e => setModalForm({...modalForm, department: e.target.value})}
                        placeholder="Computer Dept"
                        className="h-10 bg-slate-50/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 ml-1">Institution</label>
                      <Input 
                        value={modalForm.institution}
                        onChange={e => setModalForm({...modalForm, institution: e.target.value})}
                        className="h-10 bg-slate-50/50"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 flex items-center justify-end gap-3">
                  <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button 
                    type="submit" 
                    className="rounded-xl px-8 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                    disabled={submitting}
                  >
                    {submitting ? "Creating..." : "Create Account"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <main className="mx-auto max-w-6xl px-4 py-8">
          <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search by username or email..." 
                    className="pl-10 h-10 bg-slate-50/50 border-slate-200"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <select 
                    className="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50/50 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="SYSTEM_ADMIN">System Admin</option>
                    <option value="ADMIN">Admin</option>
                    <option value="TEACHER">Teacher</option>
                  </select>
                  <Button variant="ghost" size="sm" className={`w-9 ${loading ? 'animate-spin' : ''}`} onClick={fetchUsers} disabled={loading}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-indigo-200" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-slate-900 font-bold">No users found</h3>
                <p className="text-sm text-slate-500">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Identity</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Role</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Onboarded</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                              {u.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900 tracking-tight">{u.username}</div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
                            u.role === 'SYSTEM_ADMIN' 
                              ? 'bg-rose-50 text-rose-700 border-rose-100' 
                              : u.role === 'ADMIN'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                : 'bg-slate-50 text-slate-700 border-slate-100'
                          }`}>
                            {u.role === 'SYSTEM_ADMIN' && <BadgeCheck className="h-3 w-3" />}
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            u.status === 'ACTIVE' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-50'
                          }`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <Button 
                              variant="ghost" 
                              size="sm" 
                              className={u.status === 'ACTIVE' ? "text-rose-600 hover:bg-rose-50" : "text-emerald-600 hover:bg-emerald-50"}
                              onClick={() => toggleStatus(u)}
                            >
                              {u.status === 'ACTIVE' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4 text-slate-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </AppShell>
    </Protected>
  );
}

import { Users } from "lucide-react";
