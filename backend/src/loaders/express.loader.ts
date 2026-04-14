import cors from "cors";
import express from "express";
import { env } from "../config";
import { appRouter } from "../app/router";

export const createExpressApp = () => {
  const app = express();

  app.use(cors({ origin: env.frontendUrl }));
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.send("API Running");
  });

  app.use("/api", appRouter);

  return app;
};
