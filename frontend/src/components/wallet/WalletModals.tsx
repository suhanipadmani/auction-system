"use client";

import { ShieldAlert, CheckCircle2, XCircle } from "lucide-react";

// Hooks
import { useUserWallet } from "@/hooks/useWallet";
// Utils
import { formatDate } from "@/lib/utils";
// Components
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTranslations } from "next-intl";
import { useCurrency } from "@/hooks/useCurrency";
// Types
import { IWalletModalsProps } from "@/types/components";


export function WalletStatusCheck({ userId }: { userId: string }) {
  const t = useTranslations("wallet.modals");
  const { data: walletData, isLoading } = useUserWallet(userId);
  
  if (isLoading) return <Skeleton className="h-10 w-full animate-pulse" />;
  if (!walletData?.data?.isFrozen) return null;

  return (
    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 mb-4 animate-in zoom-in-95 duration-300">
      <div className="flex items-center gap-2 text-rose-400 mb-1">
        <ShieldAlert className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-wider">{t('walletFrozenTitle')}</span>
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        {t('walletFrozenNotice')}
      </p>
    </div>
  );
}

export function WalletModals({
  isAdjustmentOpen,
  onAdjustmentClose,
  adjustmentData,
  onAdjustmentConfirm,
  isAdjusting,
  isDepositOpen,
  onDepositClose,
  selectedRequest,
  actionType,
  onDepositConfirm,
  isProcessing
}: IWalletModalsProps) {
  const t = useTranslations("wallet");
  const modalT = useTranslations("wallet.modals");
  const { formatCurrency } = useCurrency();
  return (
    <>
      {/* Confirmation Modal */}
      <Modal
        isOpen={isAdjustmentOpen}
        onClose={onAdjustmentClose}
        title={modalT('confirmAdjustment')}
        confirmText={modalT('confirmApply')}
        cancelText={modalT('cancel')}
        onConfirm={onAdjustmentConfirm}
        isConfirmLoading={isAdjusting}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {modalT('adjustNotice', {
              type: t(adjustmentData?.type === 'credit' ? 'creditAdd' : 'debitRemove'),
              amount: formatCurrency(Number(adjustmentData?.amount || 0)),
              direction: modalT(adjustmentData?.type === 'credit' ? 'to' : 'from'),
              user: adjustmentData?.userName || ""
            })}
          </p>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t('table.type')}:</span>
              <span className={`font-bold capitalize ${adjustmentData?.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>{t(adjustmentData?.type === 'credit' ? 'creditAdd' : 'debitRemove')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t('table.amount')}:</span>
              <span className="font-bold text-white">{formatCurrency(Number(adjustmentData?.amount))}</span>
            </div>
            {adjustmentData?.note && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t('adminNote')}:</span>
                <span className="font-medium text-white italic truncate max-w-[200px]">{adjustmentData?.note}</span>
              </div>
            )}
          </div>
          <p className="text-[10px] text-rose-400 flex items-center gap-1 font-medium">
            <ShieldAlert className="h-3 w-3" />
            {modalT('auditTrail')}
          </p>
        </div>
      </Modal>

      {/* Deposit Process Confirmation Modal */}
      <Modal
        isOpen={isDepositOpen}
        onClose={onDepositClose}
        title={modalT(actionType === 'approved' ? 'approveDeposit' : 'rejectDeposit')}
        confirmText={modalT('confirmAction', { action: t(`statuses.${actionType}`) })}
        cancelText={modalT('cancel')}
        onConfirm={() => selectedRequest?._id && onDepositConfirm(selectedRequest._id, actionType)}
        isConfirmLoading={isProcessing}
        isDanger={actionType === 'rejected'}
      >
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center space-y-3">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${actionType === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {actionType === 'approved' ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">
                {modalT('confirmDeposit', {
                  action: t(`statuses.${actionType}`).toLowerCase()
                })}
              </p>
              <p className="text-2xl font-bold text-white">
                {selectedRequest && formatCurrency(selectedRequest.amount)}
              </p>
            </div>
          </div>

          {selectedRequest?.userId?._id && (
            <WalletStatusCheck userId={selectedRequest.userId._id} />
          )}

          <div className="p-4 rounded-xl bg-background/50 border border-border/50 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t('table.user')}:</span>
              <span className="font-bold text-white">{selectedRequest?.userId?.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t('requestedAt')}:</span>
              <span className="font-medium text-white">{selectedRequest && formatDate(selectedRequest.createdAt)}</span>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground text-center italic">
            {modalT('depositActionNotice', {
              actionEffect: modalT(`actionEffect.${actionType}`)
            })}
          </p>
        </div>
      </Modal>
    </>
  );
}
