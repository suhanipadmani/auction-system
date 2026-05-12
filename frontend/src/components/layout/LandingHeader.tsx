"use client";

import { Link } from "@/i18n/routing";
import { Hammer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useTranslations } from "next-intl";

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const t = useTranslations("dashboard.header");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isScrolled 
          ? "bg-background/80 backdrop-blur-md border-b" 
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-1.5 rounded-lg transition-transform group-hover:rotate-12">
            <Hammer className="size-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">BidMaster</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-primary transition-colors">{t('features')}</Link>
          <Link href="#how-it-works" className="hover:text-primary transition-colors">{t('howItWorks')}</Link>
          <Link href="/auctions" className="hover:text-primary transition-colors">{t('liveAuctions')}</Link>
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link 
            href="/login" 
            className="text-sm font-medium hover:text-primary transition-colors px-4 py-2 whitespace-nowrap"
          >
            {t('login')}
          </Link>
          <Link 
            href="/register" 
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
          >
            {t('getStarted')}
          </Link>
        </div>
      </div>
    </header>
  );
}
