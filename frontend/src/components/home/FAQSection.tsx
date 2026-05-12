"use client";

import { MessageCircleQuestion } from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import { AccordionItem } from "@/types/components";


const FAQ_ITEMS: AccordionItem[] = [
  {
    id: "how-bidding-works",
    question: "How does bidding work on this platform?",
    answer:
      "Placing a bid is simple: browse any active auction, enter your desired bid amount (which must exceed the current highest bid by at least the minimum increment), and confirm. Your bid is instantly reflected in real time for all participants. If someone outbids you, you'll be notified immediately so you can decide whether to bid again.",
  },
  {
    id: "locked-balance",
    question: "What is a 'locked balance' and why is my money held?",
    answer:
      "When you place a bid, the equivalent amount is temporarily locked in your wallet as a security hold — this ensures the winning bidder can fulfill their payment. Your locked balance is not charged; it simply cannot be used for other bids. It is released immediately if you are outbid or if the auction ends without you winning.",
  },
  {
    id: "outbid",
    question: "What happens when I get outbid?",
    answer:
      "The moment another bidder surpasses your amount, your locked funds are automatically released back to your available wallet balance. You'll receive a real-time notification (and an optional email) letting you know, so you can jump back in with a new bid before the auction closes.",
  },
  {
    id: "payment-deduction",
    question: "When is the payment actually deducted from my wallet?",
    answer:
      "Payment is only deducted at the moment an auction concludes and you are confirmed as the winning bidder. Throughout the auction, your bid amount remains a hold (locked balance). No funds leave your wallet until the final hammer falls in your favor.",
  },
  {
    id: "cancellation-refunds",
    question: "Can an auction be cancelled, and will I get a refund?",
    answer:
      "Auctions may be cancelled by the platform administrator in exceptional circumstances (e.g., item unavailability or policy violations). If an auction you participated in is cancelled, all locked balances are fully released and any deducted amounts are refunded to every bidder's wallet within 24 hours — no action required on your part.",
  },
  {
    id: "real-time-updates",
    question: "How do real-time updates work during an auction?",
    answer:
      "We use WebSocket connections to push live bid updates directly to your browser. You'll see new bids, price changes, and time countdowns refresh without needing to reload the page. In rare cases of connectivity loss, the page will attempt to reconnect automatically and sync any missed events when the connection is restored.",
  },
];

export function FAQSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Ambient glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/4 top-0 size-96 rounded-full bg-primary/10 blur-[120px] opacity-60" />
        <div className="absolute right-1/4 bottom-0 size-96 rounded-full bg-violet-400/10 blur-[120px] opacity-60" />
      </div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-14 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
            <MessageCircleQuestion className="size-3" />
            FAQ
          </div>

          <h2
            id="faq-heading"
            className="text-3xl md:text-5xl font-black tracking-tight text-white"
          >
            Frequently Asked Questions
          </h2>

          <p className="max-w-xl mx-auto text-muted-foreground text-base md:text-lg leading-relaxed">
            Everything you need to know about bidding, payments, and auctions —
            answered in plain language.
          </p>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion items={FAQ_ITEMS} />
        </div>

      </div>
    </section>
  );
}
