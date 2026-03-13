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
  { href: "/dashboard", label: "Teacher Dashboard", icon: LayoutDashboard },
  { href: "/results", label: "Results History", icon: ListChecks },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/upload", label: "Upload Batch", icon: GraduationCap },
  { href: "/exports", label: "Smart Reports", icon: FileJson },
  { href: "/admin/users", label: "Users", icon: Shield, adminOnly: true },
  { href: "/admin/settings", label: "Settings", icon: Settings, systemAdminOnly: true },
];

import { ThemeToggle } from "@/components/ThemeToggle";

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
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white transition-colors duration-500">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[50rem] w-[50rem] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 100 : 300 }}
        className={cn(
          "hidden md:flex flex-col border-r border-border bg-card z-30 transition-all",
          "sticky top-0 h-screen overflow-hidden shadow-xl"
        )}
      >
        <div className="flex h-24 items-center justify-between px-8 border-b border-border">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-black text-base tracking-tight leading-none text-foreground">MSBTE Result</span>
                  <span className="text-[9px] uppercase font-black tracking-[0.2em] text-primary mt-1.5">Analyzer System</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2.5 rounded-xl hover:bg-accent transition-all outline-none border border-transparent hover:border-border"
            >
              <ChevronLeft className={cn("h-4 w-4 text-muted-foreground transition-transform", isCollapsed && "rotate-180")} />
            </button>
          </div>
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
                  "flex items-center gap-4 rounded-xl px-4 py-3 text-[12px] font-bold uppercase tracking-wider transition-all group relative overflow-hidden",
                  active
                    ? "text-primary bg-primary/5 border border-primary/20 shadow-sm"
                    : "text-muted-foreground hover:text-primary hover:bg-accent"
                )}
              >
                {active && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.8)]"
                  />
                )}
                <Icon className={cn("h-5 w-5 shrink-0 transition-all", active ? "text-primary scale-110" : "opacity-60 group-hover:opacity-100 group-hover:text-primary")} />
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

        <div className="p-6 border-t border-border">
          {isCollapsed ? (
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-2xl bg-primary shadow-md transform hover:rotate-6 transition-all duration-500">
                <div className="h-full w-full rounded-[15px] bg-white flex items-center justify-center text-primary text-xs font-black ring-1 ring-inset ring-black/5">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 bg-accent border border-border p-4 rounded-xl group hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-black shrink-0 shadow-md">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate tracking-tight">{user?.username}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">{user?.role}</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="p-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all active:scale-90"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="flex md:hidden flex-col w-full">
        <header className="h-20 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-display font-black text-xs tracking-tight text-foreground uppercase tracking-widest">MSBTE Result Analyzer System</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-3 rounded-xl bg-accent border border-border text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
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
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed top-0 left-0 bottom-0 w-[300px] bg-card border-r border-border z-50 md:hidden flex flex-col p-8"
              >
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <span className="font-display font-black text-base tracking-tight text-foreground">MSBTE Result Analyzer System</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button onClick={() => setIsMobileOpen(false)} className="p-3 rounded-xl bg-accent text-foreground border border-border">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
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
                          "flex items-center gap-4 rounded-xl px-5 py-4 text-[12px] font-bold uppercase tracking-widest transition-all",
                          active
                            ? "bg-primary text-white shadow-lg"
                            : "text-muted-foreground hover:bg-accent hover:text-primary"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-auto pt-8 border-t border-border">
                  <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-accent border border-border">
                    <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white font-black">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground truncate">{user?.username}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">{user?.role}</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="w-full rounded-xl h-14 bg-destructive/10 text-destructive font-bold uppercase tracking-widest text-[11px] border border-destructive/20" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
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
