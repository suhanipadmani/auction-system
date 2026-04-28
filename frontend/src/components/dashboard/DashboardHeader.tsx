"use client";

import { LayoutDashboard } from "lucide-react";
import { useTranslations } from "next-intl";

import { IDashboardHeaderProps } from "@/types/components";

export function DashboardHeader({
  userName,
  subtitle,
  statusLabel,
  statusValue,
  title,
  children
}: IDashboardHeaderProps) {
  const t = useTranslations("common.dashboard");
  
  const displaySubtitle = subtitle || t("subtitle");
  const displayStatusLabel = statusLabel || t("status");
  const displayStatusValue = statusValue || t("active");
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
      <div>
        <h1 className="text-4xl font-bold font-heading text-white tracking-tight">
          {title ? (
            title
          ) : (
            <>
              {t("welcome")} <span className="text-primary">{userName?.split(" ")[0]}</span>
            </>
          )}
        </h1>
        <p className="text-gray-400 mt-2 font-medium flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-primary/60" />
          {displaySubtitle}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {displayStatusLabel && (
          <div className="hidden md:block text-right">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{displayStatusLabel}</p>
            <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 justify-end">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {displayStatusValue}
            </p>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
