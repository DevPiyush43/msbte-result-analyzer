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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-8 py-10 lg:px-12">
        <div className="min-w-0 flex items-center gap-6">
          {backHref && (
            <Link href={backHref}>
              <Button variant="ghost" size="icon" className="h-12 w-12 border border-border bg-accent hover:bg-white rounded-2xl shrink-0 group transition-all">
                <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
              </Button>
            </Link>
          )}
          <div className="min-w-0 space-y-1.5">
            <h1 className="text-3xl font-display font-black tracking-tight text-foreground leading-none">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-4">
          {actions}
        </div>
      </div>
    </header>
  );
}
