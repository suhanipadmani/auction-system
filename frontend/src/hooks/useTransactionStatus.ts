import { TransactionType, TransactionStatus, TransactionSource } from "@/types/wallet";
import { getTransactionStyles } from "@/lib/utils/wallet/styles";

export function useTransactionStatus(type: TransactionType, status: TransactionStatus, source?: TransactionSource) {
  return getTransactionStyles(type, status, source);
}

