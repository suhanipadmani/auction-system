import { Types } from "mongoose";
import { AuditLogModel } from "../models/auditLog";
import { AUDIT_ACTIONS } from "../enums";

export class AuditLogService {
  /**
   * Creates a new audit log entry.
   * @param userId The ID of the user performing the action (or the admin).
   * @param action The type of action performed.
   * @param metadata Additional context for the action.
   */
  static async log(userId: string | Types.ObjectId, action: AUDIT_ACTIONS, metadata: any = {}) {
    try {
      await AuditLogModel.create({
        userId: new Types.ObjectId(userId),
        action,
        metadata: {
          ...metadata,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("[AUDIT_LOG_SERVICE] Failed to create audit log:", error);
      // We don't throw here to avoid disrupting the main application flow
    }
  }

  /**
   * Fetches audit logs with filtering and pagination.
   */
  static async getLogs(filters: any = {}, options: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters.action) {
      query.action = filters.action;
    }

    if (filters.userId) {
      query.userId = new Types.ObjectId(filters.userId);
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (filters.search) {
      // Searching inside metadata or potentially user name if we joined
      // For now, simple search across action or metadata keys
      query.$or = [
        { "metadata.note": { $regex: filters.search, $options: "i" } },
        { "metadata.targetUserId": { $regex: filters.search, $options: "i" } },
        { "metadata.auctionTitle": { $regex: filters.search, $options: "i" } }
      ];
    }

    const [logs, total] = await Promise.all([
      AuditLogModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email"),
      AuditLogModel.countDocuments(query),
    ]);

    return {
      data: logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
