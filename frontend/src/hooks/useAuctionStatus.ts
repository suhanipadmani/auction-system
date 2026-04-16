import { AuctionStatus } from "@/types/auction";

const statusColors: Record<AuctionStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  approved: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  ended: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  cancelled: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

export function useAuctionStatus(status: AuctionStatus) {
  const colorClass = statusColors[status] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
  const isLive = status === "active";
  const isEnded = status === "ended";
  const isPending = status === "pending";
  
  return {
    colorClass,
    isLive,
    isEnded,
    isPending,
    label: status.charAt(0).toUpperCase() + status.slice(1)
  };
}
