"use client";

import { Menu, LogOut, Settings, User as UserIcon, ChevronDown } from "lucide-react";
import { IHeaderProps } from "@/types/components";
import { useAuthStore } from "@/store/auth.store";
import { NotificationCenter } from "../notifications/NotificationCenter";
import { useState, useRef, useEffect } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header({ onMenuClick }: IHeaderProps) {
  const t = useTranslations("common");
  const authT = useTranslations("auth");
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 text-foreground">
      <button 
        onClick={onMenuClick}
        className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors lg:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex items-center gap-3 sm:gap-6 ml-auto">
        <LanguageSwitcher />
        <NotificationCenter />
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 pl-3 sm:pl-6 border-l border-border group"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-white leading-none mb-1 group-hover:text-primary transition-colors">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{authT(user?.role || 'bidder')}</p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20 ring-2 ring-background group-hover:ring-primary/50 transition-all flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Dropdown */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-card border border-border rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
              <div className="px-4 py-3 border-b border-border mb-1 md:hidden">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{authT(user?.role || 'bidder')}</p>
              </div>
              
              <Link 
                href="/user/settings" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                {t('accountSettings')}
              </Link>
              
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 w-full text-left transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
