import { Response } from "express";

import { ApiResponse } from "../types/api";


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
