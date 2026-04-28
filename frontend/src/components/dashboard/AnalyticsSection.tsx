import { cn } from "@/lib/utils";
import { ReactNode } from "react";

import { IAnalyticsCardProps, IAnalyticsSectionProps } from "@/types/components";


export function AnalyticsCard({
  title,
  value,
  subtitle,
  icon,
  percentage,
  color = "indigo",
  className,
}: IAnalyticsCardProps) {
  const colorMap = {
    indigo: "from-indigo-500/10 to-indigo-500/5 text-indigo-400 border-indigo-500/20",
    emerald: "from-emerald-500/10 to-emerald-500/5 text-emerald-400 border-emerald-500/20",
    purple: "from-purple-500/10 to-purple-500/5 text-purple-400 border-purple-500/20",
    amber: "from-amber-500/10 to-amber-500/5 text-amber-400 border-amber-500/20",
    rose: "from-rose-500/10 to-rose-500/5 text-rose-400 border-rose-500/20",
    blue: "from-blue-500/10 to-blue-500/5 text-blue-400 border-blue-500/20",
    teal: "from-teal-500/10 to-teal-500/5 text-teal-400 border-teal-500/20",
  };

  const ringColorMap = {
    indigo: "stroke-indigo-500",
    emerald: "stroke-emerald-500",
    purple: "stroke-purple-500",
    amber: "stroke-amber-500",
    rose: "stroke-rose-500",
    blue: "stroke-blue-500",
    teal: "stroke-teal-500",
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 transition-all hover:shadow-2xl hover:brightness-110 group",
      colorMap[color],
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {percentage !== undefined && (
          <div className="relative w-12 h-12">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="opacity-10"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (125.6 * percentage) / 100}
                strokeLinecap="round"
                className={cn("transition-all duration-1000 ease-out", ringColorMap[color])}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
              {percentage}%
            </div>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-gray-400 text-xs font-medium mb-1 uppercase tracking-wider">{title}</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
          {subtitle && <span className="text-[10px] text-gray-500 font-medium">{subtitle}</span>}
        </div>
      </div>

      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-current opacity-5 blur-3xl" />
    </div>
  );
}




export function AnalyticsSection({ title, description, children, className }: IAnalyticsSectionProps) {
  return (
    <section className={cn("space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000", className)}>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-8 bg-primary rounded-full" />
            {title}
        </h2>
        {description && <p className="text-gray-500 text-sm">{description}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {children}
      </div>
    </section>
  );
}
