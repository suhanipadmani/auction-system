import { useTranslations, useFormatter } from "next-intl";

import { IAuctionTimelineProps } from "@/types/components";


export const AuctionTimeline = ({ startTime, endTime }: IAuctionTimelineProps) => {
  const t = useTranslations("auction.details");
  const format = useFormatter();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">{t('timeline')}</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t('startTime')}</span>
          <span className="text-sm font-medium text-white">
            {format.dateTime(new Date(startTime), { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t('endTime')}</span>
          <span className="text-sm font-medium text-white">
            {format.dateTime(new Date(endTime), { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>
      </div>
    </div>
  );
};
