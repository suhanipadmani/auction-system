"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import {
  RefreshCcw,
  Search,
  CheckCircle2,
  Lock,
  ShieldAlert,
  Wallet
} from "lucide-react";
import { useTranslations } from "next-intl";

// Types
import { IBalanceAdjustmentSectionProps } from "@/types/components";
import { TRANSACTION_TYPES } from "@/enums";

// Hooks
import { useUsers } from "@/hooks/useUsers";
import { useUserWallet, useToggleFreeze } from "@/hooks/useWallet";
import { useCurrency } from "@/hooks/useCurrency";

// Components
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Dropdown } from "@/components/ui/Dropdown";

export const BalanceAdjustmentSection = forwardRef(({ onReviewClick, isAdjusting }: IBalanceAdjustmentSectionProps, ref) => {
  const t = useTranslations("wallet");
  const { formatCurrency, convertBack } = useCurrency();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>("");
  const [adjustmentType, setAdjustmentType] = useState<TRANSACTION_TYPES.CREDIT | TRANSACTION_TYPES.DEBIT>(TRANSACTION_TYPES.CREDIT);
  const [adjustmentNote, setAdjustmentNote] = useState<string>("");
  
  const resetForm = () => {
    setSearchTerm("");
    setSelectedUserId("");
    setAdjustmentAmount("");
    setAdjustmentType(TRANSACTION_TYPES.CREDIT);
    setAdjustmentNote("");
  };

  useImperativeHandle(ref, () => ({
    reset: resetForm
  }));

  const { data: usersData } = useUsers();
  const { data: userWalletData, isLoading: isUserWalletLoading } = useUserWallet(selectedUserId);
  const toggleFreeze = useToggleFreeze();

  const selectedUser = usersData?.data?.find((u: any) => u._id === selectedUserId);
  const filteredUsers = usersData?.data?.filter((u: any) =>
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    u.role !== "admin"
  ) || [];

  const handleReview = () => {
    const amount = Number(adjustmentAmount);
    const amountInBase = convertBack(amount);

    onReviewClick({
      userId: selectedUserId,
      amount: amountInBase,
      type: adjustmentType,
      note: adjustmentNote,
      userName: selectedUser?.name || "User"
    });
  };

  return (
    <div className="animate-in slide-in-from-bottom-2 duration-400 max-w-2xl mx-auto w-full">
      <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
        <CardHeader className="border-b border-border/40 pb-4 mb-6">
          <CardTitle className="text-xl font-heading flex items-center gap-2">
            <RefreshCcw className="h-5 w-5 text-indigo-400" />
            {t('balanceAdjustment')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Input
              label={t('searchUser')}
              placeholder={t('searchPlaceholder')}
              icon={<Search className="h-4 w-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              required
            />

            {searchTerm && filteredUsers.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-xl border border-border/50 bg-background/50 p-1">
                {filteredUsers.map((user: any) => (
                  <button
                    key={user._id}
                    className={`w-full p-3 rounded-lg text-left text-sm hover:bg-white/5 transition-colors flex justify-between items-center ${selectedUserId === user._id ? 'bg-primary/20 text-white border border-primary/30' : 'text-muted-foreground'}`}
                    onClick={() => {
                      setSelectedUserId(user._id);
                      setSearchTerm("");
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">{user.name}</span>
                      <span className="text-xs opacity-60">{user.email}</span>
                    </div>
                    {selectedUserId === user._id && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            )}

            {selectedUserId && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between animate-in zoom-in-95 duration-300">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{t('activeUser')}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{selectedUser?.name}</p>
                    {userWalletData?.data?.isFrozen && (
                      <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px] h-5 px-1.5 animate-pulse">
                        <Lock className="h-3 w-3 mr-1" /> {t('frozen')}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{t('currentBalance')}</p>
                  <p className={`text-sm font-bold ${userWalletData?.data?.isFrozen ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isUserWalletLoading ? "..." : formatCurrency(userWalletData?.data?.balance || 0)}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Dropdown
                label={t('type')}
                value={adjustmentType}
                onChange={(val: any) => setAdjustmentType(val)}
                options={[
                  { label: t('creditAdd'), value: "credit" },
                  { label: t('debitRemove'), value: "debit" }
                ]}
                triggerClassName="w-full bg-background/50 h-11"
                required
              />
              <Input
                label={t('amount')}
                type="number"
                placeholder="0.00"
                className="h-11 bg-background/50"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                required
              />
            </div>

            <Input
              label={t('adminNote')}
              placeholder={t('notePlaceholder')}
              className="h-11 bg-background/50"
              value={adjustmentNote}
              onChange={(e) => setAdjustmentNote(e.target.value)}
              required
            />

            <Button
              className="w-full h-12 shadow-lg shadow-primary/20 mt-2"
              disabled={!selectedUserId || !adjustmentAmount || Number(adjustmentAmount) <= 0 || !adjustmentNote.trim() || userWalletData?.data?.isFrozen || isAdjusting}
              onClick={handleReview}
              isLoading={isAdjusting}
            >
              <Wallet className="h-4 w-4 mr-2" />
              {userWalletData?.data?.isFrozen ? t('walletLocked') : t('reviewAdjustment')}
            </Button>
          </div>

          <div className="pt-8 border-t border-border/40">
            <h3 className="text-sm font-bold uppercase tracking-widest text-rose-400 mb-4 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" /> {t('walletSecurity')}
            </h3>
            <div className="p-4 rounded-xl bg-rose-400/5 border border-rose-400/20 mb-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('securityNotice')}
              </p>
            </div>
            <div className="flex gap-4">
              {userWalletData?.data?.isFrozen ? (
                <Button
                  variant="outline"
                  className="flex-1 h-11 text-emerald-400 border-emerald-400/20 hover:bg-emerald-400/10 hover:border-emerald-400/40"
                  onClick={() => selectedUserId && toggleFreeze.mutate({ userId: selectedUserId, isFrozen: false })}
                  disabled={!selectedUserId || toggleFreeze.isPending}
                  isLoading={toggleFreeze.isPending}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  {t('unfreezeWallet')}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="flex-1 h-11 text-rose-400 border-rose-400/20 hover:bg-rose-400/10 hover:border-rose-400/40"
                  onClick={() => selectedUserId && toggleFreeze.mutate({ userId: selectedUserId, isFrozen: true })}
                  disabled={!selectedUserId || toggleFreeze.isPending}
                  isLoading={toggleFreeze.isPending}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {t('freezeWallet')}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

BalanceAdjustmentSection.displayName = "BalanceAdjustmentSection";
