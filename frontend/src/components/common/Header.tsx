"use client";

import { Menu } from "lucide-react";
import { IHeaderProps } from "@/types/components";
import { useAuthStore } from "@/store/auth.store";
import { NotificationCenter } from "../notifications/NotificationCenter";

export function Header({ onMenuClick }: IHeaderProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 lg:ml-64 text-foreground">
      <button 
        onClick={onMenuClick}
        className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors lg:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex items-center gap-3 sm:gap-6 ml-auto">
        <NotificationCenter />
        
        <div className="flex items-center gap-3 pl-3 sm:pl-6 border-l border-border">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-white leading-none mb-1">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{user?.role}</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20 ring-2 ring-background flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
