import { useCurrency } from "@/hooks/useCurrency";
import { useTranslations } from "next-intl";

import { IAuctionRulesProps } from "@/types/components";


export const AuctionRules = ({ basePrice, minIncrement }: IAuctionRulesProps) => {
  const { formatCurrency } = useCurrency();
  const t = useTranslations("auction.details");
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">{t('rules')}</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t('basePrice')}</span>
          <span className="text-sm font-bold text-emerald-500">
            {formatCurrency(basePrice)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t('minIncrement')}</span>
          <span className="text-sm font-bold text-primary">
            {formatCurrency(minIncrement)}
          </span>
        </div>
      </div>
    </div>
  );
};
