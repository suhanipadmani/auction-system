import { axiosClient } from "@/lib/axios";

import type { IAuditLogFilters, IAuditLogResponse } from "@/types/audit";


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
    return { data: response.data.data, ...response.data.meta };
  }
};

export type { IAuditLogFilters };
