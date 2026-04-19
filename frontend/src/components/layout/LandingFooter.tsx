import Link from "next/link";
import { Hammer, Globe, MessageSquare, Briefcase } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-muted/30 border-t py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary p-1.5 rounded-lg">
                <Hammer className="size-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">BidMaster</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              The next generation of real-time auctions. Transparent, fast, and secure for precision bidding.
            </p>
          </div>

          <div className="md:col-span-2 flex flex-col md:flex-row md:justify-end gap-12 md:gap-24">
            <div>
              <h4 className="font-bold mb-4 text-xs uppercase tracking-widest text-white/50">Marketplace</h4>
              <ul className="space-y-3 text-sm font-semibold">
                <li><Link href="/auctions" className="hover:text-primary transition-colors">Live Auctions</Link></li>
                <li><Link href="/auctions?tab=live" className="hover:text-primary transition-colors">Trending</Link></li>
                <li><Link href="/auctions?tab=upcoming" className="hover:text-primary transition-colors">Upcoming</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-xs uppercase tracking-widest text-white/50">Account</h4>
              <ul className="space-y-3 text-sm font-semibold">
                <li><Link href="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-primary transition-colors">Register</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2026 BidMaster. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
