import Link from "next/link";
import * as React from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({ 
  title, 
  subtitle, 
  backHref, 
  backLabel = "Back", 
  actions,
  className 
}: PageHeaderProps) {
  return (
    <header className={cn(
      "relative z-20 border-b border-border bg-white shadow-sm",
      className
    )}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-6 lg:px-10">
        <div className="min-w-0 flex items-center gap-4">
          {backHref && (
            <Link href={backHref}>
              <Button variant="ghost" size="icon" className="h-10 w-10 border border-border bg-accent hover:bg-white rounded-xl shrink-0 group transition-all">
                <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
              </Button>
            </Link>
          )}
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl font-display font-black tracking-tight text-foreground leading-none">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          {actions}
        </div>
      </div>
    </header>
  );
}
