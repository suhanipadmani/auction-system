import { formatCurrency } from "@/lib/utils";

interface AuctionRulesProps {
  basePrice: number;
  minIncrement: number;
}

export const AuctionRules = ({ basePrice, minIncrement }: AuctionRulesProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Rules</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Base Price</span>
          <span className="text-sm font-bold text-emerald-500">
            {formatCurrency(basePrice)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Min. Increment</span>
          <span className="text-sm font-bold text-primary">
            {formatCurrency(minIncrement)}
          </span>
        </div>
      </div>
    </div>
  );
};
