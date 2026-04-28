import { Check, X as CloseIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";

import { IAdminControlsProps } from "@/types/components";


export const AdminControls = ({ onAction, isProcessing }: IAdminControlsProps) => {
  const t = useTranslations("wallet.table.actions");
  return (
    <div className="flex items-center gap-2 ml-auto">
      <Button 
        size="sm" 
        onClick={() => onAction("approve")}
        disabled={isProcessing}
        className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white h-8 px-2 sm:px-4 font-bold text-xs"
      >
        <Check className="sm:mr-1.5 h-3.5 w-3.5" /> 
        <span className="hidden sm:inline">{t('approve')}</span>
      </Button>
      <Button 
        size="sm" 
        onClick={() => onAction("reject")}
        disabled={isProcessing}
        className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white h-8 px-2 sm:px-4 font-bold text-xs"
      >
        <CloseIcon className="sm:mr-1.5 h-3.5 w-3.5" /> 
        <span className="hidden sm:inline">{t('reject')}</span>
      </Button>
    </div>
  );
};
