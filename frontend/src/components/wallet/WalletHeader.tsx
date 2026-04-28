"use client";

import { LayoutGrid, Settings2, FileText } from "lucide-react";

// Types
import { IWalletHeaderProps } from "@/types/components";
import { useTranslations } from "next-intl";
import { WALLET_VIEW_TYPES } from "@/enums";

export function WalletHeader({ activeView, onViewChange }: IWalletHeaderProps) {
  const t = useTranslations("wallet");

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-heading text-white">{t('controlPanel')}</h1>
        <p className="text-muted-foreground font-medium">{t('description')}</p>
      </div>

      <div className="flex p-1 bg-background/50 backdrop-blur-md border border-border/50 rounded-2xl w-fit">
        <button
          onClick={() => onViewChange(WALLET_VIEW_TYPES.OVERVIEW)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeView === WALLET_VIEW_TYPES.OVERVIEW ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-white'}`}
        >
          <LayoutGrid className="h-4 w-4" />
          {t('overview')}
        </button>
        <button
          onClick={() => onViewChange(WALLET_VIEW_TYPES.MANUAL)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeView === WALLET_VIEW_TYPES.MANUAL ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-white'}`}
        >
          <Settings2 className="h-4 w-4" />
          {t('adjustBalance')}
        </button>
        <button
          onClick={() => onViewChange(WALLET_VIEW_TYPES.HISTORY)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeView === WALLET_VIEW_TYPES.HISTORY ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-white'}`}
        >
          <FileText className="h-4 w-4" />
          {t('history')}
        </button>
      </div>
    </div>
  );
}
