import http from "http";
import { createExpressApp } from "./loaders/express.loader";
import { dbLoader } from "./loaders/db.loader";
import { socketLoader } from "./loaders/socket.loader";
import { initAuctionCron } from "./app/cron/auction.cron";

export const App = async () => {
  await dbLoader();

  const app = createExpressApp();
  const server = http.createServer(app);
  socketLoader(server);
  
  // Initialize Background Tasks
  initAuctionCron();

  return { app, server };
};
