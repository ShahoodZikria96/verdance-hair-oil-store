/** Application error carrying an HTTP status and optional field errors. */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: unknown[];
  public readonly isOperational = true;

  constructor(statusCode: number, message: string, errors: unknown[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(msg = 'Bad request', errors: unknown[] = []) {
    return new ApiError(400, msg, errors);
  }
  static unauthorized(msg = 'Authentication required') {
    return new ApiError(401, msg);
  }
  static forbidden(msg = 'You do not have permission to perform this action') {
    return new ApiError(403, msg);
  }
  static notFound(msg = 'Resource not found') {
    return new ApiError(404, msg);
  }
  static conflict(msg = 'Resource already exists') {
    return new ApiError(409, msg);
  }
  static unprocessable(msg = 'Validation failed', errors: unknown[] = []) {
    return new ApiError(422, msg, errors);
  }
  static internal(msg = 'Something went wrong') {
    return new ApiError(500, msg);
  }
}
