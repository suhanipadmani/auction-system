"use client";

import { LayoutGrid, Settings2, FileText } from "lucide-react";

// Types
import { IWalletHeaderProps } from "@/types/components";


export function WalletHeader({ activeView, onViewChange }: IWalletHeaderProps) {

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-heading text-white">Wallet Control Panel</h1>
        <p className="text-muted-foreground font-medium">Manage financial requests, user balances, and wallet security.</p>
      </div>

      <div className="flex p-1 bg-background/50 backdrop-blur-md border border-border/50 rounded-2xl w-fit">
        <button
          onClick={() => onViewChange("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeView === 'overview' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-white'}`}
        >
          <LayoutGrid className="h-4 w-4" />
          Overview
        </button>
        <button
          onClick={() => onViewChange("manual")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeView === 'manual' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-white'}`}
        >
          <Settings2 className="h-4 w-4" />
          Adjust Balance
        </button>
        <button
          onClick={() => onViewChange("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeView === 'history' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-white'}`}
        >
          <FileText className="h-4 w-4" />
          History
        </button>
      </div>
    </div>
  );
}
