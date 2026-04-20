"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, Trash2, Clock } from "lucide-react";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useSocket } from "@/providers/SocketProvider";
import { useQueryClient } from "@tanstack/react-query";
import { NOTIFICATION_KEYS } from "@/hooks/useNotifications";
import { useRouter } from "next/navigation";

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: response, isLoading } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const router = useRouter();

  const notifications = response?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  // Listen for real-time notification events to invalidate query
  useEffect(() => {
    const handleNotification = (data: any) => {
        // Invalidate the notifications query to fetch the latest
        queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
        // Optional: Play a sound or show a toast
    };

    socket.on("notification", handleNotification);
    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, queryClient]);

  const handleNotificationClick = (n: any) => {
    // 1. Delete notification (called markRead in hook but logic is now delete)
    markRead(n._id);

    // 2. Redirect if link exists
    if (n.link) {
      router.push(n.link);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-900">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/50">
              <h3 className="font-bold text-sm dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-500 uppercase tracking-wider"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700">
              {isLoading ? (
                <div className="p-8 text-center text-zinc-500 text-sm">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                     <Bell className="w-6 h-6 text-zinc-300 dark:text-zinc-600" />
                  </div>
                  <p className="text-zinc-500 text-sm font-medium">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {notifications.map((n: any) => (
                    <div
                      key={n._id}
                      className={cn(
                        "p-4 flex gap-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer",
                        "bg-indigo-50/30 dark:bg-indigo-500/5"
                      )}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-indigo-600" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm leading-snug font-semibold text-zinc-900 dark:text-zinc-100">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 text-center bg-zinc-50/50 dark:bg-zinc-800/50">
                 <button className="text-xs font-bold text-zinc-500 hover:text-indigo-600 transition-colors">
                    View all activity
                 </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
