"use client";

import { useState } from "react";

import { WALLET_VIEW_TYPES, TRANSACTION_STATUSES } from "@/enums";
import { IAdjustmentData, IDepositRequest, IViewType } from "@/types/wallet";


import { useProcessDeposit, useAdjustBalance } from "@/hooks/useWallet";

// Modular Components
import { WalletHeader } from "@/components/wallet/WalletHeader";
import { WalletStats } from "@/components/wallet/WalletStats";
import { DepositRequestsSection } from "@/components/wallet/DepositRequestsSection";
import { BalanceAdjustmentSection } from "@/components/wallet/BalanceAdjustmentSection";
import { TransactionLogSection } from "@/components/wallet/TransactionLogSection";
import { WalletModals } from "@/components/wallet/WalletModals";

export default function AdminWalletPage() {
  // View State
  const [activeView, setActiveView] = useState<IViewType>(WALLET_VIEW_TYPES.OVERVIEW);

  // Modal State - Deposit Processing
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<IDepositRequest | null>(null);

  const [actionType, setActionType] = useState<TRANSACTION_STATUSES.APPROVED | TRANSACTION_STATUSES.REJECTED>(TRANSACTION_STATUSES.APPROVED);

  // Modal State - Manual Adjustment
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState<boolean>(false);
  const [adjustmentData, setAdjustmentData] = useState<IAdjustmentData | null>(null);


  // Mutations
  const processDeposit = useProcessDeposit();
  const adjustBalance = useAdjustBalance();

  // Handlers
  const handleOpenDepositModal = (req: IDepositRequest, type: TRANSACTION_STATUSES.APPROVED | TRANSACTION_STATUSES.REJECTED) => {

    setSelectedRequest(req);
    setActionType(type);
    setIsDepositModalOpen(true);
  };

  const handleProcessDeposit = (requestId: string, status: TRANSACTION_STATUSES.APPROVED | TRANSACTION_STATUSES.REJECTED) => {
    processDeposit.mutate({ requestId, status }, {
      onSuccess: () => {
        setIsDepositModalOpen(false);
        setSelectedRequest(null);
      }
    });
  };

  const handleOpenAdjustModal = (data: any) => {
    setAdjustmentData(data);
    setIsAdjustModalOpen(true);
  };

  const handleConfirmAdjustment = () => {
    if (!adjustmentData) return;
    adjustBalance.mutate({
      userId: adjustmentData.userId,
      amount: adjustmentData.amount,
      type: adjustmentData.type,
      note: adjustmentData.note
    }, {
      onSuccess: () => {
        setIsAdjustModalOpen(false);
        setAdjustmentData(null);
      }
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header & Navigation */}
      <WalletHeader 
        activeView={activeView} 
        onViewChange={setActiveView} 
      />

      {/* Quick Stats Summary */}
      <WalletStats />

      {/* Main Content Area */}
      {activeView === WALLET_VIEW_TYPES.OVERVIEW && (
        <DepositRequestsSection 
          onProcessClick={handleOpenDepositModal} 
          processingId={selectedRequest?._id}
        />
      )}

      {activeView === WALLET_VIEW_TYPES.MANUAL && (
        <BalanceAdjustmentSection 
          onReviewClick={handleOpenAdjustModal}
          isAdjusting={adjustBalance.isPending}
        />
      )}

      {activeView === WALLET_VIEW_TYPES.HISTORY && (
        <TransactionLogSection />
      )}

      {/* Shared Confirmation Modals */}
      <WalletModals 
        // Adjustment
        isAdjustmentOpen={isAdjustModalOpen}
        onAdjustmentClose={() => setIsAdjustModalOpen(false)}
        adjustmentData={adjustmentData}
        onAdjustmentConfirm={handleConfirmAdjustment}
        isAdjusting={adjustBalance.isPending}
        
        // Deposit
        isDepositOpen={isDepositModalOpen}
        onDepositClose={() => setIsDepositModalOpen(false)}
        selectedRequest={selectedRequest}
        actionType={actionType}
        onDepositConfirm={handleProcessDeposit}
        isProcessing={processDeposit.isPending}
      />
    </div>
  );
}
