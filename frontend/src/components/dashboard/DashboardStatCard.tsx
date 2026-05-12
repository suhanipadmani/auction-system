import { cn } from "@/lib/utils";
import { analyticsColors } from "@/constants/analyticsColors";
import { IDashboardStatCardProps } from "@/types/components";

export function DashboardStatCard({ title, value, icon, color = "indigo", className, trend }: IDashboardStatCardProps) {
  return (
    <div className={cn(
      "bg-gradient-to-br border rounded-3xl p-6 shadow-xl flex items-center justify-between group hover:brightness-110 transition relative overflow-hidden",
      analyticsColors[color].stat,
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
