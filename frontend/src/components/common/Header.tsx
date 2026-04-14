"use client";

import { Menu, User, Bell } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

import { IHeaderProps } from "@/types/components";

export function Header({ onMenuClick }: IHeaderProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-30 lg:hidden text-foreground">
      <button 
        onClick={onMenuClick}
        className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex items-center gap-4">
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-background"></span>
        </button>
        <div className="flex items-center gap-2 pl-4 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-xs font-bold ring-2 ring-background">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
