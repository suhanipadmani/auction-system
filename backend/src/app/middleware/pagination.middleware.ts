import { Request, Response, NextFunction } from "express";
import { getPagination } from "../utils/pagination";

/**
 * Middleware that attaches standardized pagination parameters to req.pagination
 */
export const paginationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const pagination = getPagination(req.query);
  (req as any).pagination = pagination;
  next();
};
