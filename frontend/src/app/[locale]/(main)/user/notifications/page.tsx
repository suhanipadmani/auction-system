"use client";

import { useState } from "react";
import { Bell, Clock, CheckCircle2, History, Trash2, LayoutDashboard } from "lucide-react";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const t = useTranslations("notifications");
  const commonT = useTranslations("common");
  const [page, setPage] = useState(1);
  const router = useRouter();

  const { data: response, isLoading } = useNotifications({ page, limit: 10 });
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const notifications = response?.data || [];
  const totalPages = response?.totalPages || 1;
  const totalItems = response?.total || 0;

  const handleNotificationClick = (n: any) => {
    markRead(n._id);
    if (n.link) {
      router.push(n.link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardHeader
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <Bell className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">{t("recentTitle")}</h2>
            <p className="text-xs text-gray-500 font-medium">{t("recentSubtitle", { count: notifications.length })}</p>
          </div>
        </div>

        {notifications.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllRead()}
            className="text-xs gap-2 border-white/5 bg-white/5 hover:bg-white/10"
          >
            <CheckCircle2 className="w-4 h-4" />
            {t("markAllRead")}
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 w-full bg-white/5 animate-pulse rounded-2xl border border-white/5" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white/[0.03] border border-dashed border-white/10 rounded-[2.5rem] gap-4">
            <div className="p-4 rounded-full bg-white/5">
              <History className="w-10 h-10 text-gray-600" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">{t("empty")}</p>
              <p className="text-sm text-gray-500 mt-1">{t("emptySubtitle")}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {notifications.map((n: any) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={cn(
                  "group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden",
                  n.isRead
                    ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                    : "bg-indigo-500/5 border-indigo-500/20 hover:bg-indigo-500/10"
                )}
              >
                {!n.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                )}
                
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110",
                    n.isRead ? "bg-white/5 text-gray-500" : "bg-indigo-500/20 text-indigo-400"
                  )}>
                    <Bell className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className={cn(
                      "text-sm font-semibold leading-relaxed",
                      n.isRead ? "text-gray-400" : "text-white"
                    )}>
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </div>
                  </div>

                  {n.isRead && (
                    <button 
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Delete logic could go here if implemented in backend
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pt-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              showingCount={notifications.length}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
