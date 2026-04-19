import { axiosClient } from "@/lib/axios";

export interface IAuditLog {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  action: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface IAuditLogResponse {
  success: boolean;
  data: IAuditLog[];
  total: number;
  page: number;
  totalPages: number;
}

export interface IAuditLogFilters {
  action?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const auditApi = {
  getLogs: async (filters: IAuditLogFilters = {}): Promise<IAuditLogResponse> => {
    const params = new URLSearchParams();
    if (filters.action && filters.action !== "all") params.append("action", filters.action);
    if (filters.userId) params.append("userId", filters.userId);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response = await axiosClient.get(`/admin/audit-logs?${params.toString()}`);
    return response.data.data;
  }
};
