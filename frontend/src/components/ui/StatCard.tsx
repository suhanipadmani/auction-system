"use client";

import { ReactNode } from "react";

import { IStatCardProps } from "@/types/components";

export function StatCard({ title, value, icon, iconContainerClass }: IStatCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl px-6 py-4 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${iconContainerClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
