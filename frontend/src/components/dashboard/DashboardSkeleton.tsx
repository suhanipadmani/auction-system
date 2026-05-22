import { Skeleton } from "@/components/ui/Skeleton";

export function AnalyticsCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function AuctionCardSkeleton() {
  return (
    <div className="rounded-[2.5rem] border border-white/5 bg-white/5 p-5 space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <Skeleton className="h-4 w-16 rounded-lg" />
        <Skeleton className="h-4 w-20 rounded-lg" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-4 w-2/3 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="space-y-2">
          <Skeleton className="h-2 w-12 rounded-lg" />
          <Skeleton className="h-6 w-20 rounded-lg" />
        </div>
        <div className="space-y-2 text-right">
          <Skeleton className="h-2 w-12 rounded-lg ml-auto" />
          <Skeleton className="h-6 w-20 rounded-lg ml-auto" />
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-2xl mt-4" />
    </div>
  );
}

export function QuickActionSkeleton() {
  return (
    <div className="relative p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-white/[0.03] border border-white/[0.08] flex items-start gap-4 sm:gap-5">
      <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl shrink-0" />
      <div className="space-y-2 flex-1 pt-1">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="space-y-2">
            <Skeleton className="h-2 w-16 ml-auto" />
            <Skeleton className="h-3 w-20 ml-auto" />
          </div>
        </div>
      </div>

      {/* Analytics Section Skeleton */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-2 h-8 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <AnalyticsCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-2 h-8 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <QuickActionSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
