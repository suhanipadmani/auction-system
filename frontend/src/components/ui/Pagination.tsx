import { Button } from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  showingCount: number;
  onPageChange: (page: number) => void;
  typeLabel?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  showingCount,
  onPageChange,
  typeLabel,
  className
}: PaginationProps) {
  const t = useTranslations("common.pagination");

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between px-6 py-4 bg-black/20 border-t border-white/5 ${className}`}>
      <p className="text-sm text-gray-500">
        {t('showing', { 
            count: showingCount, 
            total: totalItems, 
            type: typeLabel || t('items') 
        })}
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="border-white/10 text-gray-400 h-9"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> {t('previous')}
        </Button>
        <div className="text-sm text-gray-400 px-2 font-medium">
          {t('page', { current: currentPage, total: totalPages })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="border-white/10 text-gray-400 h-9"
        >
          {t('next')} <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
