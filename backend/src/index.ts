import http from "http";
import { createExpressApp } from "./loaders/express.loader";
import { dbLoader } from "./loaders/db.loader";
import { socketLoader } from "./loaders/socket.loader";
import { initAuctionCron } from "./app/cron/auction.cron";
import { AuctionService } from "./app/services/auction.service";

export const App = async () => {
  await dbLoader();

  const app = createExpressApp();
  const server = http.createServer(app);
  socketLoader(server);
  
  // Initialize Background Tasks
  initAuctionCron();

  // Sync bid counts on startup to resolve any discrepancies
  AuctionService.syncAllBidCounts().catch(err => console.error("[SYNC] Startup bid count sync failed:", err));

  return { app, server };
};
