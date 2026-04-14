"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { LogOut } from "lucide-react";
import { useLogout } from "@/hooks/useAuth";
import { getVisibleLinks } from "@/config/navigation";

import { ISidebarProps } from "@/types/components";

export function Sidebar({ isMobile, onClose }: ISidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { mutate: logout } = useLogout();

  const visibleLinks = getVisibleLinks(user?.role);

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <div className={`w-64 h-screen bg-card border-r border-border flex flex-col ${isMobile ? "" : "fixed left-0 top-0"}`}>
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
          AuctionSystem
        </h1>
        <p className="text-xs text-muted-foreground mt-1 capitalize">{user?.role} Portal</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {visibleLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
              }`}
            >
              <link.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => {
            handleLinkClick();
            logout();
          }}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
