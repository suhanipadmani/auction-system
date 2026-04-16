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
      if (result.startedCount > 0 || result.endedCount > 0) {
        console.log(`[AUCTION-CRON] Successfully transitioned: ${result.startedCount} started, ${result.endedCount} ended`);
      }
    } catch (error) {
      console.error("[AUCTION-CRON] Error during auto-transition:", error);
    }
  });
};
