import { Button } from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { IPaginationProps } from "@/types/components";

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  showingCount,
  onPageChange,
  typeLabel,
  className
}: IPaginationProps) {
  const t = useTranslations("common.pagination");

  if (totalPages <= 1) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 bg-muted/20 border-t border-border gap-4 sm:gap-0 ${className}`}>
      <p className="text-sm text-muted-foreground order-2 sm:order-1">
        {t('showing', { 
            count: showingCount, 
            total: totalItems, 
            type: typeLabel || t('items') 
        })}
      </p>
      <div className="flex items-center gap-2 sm:gap-3 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="border-border/60 text-muted-foreground h-9 hover:bg-white/5"
        >
          <ChevronLeft className="w-4 h-4 sm:mr-1" /> 
          <span className="hidden sm:inline">{t('previous')}</span>
        </Button>
        <div className="text-sm text-muted-foreground px-1 sm:px-2 font-medium min-w-[5rem] text-center">
          {t('page', { current: currentPage, total: totalPages })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="border-border/60 text-muted-foreground h-9 hover:bg-white/5"
        >
          <span className="hidden sm:inline">{t('next')}</span> 
          <ChevronRight className="w-4 h-4 sm:ml-1" />
        </Button>
      </div>
    </div>
  );
}
