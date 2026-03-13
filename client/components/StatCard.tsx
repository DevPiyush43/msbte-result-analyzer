import * as React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isUp: boolean;
  };
  tone?: "blue" | "green" | "purple" | "orange" | "red" | "indigo" | "pink";
  className?: string;
};

const tones: Record<NonNullable<StatCardProps["tone"]>, { card: string; icon: string; accent: string }> = {
  blue: {
    card: "hover:border-blue-500/30",
    icon: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    accent: "bg-blue-500/10",
  },
  green: {
    card: "hover:border-emerald-500/30",
    icon: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    accent: "bg-emerald-500/10",
  },
  purple: {
    card: "hover:border-purple-500/30",
    icon: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    accent: "bg-purple-500/10",
  },
  orange: {
    card: "hover:border-amber-500/30",
    icon: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    accent: "bg-amber-500/10",
  },
  red: {
    card: "hover:border-rose-500/30",
    icon: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    accent: "bg-rose-500/10",
  },
  indigo: {
    card: "hover:border-indigo-500/30",
    icon: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    accent: "bg-indigo-500/10",
  },
  pink: {
    card: "hover:border-blue-500/30",
    icon: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    accent: "bg-blue-500/10",
  },
};

export function StatCard({ label, value, hint, icon, trend, tone = "blue", className }: StatCardProps) {
  const t = tones[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn("h-full", className)}
    >
      <Card className={cn(
        "h-full p-6 border border-border bg-card shadow-md transition-all duration-500 rounded-2xl relative overflow-hidden group",
        t.card
      )}>
        <div className={cn("absolute -top-16 -right-16 w-32 h-32 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-30", t.accent)} />
        
        <div className="flex flex-col h-full relative z-10">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
            {icon && (
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-500 shadow-sm group-hover:scale-110", t.icon)}>
                {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "h-5 w-5" })}
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="text-3xl font-display font-black tracking-tight text-foreground tabular-nums">{value}</div>
            
            {(hint || trend) && (
              <div className="flex items-center gap-3">
                {trend && (
                  <span className={cn(
                    "text-[10px] font-bold px-3 py-1 rounded-xl flex items-center gap-2 border shadow-sm",
                    trend.isUp ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                  )}>
                    {trend.isUp ? "↑" : "↓"} {trend.value}%
                  </span>
                )}
                {hint && <span className="text-[11px] font-medium text-muted-foreground tracking-tight">{hint}</span>}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
