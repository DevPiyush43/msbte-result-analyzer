"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { 
  BarChart3, 
  LayoutDashboard, 
  ListChecks, 
  Upload, 
  Shield, 
  Settings, 
  ChevronLeft, 
  Menu, 
  X,
  FileJson,
  History,
  LogOut,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  systemAdminOnly?: boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/results", label: "Results", icon: ListChecks },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/upload", label: "Batch Extraction", icon: GraduationCap },
  { href: "/admin/users", label: "Users", icon: Shield, adminOnly: true },
  { href: "/admin/settings", label: "Settings", icon: Settings, systemAdminOnly: true },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const filteredNav = navItems.filter(item => {
    if (item.systemAdminOnly && user?.role !== "SYSTEM_ADMIN") return false;
    if (item.adminOnly && user?.role !== "ADMIN" && user?.role !== "SYSTEM_ADMIN") return false;
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-primary selection:text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[50rem] w-[50rem] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-indigo-500/5 blur-[100px]" />
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 100 : 300 }}
        className={cn(
          "hidden md:flex flex-col border-r border-white/5 bg-white/[0.02] backdrop-blur-3xl z-30 transition-all",
          "sticky top-0 h-screen overflow-hidden"
        )}
      >
        <div className="flex h-24 items-center justify-between px-8 border-b border-white/5">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-black text-lg tracking-tight leading-none text-white">Quantumsync</span>
                  <span className="text-[8px] uppercase font-black tracking-[0.3em] text-white/30 mt-1">Academic Node</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2.5 rounded-xl hover:bg-white/5 transition-all outline-none border border-transparent hover:border-white/10"
          >
            <ChevronLeft className={cn("h-4 w-4 text-white/40 transition-transform", isCollapsed && "rotate-180")} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 p-6 mt-6">
          {filteredNav.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 rounded-2xl px-4 py-3.5 text-[11px] font-black uppercase tracking-widest transition-all group relative overflow-hidden",
                  active
                    ? "text-white bg-white/5 border border-white/10 shadow-2xl"
                    : "text-white/40 hover:text-white hover:bg-white/[0.03]"
                )}
              >
                {active && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.8)]"
                  />
                )}
                <Icon className={cn("h-5 w-5 shrink-0 transition-all", active ? "text-primary scale-110" : "opacity-40 group-hover:opacity-100 group-hover:text-primary")} />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          {isCollapsed ? (
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/5 to-accent/20 p-[1px] shadow-sm transform hover:rotate-6 transition-all duration-500">
                <div className="h-full w-full rounded-[15px] bg-[#0a0a0a] flex items-center justify-center text-primary text-xs font-black ring-1 ring-inset ring-white/10">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 bg-white/[0.03] border border-white/5 p-4 rounded-2xl group hover:border-white/10 transition-all">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black shrink-0 shadow-inner">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-white truncate tracking-tight">{user?.username}</p>
                  <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mt-0.5">{user?.role}</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="p-2.5 rounded-xl text-white/20 hover:text-rose-500 hover:bg-rose-500/10 transition-all active:scale-90"
                title="Terminate Session"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="flex md:hidden flex-col w-full">
        <header className="h-20 border-b border-white/5 bg-white/[0.02] backdrop-blur-3xl flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-display font-black text-base tracking-tight text-white uppercase tracking-[0.1em]">Quantumsync</span>
          </div>
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-3 rounded-xl bg-white/5 border border-white/10 text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 md:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed top-0 left-0 bottom-0 w-[300px] bg-[#0a0a0a] border-r border-white/10 z-50 md:hidden flex flex-col p-8"
              >
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <span className="font-display font-black text-lg tracking-tight">Quantumsync</span>
                  </div>
                  <button onClick={() => setIsMobileOpen(false)} className="p-3 rounded-xl bg-white/5 text-white border border-white/10">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-3 flex-1">
                  {filteredNav.map((item) => {
                    const active = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-4 rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest transition-all",
                          active
                            ? "bg-primary text-white shadow-2xl shadow-primary/20"
                            : "text-white/40 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-auto pt-8 border-t border-white/5">
                  <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{user?.username}</p>
                      <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-0.5">{user?.role}</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="w-full rounded-2xl h-14 bg-rose-500/10 text-rose-500 font-black uppercase tracking-widest text-[10px] border border-rose-500/20" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-3" />
                    Terminate Connection
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 relative z-10">{children}</main>
      </div>

      {/* Desktop Main Content Wrapper */}
      <div className="hidden md:block flex-1 overflow-auto relative z-10">
        {children}
      </div>
    </div>
  );
}
