export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean = true;
  public readonly errors: Array<{ field?: string; message: string }>;

  constructor(
    statusCode: number,
    message: string,
    errors: Array<{ field?: string; message: string }> = [],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
