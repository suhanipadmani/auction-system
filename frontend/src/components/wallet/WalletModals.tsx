"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useUserWallet } from "@/hooks/useWallet";
import { ShieldAlert, CheckCircle2, XCircle, IndianRupee } from "lucide-react";

interface AdjustmentData {
  userId: string;
  amount: number;
  type: "credit" | "debit";
  note: string;
  userName: string;
}

interface WalletModalsProps {
  // Adjustment Modal
  isAdjustmentOpen: boolean;
  onAdjustmentClose: () => void;
  adjustmentData: AdjustmentData | null;
  onAdjustmentConfirm: () => void;
  isAdjusting: boolean;

  // Deposit Modal
  isDepositOpen: boolean;
  onDepositClose: () => void;
  selectedRequest: any;
  actionType: "approved" | "rejected";
  onDepositConfirm: (id: string, status: "approved" | "rejected") => void;
  isProcessing: boolean;
}

export function WalletStatusCheck({ userId }: { userId: string }) {
  const { data: walletData, isLoading } = useUserWallet(userId);
  
  if (isLoading) return <Skeleton className="h-10 w-full animate-pulse" />;
  if (!walletData?.data?.isFrozen) return null;

  return (
    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 mb-4 animate-in zoom-in-95 duration-300">
      <div className="flex items-center gap-2 text-rose-400 mb-1">
        <ShieldAlert className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-wider">Wallet Frozen</span>
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        This user's wallet is currently locked. Approving this deposit will fail unless you unfreeze the wallet first.
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
}: WalletModalsProps) {
  return (
    <>
      {/* Confirmation Modal */}
      <Modal
        isOpen={isAdjustmentOpen}
        onClose={onAdjustmentClose}
        title="Confirm Adjustment"
        footer={
          <>
            <Button variant="ghost" onClick={onAdjustmentClose}>
              Cancel
            </Button>
            <Button 
              className="bg-indigo-500 hover:bg-indigo-600"
              onClick={onAdjustmentConfirm}
              isLoading={isAdjusting}
            >
              Confirm & Apply
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to {adjustmentData?.type} <span className="text-white font-bold">{formatCurrency(Number(adjustmentData?.amount))}</span> {adjustmentData?.type === 'credit' ? 'to' : 'from'} <span className="text-white font-bold">{adjustmentData?.userName}</span>?
          </p>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Type:</span>
              <span className={`font-bold capitalize ${adjustmentData?.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>{adjustmentData?.type}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-bold text-white">{formatCurrency(Number(adjustmentData?.amount))}</span>
            </div>
            {adjustmentData?.note && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Note:</span>
                <span className="font-medium text-white italic truncate max-w-[200px]">{adjustmentData?.note}</span>
              </div>
            )}
          </div>
          <p className="text-[10px] text-rose-400 flex items-center gap-1 font-medium">
            <ShieldAlert className="h-3 w-3" />
            This action will be permanently logged in the system audit trail.
          </p>
        </div>
      </Modal>

      {/* Deposit Process Confirmation Modal */}
      <Modal
        isOpen={isDepositOpen}
        onClose={onDepositClose}
        title={`${actionType === 'approved' ? 'Approve' : 'Reject'} Deposit Request`}
        footer={
          <>
            <Button variant="ghost" onClick={onDepositClose}>
              Cancel
            </Button>
            <Button 
              className={actionType === 'approved' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}
              onClick={() => onDepositConfirm(selectedRequest?._id, actionType)}
              isLoading={isProcessing}
            >
              Confirm {actionType === 'approved' ? 'Approval' : 'Rejection'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center space-y-3">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${actionType === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {actionType === 'approved' ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">
                Are you sure you want to {actionType} this request of
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
              <span className="text-muted-foreground">User:</span>
              <span className="font-bold text-white">{selectedRequest?.userId?.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Requested At:</span>
              <span className="font-medium text-white">{selectedRequest && formatDate(selectedRequest.createdAt)}</span>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground text-center italic">
            This action will {actionType === 'approved' ? 'add balance to' : 'notify'} the user and cannot be undone.
          </p>
        </div>
      </Modal>
    </>
  );
}
