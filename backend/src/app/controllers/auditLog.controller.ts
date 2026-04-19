import { Request, Response } from "express";
import { AuditLogService } from "../services/auditLog.service";
import { sendSuccess } from "../utils/apiResponse";
import { getPagingMeta } from "../utils/pagination";

/**
 * Fetches audit logs with filtering and pagination (Admin only)
 */
export const getLogs = async (req: Request, res: Response) => {
  const { action, userId, startDate, endDate, search } = req.query;
  const { page, limit } = (req as any).pagination;

  const filters = {
    action,
    userId,
    startDate,
    endDate,
    search
  };

  const result = await AuditLogService.getLogs(filters as any, { page, limit });
  sendSuccess(res, "Audit logs retrieved", result.data, 200, getPagingMeta(result.total, page, limit));
};
