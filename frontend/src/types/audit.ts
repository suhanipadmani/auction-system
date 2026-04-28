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
