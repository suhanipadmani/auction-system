import { useQuery } from "@tanstack/react-query";
import { auditApi, IAuditLogFilters } from "@/api/audit.api";

export const useAuditLogs = (filters: IAuditLogFilters = {}) => {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: () => auditApi.getLogs(filters),
    placeholderData: (previousData) => previousData,
  });
};
