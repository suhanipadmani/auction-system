"use client";

import { History } from "lucide-react";

// Hooks
import { usePendingDeposits } from "@/hooks/useWallet";

// Components
import { StatCard } from "@/components/ui/StatCard";

import { TRANSACTION_STATUSES } from "@/enums";

import { useTranslations } from "next-intl";

export function WalletStats() {
  const t = useTranslations("wallet");
  const { data: pendingData, isLoading: isPendingLoading } = usePendingDeposits(TRANSACTION_STATUSES.PENDING);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title={t('pendingRequests')}
        value={isPendingLoading ? "..." : pendingData?.data?.length || 0}
        icon={<History className="h-6 w-6 text-amber-400" />}
        iconContainerClass="bg-amber-400/10 border border-amber-400/20"
      />
    </div>
  );
}
