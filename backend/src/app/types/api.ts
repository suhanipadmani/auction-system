export interface IApiResponse {
  success: boolean;
  message: string;
  data?: any;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: any;
  };
}
