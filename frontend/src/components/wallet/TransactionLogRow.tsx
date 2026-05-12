"use client";

// Types
import { ITransactionLogRowProps } from "@/types/components";

// Hooks
import { useTransactionStatus } from "@/hooks/useTransactionStatus";
import { useCurrency } from "@/hooks/useCurrency";

// Utils
import { formatDate } from "@/lib/utils";
import { getTranslatedTransactionNote } from "@/lib/utils/wallet/notes";

// Components
import { TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { useTranslations } from "next-intl";

export function TransactionLogRow({ tx }: ITransactionLogRowProps) {
  const t = useTranslations("wallet");
  const { typeStyle, statusStyle, sourceStyle } = useTransactionStatus(
    tx.type as any,
    tx.status as any,
    tx.source as any
  );
  const { formatCurrency, formatRaw } = useCurrency();

  return (
    <TableRow className="border-border/40 hover:bg-white/5 transition-colors">
      <TableCell className="py-4">
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm">{tx.userId?.name}</span>
          <span className="text-xs text-muted-foreground">{tx.userId?.email}</span>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${typeStyle.dot}`} />
          <Badge
            variant="outline"
            className={`capitalize text-[10px] font-bold h-6 border-0 ${typeStyle.badge}`}
          >
            {t(`txTypes.${tx.type}`)}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="py-4 font-bold text-sm">
        <span className={typeStyle.text}>
          {typeStyle.prefix}{formatCurrency(tx.amount)}
        </span>
      </TableCell>
      <TableCell className="py-4">
        <Badge
          variant="outline"
          className={`text-[10px] uppercase font-bold px-2 py-0.5 border shadow-sm ${sourceStyle}`}
        >
          {tx.source ? t(`table.${tx.source.toLowerCase()}`) : t('table.manual')}
        </Badge>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex flex-col gap-1">
          {tx.adminId ? (
            <Badge variant="outline" className="w-fit text-[10px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
              {tx.adminId.name}
            </Badge>
          ) : (
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{t('table.system')}</span>
          )}
          <span className="text-[10px] text-muted-foreground italic truncate max-w-[150px]">
            {getTranslatedTransactionNote(tx.note, tx.referenceId, t)}
          </span>
        </div>
      </TableCell>
      <TableCell className="py-4 text-muted-foreground text-[11px] font-medium">{formatDate(tx.createdAt)}</TableCell>
      <TableCell className="text-right py-4">
        <Badge className={`capitalize text-[10px] h-5 ${statusStyle}`}>
          {t(`statuses.${tx.status}`)}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
