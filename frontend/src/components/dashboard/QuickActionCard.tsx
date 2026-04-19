"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { IQuickActionCardProps } from "@/types/components";
import { cn } from "@/lib/utils";

export function QuickActionCard({
  title,
  description,
  icon,
  href,
  onClick,
  disabled = false,
  color = "indigo",
}: IQuickActionCardProps & { className?: string }) {
  const themeColors = {
    indigo: {
      bg: "hover:bg-indigo-500/10",
      border: "hover:border-indigo-500/30",
      icon: "bg-indigo-500/20 text-indigo-400 shadow-indigo-500/20",
      text: "text-indigo-400"
    },
    emerald: {
      bg: "hover:bg-emerald-500/10",
      border: "hover:border-emerald-500/30",
      icon: "bg-emerald-500/20 text-emerald-400 shadow-emerald-500/20",
      text: "text-emerald-400"
    },
    purple: {
      bg: "hover:bg-purple-500/10",
      border: "hover:border-purple-500/30",
      icon: "bg-purple-500/20 text-purple-400 shadow-purple-500/20",
      text: "text-purple-400"
    },
    amber: {
      bg: "hover:bg-amber-500/10",
      border: "hover:border-amber-500/30",
      icon: "bg-amber-500/20 text-amber-400 shadow-amber-500/20",
      text: "text-amber-400"
    },
    rose: {
      bg: "hover:bg-rose-500/10",
      border: "hover:border-rose-500/30",
      icon: "bg-rose-500/20 text-rose-400 shadow-rose-500/20",
      text: "text-rose-400"
    },
    blue: {
      bg: "hover:bg-blue-500/10",
      border: "hover:border-blue-500/30",
      icon: "bg-blue-500/20 text-blue-400 shadow-blue-500/20",
      text: "text-blue-400"
    },
    gray: {
      bg: "hover:bg-white/5",
      border: "hover:border-white/10",
      icon: "bg-white/10 text-gray-400 shadow-white/5",
      text: "text-gray-400"
    }
  };

  const scheme = themeColors[color as keyof typeof themeColors] || themeColors.indigo;

  const Content = (
    <div className={cn(
      "relative group p-6 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-md overflow-hidden transition-all duration-500 flex items-start gap-5 shadow-2xl",
      !disabled && "hover:shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:-translate-y-1.5 active:scale-[0.98]",
      !disabled && scheme.border,
      !disabled && scheme.bg,
      disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
    )}>
      {/* Dynamic Background Glow */}
      <div className={cn(
        "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] transition-opacity duration-500 opacity-0 group-hover:opacity-20",
        scheme.text.replace("text", "bg")
      )} />

      {/* Icon Container */}
      <div className={cn(
        "relative shrink-0 h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg",
        scheme.icon,
        !disabled && "group-hover:scale-110 group-hover:rotate-3 shadow-[0_0_20px_rgba(0,0,0,0.4)] group-hover:shadow-[0_0_25px_rgba(var(--color),0.5)]"
      )}>
        <div className="relative z-10 transition-transform duration-500 group-hover:scale-110">
          {icon}
        </div>
        {!disabled && (
          <div className={cn(
            "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl",
            scheme.icon.split(" ")[0]
          )} />
        )}
      </div>

      {/* Text Content */}
      <div className="relative z-10 space-y-2 flex-1 pt-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className={cn(
            "text-lg font-bold tracking-tight transition-colors duration-300",
            disabled ? "text-gray-500" : "text-white group-hover:text-white"
          )}>
            {title}
          </h4>
          {!disabled && (
            <ChevronRight className={cn(
              "w-5 h-5 transition-all duration-500 transform translate-x-[-10px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
              scheme.text
            )} />
          )}
        </div>
        <p className={cn(
          "text-sm font-medium leading-relaxed transition-colors duration-300",
          disabled ? "text-gray-600" : "text-gray-500 group-hover:text-gray-300"
        )}>
          {description}
        </p>
      </div>

      {/* Bottom Accent Line */}
      {!disabled && (
        <div className={cn(
          "absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700",
          scheme.icon.split(" ")[0].replace("bg-", "bg-").replace("/20", "")
        )} />
      )}
    </div>
  );

  if (disabled) return Content;

  if (href) {
    return (
      <Link href={href} className="block no-underline">
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
