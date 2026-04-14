export type TransactionType = "credit" | "debit" | "lock" | "unlock";
export type TransactionStatus = "success" | "failed" | "pending";
export type TransactionSource = "deposit" | "admin" | "auction" | "manual";

export function useTransactionStatus(type: TransactionType, status: TransactionStatus, source?: TransactionSource) {
  const typeStyles = {
    credit: {
      dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]",
      badge: "text-emerald-400 bg-emerald-400/10",
      text: "text-emerald-400",
      prefix: "+"
    },
    debit: {
      dot: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]",
      badge: "text-rose-400 bg-rose-400/10",
      text: "text-rose-400",
      prefix: "-"
    },
    lock: {
      dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]",
      badge: "text-amber-400 bg-amber-400/10",
      text: "text-rose-400",
      prefix: "-"
    },
    unlock: {
      dot: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]",
      badge: "text-blue-400 bg-blue-400/10",
      text: "text-emerald-400",
      prefix: "+"
    }
  };

  const statusStyles = {
    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
    failed: "bg-rose-500/20 text-rose-400 border-rose-500/20",
    pending: "bg-amber-500/20 text-amber-400 border-amber-500/20"
  };

  const sourceStyles = {
    deposit: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    admin: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    auction: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    manual: "bg-gray-500/10 text-gray-400 border-gray-500/20"
  };

  return {
    typeStyle: typeStyles[type],
    statusStyle: statusStyles[status],
    sourceStyle: sourceStyles[source || "manual"]
  };
}
