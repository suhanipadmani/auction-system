/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Clock, TrendingUp, Zap, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// Hooks
import { useAuctionSocket } from "@/hooks/useAuctionSocket";
import { useBidding } from "@/hooks/useBidding";
import { useAuthStore } from "@/store/auth.store";
import { useBudgets, useAssignAuctionToBudget } from "@/hooks/useBudget";
import { formatCurrency, cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { Progress } from "@/components/ui/Progress";

// Types
import { IAuction } from "@/types/auction";
import { IBiddingSectionProps } from "@/types/components";


export const BiddingSection = ({ auction, socketData }: IBiddingSectionProps) => {

  const user = useAuthStore((state) => state.user);
  const { highestBid, highestBidderId, isPending, placeBid: placeBidSocket } = socketData;
  
  const [bidAmount, setBidAmount] = useState<string>("");
  const [isAutoBid, setIsAutoBid] = useState(false);
  const [autoBidLimit, setAutoBidLimit] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");

  useEffect(() => {
    if (auction.status !== "active" || !auction.endTime) {

      if (auction.status === "ended") setTimeLeft("Auction Ended");
      else if (auction.status === "cancelled") setTimeLeft("Auction Cancelled");
      else if (auction.status === "approved") setTimeLeft("Starting Soon");
      else setTimeLeft("Auction Inactive");
      return;
    }

    const calculateTime = () => {
      const end = new Date(auction.endTime).getTime();
      const now = new Date().getTime();
      const difference = end - now;
      
      if (difference <= 0) {
        return "Auction Ended";
      }

      const seconds = Math.floor((difference / 1000) % 60);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      parts.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      
      return `Ends in ${parts.join(" ")}`;
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

  const { placeBid, isPlacingBid, setupAutoBid, isSettingAutoBid } = useBidding();
  const { data: budgetsResponse } = useBudgets();
  const { mutate: assignToGoal } = useAssignAuctionToBudget();

  const budgets = budgetsResponse?.data || [];
  
  // Robust search for assigned goal (handles both ID strings and populated objects)
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

  // Budget validation logic
  const numericAmount = parseFloat(bidAmount) || 0;
  const isOverBudget = assignedGoal && (assignedGoal.currentExposure + (numericAmount - (isHighestBidder ? currentBid : 0)) > assignedGoal.maxBudget);
  const remainingInGoal = assignedGoal ? assignedGoal.maxBudget - assignedGoal.currentExposure + (isHighestBidder ? currentBid : 0) : 0;
  const exposurePercentage = assignedGoal ? (assignedGoal.currentExposure / assignedGoal.maxBudget) * 100 : 0;

  const handleManualBid = () => {
    if (!user) {
      toast.error("Please login to place a bid");
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount < minRequired) {
      toast.error(`Minimum bid required is ${formatCurrency(minRequired)}`);
      return;
    }

    // Use socket for real-time bid
    placeBidSocket(user._id, amount);
    // Don't clear immediately anymore
  };

  // Effect to clear input only when the bid is confirmed as highest
  useEffect(() => {
    if (isHighestBidder) {
      setBidAmount("");
    }
  }, [isHighestBidder]);

  const handleAutoBidSetup = async () => {
     if (!user) {
        toast.error("Please login to setup auto-bid");
        return;
     }

     const limit = parseFloat(autoBidLimit);
     if (isNaN(limit) || limit <= currentBid) {
        toast.error("Limit must be higher than current bid");
        return;
     }

     setupAutoBid({ auctionId: auction._id, limit }, {
        onSuccess: () => {
           toast.success("Auto-bid setup successfully!");
           setIsAutoBid(false);
           setAutoBidLimit("");
           // Invalidate budgets to refresh exposure bars
           // Since useBidding might not know about budgets
        },
        onError: (err: any) => {
           toast.error(err.response?.data?.message || "Failed to setup auto-bid");
        }
     });
  };

  return (
    <div className="space-y-6">
      {/* Budget Monitor Block */}
      {assignedGoal && user && !isOwner && (
        <Card className="border-white/5 bg-white/5 overflow-hidden animate-in slide-in-from-top-4 duration-500">
           <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Budget Active: {assignedGoal.name}</span>
                 </div>
                 <span className="text-[10px] font-bold text-white/50">{formatCurrency(remainingInGoal)} Left</span>
              </div>
              
              <Progress 
                value={exposurePercentage} 
                indicatorClassName={cn(
                  "bg-indigo-500",
                  exposurePercentage > 90 ? "bg-red-500" : exposurePercentage > 70 ? "bg-amber-500" : "bg-indigo-500"
                )} 
              />
              
              <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-tight text-muted-foreground">
                 <span>{Math.round(exposurePercentage)}% Used</span>
                 <span className={cn(numericAmount > 0 ? "text-indigo-300" : "opacity-0")}>
                    +{formatCurrency(numericAmount - (isHighestBidder ? currentBid : 0))} Exposure Impact
                 </span>
              </div>
           </div>
        </Card>
      )}

      <Card className="border-white/5 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10">

        <CardHeader className="text-center p-8">
          <CardTitle className="text-muted-foreground text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Current Highest Bid
          </CardTitle>
          <div className="mt-4 text-5xl font-black text-white tracking-tighter drop-shadow-2xl animate-in zoom-in-50 duration-500">
            {formatCurrency(currentBid)}
          </div>
          {isHighestBidder && (
            <Badge className="mt-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold px-4 py-1 animate-pulse">
              You are the highest bidder
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

          <div className="space-y-4 pt-2">
            <div className="relative group">
               <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <span className="text-muted-foreground font-bold">₹</span>
               </div>
               <Input
                 type="number"
                 placeholder={`Min. ${minRequired}`}
                 value={bidAmount}
                 onChange={(e) => setBidAmount(e.target.value)}
                 className={cn(
                    "pl-8 h-14 bg-black/40 border-white/10 rounded-xl font-bold focus:ring-indigo-500 focus:border-indigo-500",
                    isOverBudget && "border-red-500 focus:ring-red-500 focus:border-red-500"
                 )}
                 disabled={auction.status !== "active" || isHighestBidder || isOwner}
               />
               {isOverBudget && (
                 <p className="mt-1.5 text-xs font-bold text-red-500 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    Bid exceeds goal budget: {formatCurrency(remainingInGoal)} left
                 </p>
               )}
            </div>

            <Button
              onClick={handleManualBid}
              className={cn(
                "w-full h-14 text-lg font-black shadow-xl rounded-xl transition-all active:scale-95 disabled:opacity-50",
                isOverBudget ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
              )}
              disabled={auction.status !== "active" || isHighestBidder || isOwner || isPending || isOverBudget}
            >
              {isPending ? "Processing..." : isOwner ? "Your Listing" : isHighestBidder ? "Highest Bidder" : isOverBudget ? "Limit Exceeded" : "Place Bid"}
            </Button>
          </div>

          {/* Budget Goal Assignment */}
          {user && !isOwner && (
            <div className="pt-4 border-t border-white/5 space-y-3">
               <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Assign to Goal</Label>
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

                  <option value="" className="bg-slate-900 text-white">No Goal Selected</option>
                  {budgets.map(goal => (
                    <option key={goal._id} value={goal._id} className="bg-slate-900 text-white">
                      {goal.name} ({formatCurrency(goal.maxBudget - goal.currentExposure)} left)
                    </option>
                  ))}
               </select>
               <p className="text-[10px] text-muted-foreground italic">
                  Assigning to a goal helps you stay within your budget across multiple auctions.
               </p>
            </div>
          )}

          {/* Auto Bid Section - Hide for Owner */}
          {!isOwner && (
            <div className="pt-4 border-t border-white/5">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                     <Zap className="w-4 h-4 text-amber-400" />
                     <Label className="text-sm font-bold text-white">Enable Auto-Bid</Label>
                  </div>
                  <Switch 
                    checked={isAutoBid} 
                    onCheckedChange={setIsAutoBid}
                    className="data-[state=checked]:bg-amber-500"
                    disabled={auction.status !== "active" || isHighestBidder}
                  />
               </div>
               
               {isAutoBid && (
                 <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Input
                      type="number"
                      placeholder="Max Limit (e.g. 5000)"
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
                      {isSettingAutoBid ? "Setting up..." : "Setup Auto-Bid"}
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
