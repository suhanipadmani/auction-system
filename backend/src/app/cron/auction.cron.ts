import cron from "node-cron";

// Services
import { AuctionService } from "../services/auction.service";

/**
 * Scheduled task to transition auction statuses
 * Runs every minute
 */
export const initAuctionCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const result = await AuctionService.autoTransition();
      if (result.startedCount > 0 || result.endedCount > 0 || (result as any).expiredCount > 0) {
        console.log(`[AUCTION-CRON] Successfully transitioned: ${result.startedCount} started, ${result.endedCount} ended, ${(result as any).expiredCount} expired`);
      }

      // 2. Auto-finalize auctions older than 24h
      const finalizedCount = await AuctionService.autoFinalizeEndedAuctions();
      if (finalizedCount > 0) {
        console.log(`[AUCTION-CRON] Auto-finalized ${finalizedCount} auctions`);
      }
    } catch (error) {
      console.error("[AUCTION-CRON] Error during auto-transition:", error);
    }
  });
};
