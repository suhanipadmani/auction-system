"use client";

import Link from "next/link";

// External
import { ChevronLeft } from "lucide-react";

// Utils
import { cn } from "@/lib/utils";

// Components
import { CreateAuctionForm } from "@/components/auctions/CreateAuctionForm";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { buttonVariants } from "@/components/ui/Button";

export default function CreateAuctionPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <DashboardHeader
          userName="New Listing"
          subtitle="Fill in the details to launch your auction."
        />
        <Link
          href="/seller"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "text-muted-foreground hover:text-white"
          )}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="pb-12">
        <CreateAuctionForm />
      </div>
    </div>
  );
}
