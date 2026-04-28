"use client";

import Link from "next/link";

// External
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

// Components
import { CreateAuctionForm } from "@/components/auctions/CreateAuctionForm";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { buttonVariants } from "@/components/ui/Button";

export default function CreateAuctionPage() {
  const t = useTranslations("auction.create");

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <DashboardHeader
          title={t("title")}
          subtitle={t("subtitle")}
        />
        <Link
          href="/seller"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "text-muted-foreground hover:text-white"
          )}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t("backToDashboard")}
        </Link>
      </div>

      <div className="pb-12">
        <CreateAuctionForm />
      </div>
    </div>
  );
}
