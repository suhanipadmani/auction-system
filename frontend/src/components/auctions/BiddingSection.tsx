"use client";

import { useState, useEffect } from "react";
import { Clock, TrendingUp, Zap, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// Hooks
import { useBidding } from "@/hooks/useBidding";
import { useBidStatus } from "@/hooks/useAuction";
import { useAuthStore } from "@/store/auth.store";
import { useBudgets, useAssignAuctionToBudget } from "@/hooks/useBudget";
import { useCurrency } from "@/hooks/useCurrency";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { Progress } from "@/components/ui/Progress";

// Types
import { IBiddingSectionProps } from "@/types/components";


export const BiddingSection = ({ auction, socketData }: IBiddingSectionProps) => {
  const { formatCurrency, symbol, convertAmount, convertBack } = useCurrency();
  const t = useTranslations("auction.bidding");
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";
  const { highestBid, highestBidderId, isPending, placeBid: placeBidSocket } = socketData;

  const [bidAmount, setBidAmount] = useState<string>("");
  const [isAutoBid, setIsAutoBid] = useState<boolean>(false);
  const [autoBidLimit, setAutoBidLimit] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");

  useEffect(() => {
    if (auction.status !== "active" || !auction.endTime) {

      if (auction.status === "ended") setTimeLeft(t("timer.ended"));
      else if (auction.status === "cancelled") setTimeLeft(t("timer.cancelled"));
      else if (auction.status === "approved") setTimeLeft(t("timer.startingSoon"));
      else setTimeLeft(t("timer.inactive"));
      return;
    }

    const calculateTime = () => {
      const end = new Date(auction.endTime).getTime();
      const now = new Date().getTime();
      const difference = end - now;

      if (difference <= 0) {
        return t("timer.ended");
      }

      const seconds = Math.floor((difference / 1000) % 60);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));

      const parts = [];
      if (days > 0) parts.push(t("timer.days", { count: days }));
      parts.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

      return t("timer.endsIn", { time: parts.join(" ") });
    };

    setTimeLeft(calculateTime());
    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [auction.endTime, auction.status]);

  const currentBid = highestBid || auction.highestBid || auction.basePrice;
  const bidderId = typeof auction.highestBidderId === 'object' ? auction.highestBidderId?._id : auction.highestBidderId;
  const isHighestBidder = (highestBidderId || bidderId) === user?._id;

  const sellerId = typeof auction.sellerId === 'object' ? auction.sellerId?._id : auction.sellerId;
  const isOwner = sellerId === user?._id;

  const minRequired = currentBid + auction.minIncrement;

  const { setupAutoBid, isSettingAutoBid } = useBidding();
  const { data: statusResponse } = useBidStatus(auction._id as string, !!user);
  const { data: budgetsResponse } = useBudgets();
  const { mutate: assignToGoal } = useAssignAuctionToBudget();

  const userStatus = statusResponse?.data;
  const budgets = budgetsResponse?.data || [];

  const assignedGoal = budgets.find(b =>
    b.auctionIds.some((id: any) => (typeof id === 'string' ? id : id._id) === auction._id)
  );

  // Sync local state with API data
  useEffect(() => {
    if (assignedGoal) {
      setSelectedGoalId(assignedGoal._id);
    } else {
      setSelectedGoalId("");
    }
  }, [assignedGoal]);

  // Budget validation 
  const numericAmount = parseFloat(bidAmount) || 0;
  const isOverBudget = assignedGoal && (assignedGoal.currentExposure + (numericAmount - (isHighestBidder ? currentBid : 0)) > assignedGoal.maxBudget);
  const remainingInGoal = assignedGoal ? assignedGoal.maxBudget - assignedGoal.currentExposure + (isHighestBidder ? currentBid : 0) : 0;
  const exposurePercentage = assignedGoal ? (assignedGoal.currentExposure / assignedGoal.maxBudget) * 100 : 0;

  const handleManualBid = () => {
    if (!user) {
      toast.error(t("participatePrompt"));
      return;
    }

    const amount = parseFloat(bidAmount);
    const amountInBase = convertBack(amount);
    
    if (isNaN(amountInBase) || amountInBase < minRequired) {
      toast.error(t("errors.minBid", { amount: formatCurrency(minRequired) }));
      return;
    }

    // Use socket for real-time bid
    placeBidSocket(amountInBase);
  };

  useEffect(() => {
    if (isHighestBidder) {
      setBidAmount("");
    }
  }, [isHighestBidder]);

  const handleAutoBidSetup = async () => {
    if (!user) {
      toast.error(t("participatePrompt"));
      return;
    }

    const limit = parseFloat(autoBidLimit);
    const limitInBase = convertBack(limit);
    
    if (isNaN(limitInBase) || limitInBase <= currentBid) {
      toast.error(t("limitExceeded"));
      return;
    }

    setupAutoBid({ auctionId: auction._id, limit: limitInBase }, {
      onSuccess: () => {
        toast.success(t("setupAutoBid"));
        setIsAutoBid(false);
        setAutoBidLimit("");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || t("errors.autoBidFailed"));
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Budget Monitor Block - Hide for Admin */}
      {assignedGoal && user && !isOwner && !isAdmin && (
        <Card className="border-white/5 bg-white/5 overflow-hidden animate-in slide-in-from-top-4 duration-500">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{t("budgetActive", { name: assignedGoal.name })}</span>
              </div>
              <span className="text-[10px] font-bold text-white/50">{formatCurrency(remainingInGoal)} {t("left")}</span>
            </div>

            <Progress
              value={exposurePercentage}
              indicatorClassName={cn(
                "bg-indigo-500",
                exposurePercentage > 90 ? "bg-red-500" : exposurePercentage > 70 ? "bg-amber-500" : "bg-indigo-500"
              )}
            />

            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-tight text-muted-foreground">
              <span>{Math.round(exposurePercentage)}% {t("used")}</span>
              <span className={cn(numericAmount > 0 ? "text-indigo-300" : "opacity-0")}>
                +{formatCurrency(numericAmount - (isHighestBidder ? currentBid : 0))} {t("exposureImpact")}
              </span>
            </div>
          </div>
        </Card>
      )}

      <Card className="border-white/5 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10">

        <CardHeader className="text-center p-8">
          <CardTitle className="text-muted-foreground text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            {t("currentHighestBid")}
          </CardTitle>
          <div className="mt-4 text-5xl font-black text-white tracking-tighter drop-shadow-2xl animate-in zoom-in-50 duration-500">
            {formatCurrency(currentBid)}
          </div>
          {isHighestBidder && !isAdmin && (
            <Badge className="mt-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold px-4 py-1 animate-pulse">
              {t("highestBidder")}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="p-8 pt-0 space-y-6">
          <div className="flex items-center justify-center gap-3 py-3 px-4 bg-white/5 rounded-2xl border border-white/10 group transition-colors hover:bg-white/10">
            <Clock className="w-5 h-5 text-indigo-400 group-hover:animate-spin-slow" />
            <span className="text-sm font-bold text-indigo-200">
              {timeLeft}
            </span>
          </div>

          {user ? (
            !isAdmin && !isOwner && (
              <>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <span className="text-muted-foreground font-bold">{symbol}</span>
                  </div>
                  <Input
                    type="number"
                    placeholder={`Min. ${convertAmount(minRequired).toFixed(2)}`}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className={cn(
                      "pl-8 h-14 bg-black/40 border-white/10 rounded-xl font-bold focus:ring-indigo-500 focus:border-indigo-500",
                      isOverBudget && "border-red-500 focus:ring-red-500 focus:border-red-500"
                    )}
                    disabled={auction.status !== "active" || isHighestBidder}
                  />
                  {isOverBudget && (
                    <p className="mt-1.5 text-xs font-bold text-red-500 flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3 h-3" />
                      {t("bidExceedsBudget", { amount: formatCurrency(remainingInGoal) })}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleManualBid}
                  className={cn(
                    "w-full h-14 text-lg font-black shadow-xl rounded-xl transition-all active:scale-95 disabled:opacity-50",
                    isOverBudget ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
                  )}
                  disabled={auction.status !== "active" || isHighestBidder || isPending || isOverBudget}
                >
                  {isPending ? t("processing") : isHighestBidder ? t("highestBidder") : isOverBudget ? t("limitExceeded") : t("placeBid")}
                </Button>
              </>
            )
          ) : (
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center space-y-4">
              <p className="text-sm font-medium text-muted-foreground">
                {t("participatePrompt")}
              </p>
              <Button
                variant="default"
                className="w-full h-12 font-bold"
                onClick={() => window.location.href = '/login'}
              >
                {t("signInToBid")}
              </Button>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                {t("registrationRequired")}
              </p>
            </div>
          )}

          {/* Budget Goal Assignment - Hide for Admin */}
          {user && !isOwner && !isAdmin && (
            <div className="pt-4 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("assignToGoal")}</Label>
                {assignedGoal && (
                  <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                    Tracking
                  </Badge>
                )}
              </div>
              <select
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-primary transition-colors cursor-pointer"
                value={selectedGoalId}
                onChange={(e) => {
                  const newGoalId = e.target.value;
                  setSelectedGoalId(newGoalId);
                  assignToGoal({ goalId: newGoalId, auctionId: auction._id });
                }}
              >

                <option value="" className="bg-slate-900 text-white">{t("noGoalSelected")}</option>
                {budgets.map(goal => (
                  <option key={goal._id} value={goal._id} className="bg-slate-900 text-white">
                    {goal.name} ({formatCurrency(goal.maxBudget - goal.currentExposure)} {t("left")})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground italic">
                {t("goalTrackingDesc")}
              </p>
            </div>
          )}

          {/* Auto Bid Section - Hide for Admin, Owner and Guests */}
          {!isOwner && user && !isAdmin && (
            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <Label className="text-sm font-bold text-white">{t("enableAutoBid")}</Label>
                </div>
                <Switch
                  checked={isAutoBid}
                  onCheckedChange={setIsAutoBid}
                  className="data-[state=checked]:bg-amber-500"
                  disabled={auction.status !== "active" || isHighestBidder}
                />
              </div>

              {userStatus?.autoBidLimit && !isAutoBid && (
                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">{t("activeAutoBid")}</span>
                  <span className="text-xs font-black text-white">{formatCurrency(userStatus.autoBidLimit)}</span>
                </div>
              )}

              {isAutoBid && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Input
                    type="number"
                    placeholder={t("maxLimit")}
                    value={autoBidLimit}
                    onChange={(e) => setAutoBidLimit(e.target.value)}
                    className="h-12 bg-black/40 border-white/10 rounded-xl font-bold"
                  />
                  <Button
                    variant="outline"
                    className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-white"
                    onClick={handleAutoBidSetup}
                    disabled={isSettingAutoBid}
                  >
                    {isSettingAutoBid ? t("settingUp") : t("setupAutoBid")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
