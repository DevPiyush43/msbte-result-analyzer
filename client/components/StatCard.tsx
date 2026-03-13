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
  tone?: "blue" | "green" | "purple" | "orange" | "red" | "indigo";
  className?: string;
};

const tones: Record<NonNullable<StatCardProps["tone"]>, { card: string; icon: string; accent: string }> = {
  blue: {
    card: "hover:border-blue-500/30",
    icon: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    accent: "bg-blue-500/10",
  },
  green: {
    card: "hover:border-emerald-500/30",
    icon: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    accent: "bg-emerald-500/10",
  },
  purple: {
    card: "hover:border-violet-500/30",
    icon: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    accent: "bg-violet-500/10",
  },
  orange: {
    card: "hover:border-amber-500/30",
    icon: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    accent: "bg-amber-500/10",
  },
  red: {
    card: "hover:border-rose-500/30",
    icon: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    accent: "bg-rose-500/10",
  },
  indigo: {
    card: "hover:border-indigo-500/30",
    icon: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    accent: "bg-indigo-500/10",
  },
};

export function StatCard({ label, value, hint, icon, trend, tone = "blue", className }: StatCardProps) {
  const t = tones[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn("h-full", className)}
    >
      <Card className={cn(
        "h-full p-8 border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl transition-all duration-500 rounded-[2.5rem] relative overflow-hidden group border-t-white/10",
        t.card
      )}>
        <div className={cn("absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40", t.accent)} />
        
        <div className="flex flex-col h-full relative z-10">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 group-hover:text-white/40 transition-colors">{label}</span>
            {icon && (
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-500 shadow-inner group-hover:scale-110", t.icon)}>
                {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "h-5 w-5" })}
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="text-4xl font-display font-black tracking-tighter text-white tabular-nums drop-shadow-2xl">{value}</div>
            
            {(hint || trend) && (
              <div className="flex items-center gap-3">
                {trend && (
                  <span className={cn(
                    "text-[10px] font-black px-3 py-1 rounded-xl flex items-center gap-2 border shadow-sm",
                    trend.isUp ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  )}>
                    {trend.isUp ? "↑" : "↓"} {trend.value}%
                  </span>
                )}
                {hint && <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{hint}</span>}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
