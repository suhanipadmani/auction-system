import { Request, Response, NextFunction } from "express";
import { env } from "../../config";

// Utils
import { AppError } from "../utils/AppError";
import { sendError } from "../utils/apiResponse";

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let details = undefined;

  // Handle Specific Mongoose/MongoDB Errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    details = Object.values(err.errors).map((val: any) => val.message);
  } else if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value entered";
    const field = Object.keys(err.keyValue)[0];
    details = { [field]: "Already exists" };
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = `Resource not found with id of ${err.value}`;
  }

  // Log error for developers
  if (env.nodeEnv === "development" || statusCode === 500) {
    console.error(`[ERROR] [${req.method} ${req.url}] : ${err.stack || message}`);
  }

  // In production, don't leak internal error details for 500s
  const cleanMessage = env.nodeEnv === "production" && statusCode === 500 
    ? "Something went wrong on our end" 
    : message;

  sendError(res, cleanMessage, statusCode, details || (env.nodeEnv === "development" ? err.stack : undefined));
};
