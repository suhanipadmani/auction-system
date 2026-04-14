import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { sendError } from "../utils/apiResponse";

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  let { statusCode, message } = err;

  if (!(err instanceof AppError)) {
    statusCode = 500;
    message = err.message || "Internal Server Error";
    console.error(`[ERROR] ${err.stack || message}`);
  }

  sendError(res, message, statusCode);
};
