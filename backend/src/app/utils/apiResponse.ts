import { Response } from "express";

interface ApiResponse {
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

export const sendSuccess = (
  res: Response, 
  message: string, 
  data: any = null, 
  statusCode: number = 200,
  meta?: ApiResponse["meta"]
) => {
  const response: ApiResponse = {
    success: true,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response, 
  message: string, 
  statusCode: number = 500,
  details?: any
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
  });
};
