"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Trophy, 
  TrendingUp, 
  Clock, 
  Users, 
  Wallet,
  Hammer,
  Loader2,
  TrophyIcon
} from "lucide-react";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { usePublicStats, useAuctions } from "@/hooks/useAuction";
import { formatCurrency } from "@/lib/utils";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";


function PublicStats() {
  const { data: response, isLoading } = usePublicStats();
  const stats = response?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div className="text-center space-y-2">
        <div className="text-3xl font-black text-white">{formatCurrency(stats?.totalVolume || 0)}</div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">Total Volume</div>
      </div>
      <div className="text-center space-y-2">
        <div className="text-3xl font-black text-white">{stats?.activeAuctions || 0}</div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">Live Auctions</div>
      </div>
      <div className="text-center space-y-2">
        <div className="text-3xl font-black text-white">{stats?.activeBidders || 0}</div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">Active Bidders</div>
      </div>
      <div className="text-center space-y-2">
        <div className="text-3xl font-black text-white">{stats?.totalBids || 0}</div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">Bids Placed</div>
      </div>
    </div>
  );
}

function AuctionSection({ 
  title, 
  subtitle, 
  icon: Icon, 
  filters, 
  limit = 3,
  className 
}: { 
  title: string; 
  subtitle: string; 
  icon: any; 
  filters: any; 
  limit?: number;
  className?: string;
}) {
  const { data: response, isLoading } = useAuctions({ 
    ...filters, 
    limit, 
    status: "active" as any 
  });
  
  const auctions = response?.data || [];
  const skeletonCards = Array(limit).fill(0);

  return (
    <section className={className} id={filters.sortBy || title.toLowerCase().replace(/\s+/g, '-')}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
              <Icon className="size-3" />
              {title}
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">{subtitle}</h2>
          </div>
          <Link href="/auctions">
            <Button variant="outline" className="rounded-full font-bold">
              View All Auctions
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {skeletonCards.map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-[200px] w-full rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : auctions.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
             <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Hammer className="size-8 text-white/20" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">No auctions available</h3>
             <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                We're currently preparing new exclusive items. Check back in a few minutes!
             </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {auctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen selection:bg-primary/20">
      <LandingHeader />

      <main className="flex-grow pt-16">
        {/* HERO SECTION */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full -z-10">
            <div className="absolute top-0 right-1/4 size-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 left-1/4 size-96 bg-violet-400/20 rounded-full blur-[120px] animate-pulse delay-1000" />
          </div>

          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Live bidding now active
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              The Future of <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">
                Precision Bidding
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-muted-foreground text-lg md:text-xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
              Experience the adrenaline of real-time auctions with BidMaster. Secure, 
              transparent, and designed for high-stakes competition.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
              <Link 
                href="/register"
                className="group w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Start Bidding Now
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* INTEGRATED STATS */}
            <div className="mt-20 pt-12 border-t border-white/5 animate-in fade-in slide-in-from-bottom-20 duration-1000">
               <PublicStats />
            </div>
          </div>
        </section>


        {/* DYNAMIC AUCTION SECTIONS */}
        <AuctionSection 
          className="py-24 md:py-32 bg-background relative overflow-hidden"
          title="Trending Now"
          subtitle="Most Active Auctions"
          icon={TrendingUp}
          filters={{ sortBy: "bidCount", sortOrder: "desc" }}
        />

        <AuctionSection 
          className="py-24 md:py-32 bg-muted/20"
          title="Closing Soon"
          subtitle="Last Chance to Bid"
          icon={Clock}
          filters={{ sortBy: "endTime", sortOrder: "asc" }}
        />

        <AuctionSection 
          className="py-24 md:py-32 bg-background"
          title="Newly Listed"
          subtitle="Fresh in the Market"
          icon={Zap}
          filters={{ sortBy: "createdAt", sortOrder: "desc" }}
        />

        {/* CTA SECTION */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto rounded-[3rem] bg-foreground text-background p-12 md:p-20 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 size-64 bg-primary/10 rounded-full blur-[80px]" />
               <div className="absolute bottom-0 left-0 size-64 bg-violet-400/10 rounded-full blur-[80px]" />

               <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to outbid?</h2>
               <p className="text-zinc-400 text-lg md:text-xl mb-12 max-w-xl mx-auto">
                 Join thousands of active bidders and start winning the world's most 
                 exclusive auctions today.
               </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link 
                    href="/register"
                    className="w-full sm:w-auto px-10 py-5 bg-zinc-900 text-white rounded-full font-bold text-lg hover:bg-zinc-800 transition-all hover:scale-105 shadow-xl hover:shadow-primary/20"
                  >
                    Join BidMaster Now
                  </Link>
                  <Link 
                    href="/login"
                    className="w-full sm:w-auto px-10 py-5 border-2 border-zinc-200 text-zinc-900 rounded-full font-bold text-lg hover:bg-zinc-50 hover:border-zinc-300 transition-all hover:scale-105"
                  >
                    Member Sign In
                  </Link>
                </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
