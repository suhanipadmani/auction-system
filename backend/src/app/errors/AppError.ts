import { IErrorDefinition } from "../types/error";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode?: string;
  public readonly category?: string;

  constructor(message: string, statusCode: number, errorCode?: string, category?: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.category = category;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  static from(def: IErrorDefinition, customMessage?: string): AppError {
    return new AppError(
      customMessage || def.message,
      def.statusCode,
      def.errorCode,
      def.category
    );
  }
}