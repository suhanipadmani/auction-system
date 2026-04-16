"use client";

import { useState } from "react";

import { IViewType } from "@/types/wallet";


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
  const [activeView, setActiveView] = useState<IViewType>("overview");

  // Modal State - Deposit Processing
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionType, setActionType] = useState<"approved" | "rejected">("approved");

  // Modal State - Manual Adjustment
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState<any>(null);

  // Mutations
  const processDeposit = useProcessDeposit();
  const adjustBalance = useAdjustBalance();

  // Handlers
  const handleOpenDepositModal = (req: any, type: "approved" | "rejected") => {
    setSelectedRequest(req);
    setActionType(type);
    setIsDepositModalOpen(true);
  };

  const handleProcessDeposit = (requestId: string, status: "approved" | "rejected") => {
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
      {activeView === "overview" && (
        <DepositRequestsSection 
          onProcessClick={handleOpenDepositModal} 
          processingId={selectedRequest?._id}
        />
      )}

      {activeView === "manual" && (
        <BalanceAdjustmentSection 
          onReviewClick={handleOpenAdjustModal}
          isAdjusting={adjustBalance.isPending}
        />
      )}

      {activeView === "history" && (
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
