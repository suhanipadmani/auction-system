"use client";

import Link from "next/link";
import { usePathname } from "@/i18n/routing";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { ISidebarProps } from "@/types/components";
import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/hooks/useAuth";
import { getVisibleLinks } from "@/config/navigation";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";


export function Sidebar({ isMobile, onClose, isCollapsed, onToggle }: ISidebarProps) {
  const t = useTranslations("common.sidebar");
  const authT = useTranslations("auth");
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  const visibleLinks = getVisibleLinks(user?.role);

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <div className={`transition-all duration-300 ${isCollapsed ? "w-20" : "w-72"} h-screen bg-card border-r border-border flex flex-col ${isMobile ? "" : "fixed left-0 top-0 shadow-2xl shadow-black/50 z-[50]"}`}>
      <div className={`h-16 flex items-center px-6 relative ${isCollapsed ? "justify-center" : ""}`}>
        {!isCollapsed && (
          <div className="flex flex-col">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent truncate leading-none">
              {t('auctionsystem')}
            </h1>
            <p className="text-[9px] text-muted-foreground mt-1 capitalize font-black tracking-widest opacity-60 leading-none">
              {t('portal', { role: authT(user?.role || 'bidder') })}
            </p>
          </div>
        )}
        {isCollapsed && (
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <span className="text-indigo-400 font-black text-lg">A</span>
          </div>
        )}

        {!isMobile && onToggle && !isSignOutModalOpen && (
          <button
            onClick={onToggle}
            className="absolute -right-3.5 top-16 -translate-y-1/2 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white border-2 border-background hover:bg-indigo-500 transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)] z-[60]"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      <nav className={`flex-1 px-4 space-y-2 mt-6 ${isCollapsed ? "items-center" : ""}`}>
        {visibleLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={handleLinkClick}
              title={isCollapsed ? t(link.name.toLowerCase().replace(/\s+/g, '')) : ""}
              className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-4"} py-3 rounded-xl transition-all duration-300 font-bold group relative ${
                isActive 
                  ? "bg-indigo-500/10 text-indigo-400 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)] border-indigo-500/20" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white border-transparent"
              } border`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              )}
              <link.icon className={`w-5 h-5 shrink-0 transition-all duration-300 ${
                isActive 
                  ? "text-indigo-400 drop-shadow-[0_0_5px_rgba(99,102,241,0.5)] scale-110" 
                  : "text-muted-foreground group-hover:text-white"
              }`} />
              {!isCollapsed && (
                <span className="relative">
                  {t(link.name.toLowerCase().replace(/\s+/g, ''))}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <button
          onClick={() => {
            handleLinkClick();
            setIsSignOutModalOpen(true);
          }}
          className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 w-full px-4"} py-3 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all duration-300 font-bold border border-transparent hover:border-rose-500/20 group`}
          title={isCollapsed ? t('signOut') : ""}
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          {!isCollapsed && <span>{t('signOut')}</span>}
        </button>
      </div>

      <Modal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        title={t('signOutTitle')}
        cancelText={t('signOutCancel')}
        confirmText={isLoggingOut ? t('signOutLoading') : t('signOutConfirm')}
        onCancel={() => setIsSignOutModalOpen(false)}
        onConfirm={() => logout()}
        isConfirmLoading={isLoggingOut}
        isDanger
      >
        <p className="text-gray-300">{t('signOutMessage')}</p>
      </Modal>
    </div>
  );
}
