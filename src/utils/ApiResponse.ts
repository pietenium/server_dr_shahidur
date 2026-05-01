import type { Response } from "express";

export class ApiResponse<T> {
  public readonly success = true as const;
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data: T;

  constructor(statusCode: number, message: string, data: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  public send(res: Response): void {
    res.status(this.statusCode).json({
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
    });
  }
}
