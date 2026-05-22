import helmet from "helmet";
import cors from "cors";
import express from "express";
import { env } from "../config";
import { appRouter } from "../app/router";
import { errorMiddleware } from "../app/middleware/error.middleware";

export const createExpressApp = () => {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: env.frontendUrl }));
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.send("API Running");
  });

  app.use("/api", appRouter);

  // Global Error Handler
  app.use(errorMiddleware);

  return app;
};
