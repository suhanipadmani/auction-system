import http from "http";
import { createExpressApp } from "./loaders/express.loader";
import { dbLoader } from "./loaders/db.loader";
import { socketLoader } from "./loaders/socket.loader";

export const App = async () => {
  await dbLoader();

  const app = createExpressApp();
  const server = http.createServer(app);
  socketLoader(server);

  return { app, server };
};
