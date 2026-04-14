import { cn } from "@/lib/utils";

import { IDashboardStatCardProps } from "@/types/components";

export function DashboardStatCard({ title, value, icon, color = "indigo", className, trend }: IDashboardStatCardProps) {
  const colorMap = {
    indigo: "from-indigo-500/10 to-indigo-500/5 border-indigo-500/20 text-indigo-400",
    emerald: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
    purple: "from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-400",
    amber: "from-amber-500/10 to-amber-500/5 border-amber-400/20 text-amber-400",
    rose: "from-rose-500/10 to-rose-500/5 border-rose-500/20 text-rose-400",
    blue: "from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400",
    teal: "from-teal-500/10 to-teal-500/5 border-teal-500/20 text-teal-400",
  };

  return (
    <div className={cn(
      "bg-gradient-to-br border rounded-3xl p-6 shadow-xl flex items-center justify-between group hover:brightness-110 transition relative overflow-hidden",
      colorMap[color],
      className
    )}>
      {/* Decorative Background Glow */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-current opacity-5 blur-3xl" />
      
      <div>
        <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        {trend && <p className="text-[10px] mt-1 font-medium text-emerald-400">{trend}</p>}
      </div>
      <div className="bg-white/5 p-3 rounded-2xl group-hover:scale-110 transition-transform relative z-10">
        {icon}
      </div>
    </div>
  );
}
