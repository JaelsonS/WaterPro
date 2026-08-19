export type HttpErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "MFA_ENROLLMENT_REQUIRED"
  | "MFA_STEP_UP_REQUIRED"
  | "INTERNAL_ERROR";

export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly code: HttpErrorCode;

  constructor(params: { statusCode: number; code: HttpErrorCode; message: string }) {
    super(params.message);
    this.statusCode = params.statusCode;
    this.code = params.code;
  }
}

