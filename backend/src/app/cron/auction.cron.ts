import cron from "node-cron";

// Services
import { AuctionService } from "../services/auction.service";

/**
 * Scheduled task to transition auction statuses
 * Runs every minute
 */
export const initAuctionCron = () => {
  // Run every 10 seconds to ensure real-time status transitions
  cron.schedule("*/10 * * * * *", async () => {
    try {
      const result = await AuctionService.autoTransition();
      // 2. Auto-finalize auctions older than 24h
      await AuctionService.autoFinalizeEndedAuctions();
    } catch (error) {
      console.error("[AUCTION-CRON] Error during auto-transition:", error);
    }
  });
};
