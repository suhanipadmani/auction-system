"use client";

import Link from "next/link";
import { IQuickActionCardProps } from "@/types/components";
import { cn } from "@/lib/utils";

export function QuickActionCard({
  title,
  description,
  icon,
  href,
  onClick,
  disabled = false,
  color = "indigo"
}: IQuickActionCardProps) {
  const colorMap = {
    indigo: "bg-indigo-500/10 text-indigo-400 group-hover:text-indigo-400",
    emerald: "bg-emerald-500/10 text-emerald-400 group-hover:text-emerald-400",
    purple: "bg-purple-500/10 text-purple-400 group-hover:text-purple-400",
    amber: "bg-amber-500/10 text-amber-400 group-hover:text-amber-400",
    rose: "bg-rose-500/10 text-rose-400 group-hover:text-rose-400",
    blue: "bg-blue-500/10 text-blue-400 group-hover:text-blue-400",
    gray: "bg-gray-500/10 text-gray-500",
  };

  const Content = (
    <div className={cn(
      "p-8 rounded-3xl bg-white/5 border border-white/10 transition-all flex items-center gap-6 shadow-lg",
      disabled ? "opacity-50 cursor-not-allowed" : "hover:border-white/20 hover:bg-white/10 group cursor-pointer"
    )}>
      <div className={cn(
        "h-16 w-16 rounded-2xl flex items-center justify-center transition-transform",
        !disabled && "group-hover:scale-105",
        colorMap[color]
      )}>
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className={cn(
          "text-xl font-bold transition-colors",
          disabled ? "text-gray-400" : "text-white",
          !disabled && colorMap[color].split(" ").pop() 
        )}>{title}</h4>
        <p className={cn(
          "text-sm font-medium",
          disabled ? "text-gray-500" : "text-gray-400"
        )}>{description}</p>
      </div>
    </div>
  );

  if (disabled) return Content;

  if (href) {
    return (
      <Link href={href}>
        {Content}
      </Link>
    );
  }

  return (
    <div onClick={onClick}>
      {Content}
    </div>
  );
}
