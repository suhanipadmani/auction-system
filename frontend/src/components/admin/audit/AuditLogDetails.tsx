"use client";

import { useTranslations } from "next-intl";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";

import { IAuditLogDetailsProps } from "@/types/components";

export function AuditLogDetails({ metadata }: IAuditLogDetailsProps) {
  const t = useTranslations("admin_audit_logs");
  const { formatCurrency } = useCurrency();

  if (!metadata) return null;

  // Custom rendering based on metadata type
  if (metadata.type === "LOCKED_FUNDS") {
    return (
      <div className="text-xs space-y-1">
        <p className="text-gray-400">{t('metadata.fundsLocked', { amount: formatCurrency(metadata.amount) })}</p>
        {metadata.reason && <p className="text-gray-500 italic">{t('metadata.reason', { reason: metadata.reason })}</p>}
      </div>
    );
  }

  if (metadata.type === "UNLOCKED_FUNDS") {
    return (
      <div className="text-xs space-y-1">
        <p className="text-gray-400">{t('metadata.fundsUnlocked', { amount: formatCurrency(metadata.amount) })}</p>
        {metadata.reason && <p className="text-gray-500 italic">{t('metadata.reason', { reason: metadata.reason })}</p>}
      </div>
    );
  }

  if (metadata.type === "AUCTION_SETTLEMENT_PAYMENT") {
    return (
      <div className="text-xs space-y-1">
        <p className="text-gray-400 font-medium text-red-400/80">{t('metadata.auctionPayment', { amount: formatCurrency(metadata.amount) })}</p>
        <p className="text-gray-500 italic">{metadata.auctionTitle}</p>
      </div>
    );
  }

  if (metadata.type === "AUCTION_SETTLEMENT_RECEIPT") {
    return (
      <div className="text-xs space-y-1">
        <p className="text-gray-400 font-medium text-emerald-400/80">{t('metadata.auctionReceipt', { amount: formatCurrency(metadata.amount) })}</p>
        <p className="text-gray-500 italic">{metadata.auctionTitle}</p>
      </div>
    );
  }

  if (metadata.type === "DEPOSIT_APPROVED") {
    return (
      <div className="text-xs space-y-1">
        <p className="text-emerald-400 font-medium">{t('metadata.depositApproved', { amount: formatCurrency(metadata.amount) })}</p>
        {metadata.newBalance && <p className="text-gray-500">{t('metadata.newBalance', { amount: formatCurrency(metadata.newBalance) })}</p>}
      </div>
    );
  }

  if (metadata.type === "PAYOUT_APPROVED") {
    return (
      <div className="text-xs space-y-1">
        <p className="text-amber-400 font-medium">{t('metadata.payoutApproved', { amount: formatCurrency(metadata.amount) })}</p>
        {metadata.newLockedBalance !== undefined && <p className="text-gray-500 text-[10px]">{t('metadata.remainingLocked', { amount: formatCurrency(metadata.newLockedBalance) })}</p>}
      </div>
    );
  }

  if (metadata.type === "PAYOUT_REJECTED") {
    return (
      <div className="text-xs space-y-1">
        <p className="text-red-400 font-medium">{t('metadata.payoutRejected', { amount: formatCurrency(metadata.amount) })}</p>
        {metadata.note && <p className="text-gray-500 italic">{t('metadata.reason', { reason: metadata.note })}</p>}
      </div>
    );
  }

  if (metadata.type === "MANUAL_ADJUSTMENT") {
    return (
      <div className="text-xs space-y-1">
        <p className="text-indigo-400 font-medium">{t('metadata.manualAdjustment', { type: metadata.adjustmentType, amount: formatCurrency(metadata.amount) })}</p>
        <p className="text-gray-500 italic">{t('metadata.note', { note: metadata.note })}</p>
      </div>
    );
  }

  if (metadata.type === "WALLET_FREEZE_TOGGLE") {
    return (
      <div className="text-xs">
        <p className={cn(
          "font-black tracking-tight underline py-1",
          metadata.newValue ? "text-red-400" : "text-emerald-400"
        )}>
          {metadata.newValue ? t('metadata.walletFrozen') : t('metadata.walletUnfrozen')}
        </p>
      </div>
    );
  }

  if (metadata.auctionId) {
    return (
      <div className="text-xs space-y-1">
        <p className="text-gray-400">{t('metadata.auction', { title: metadata.auctionTitle || metadata.title })}</p>
        {metadata.amount && <p className="text-gray-400">{t('metadata.bidAmount', { amount: formatCurrency(metadata.amount) })}</p>}
      </div>
    );
  }

  return (
    <div className="text-[10px] text-gray-600 bg-black/20 p-2 rounded border border-white/5 font-mono break-all max-h-20 overflow-y-auto">
      {JSON.stringify(metadata, null, 2)}
    </div>
  );
}
