import { format } from "date-fns";

interface AuctionTimelineProps {
  startTime: string;
  endTime: string;
}

export const AuctionTimeline = ({ startTime, endTime }: AuctionTimelineProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Timeline</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Start Time</span>
          <span className="text-sm font-medium text-white">
            {format(new Date(startTime), "PPP h:mm a")}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">End Time</span>
          <span className="text-sm font-medium text-white">
            {format(new Date(endTime), "PPP h:mm a")}
          </span>
        </div>
      </div>
    </div>
  );
};
