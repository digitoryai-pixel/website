export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export const badRequest = (code: string, msg: string, details?: unknown) => new AppError(400, code, msg, details);
export const forbidden = (code: string, msg: string) => new AppError(403, code, msg);
export const notFound = (what: string) => new AppError(404, 'NOT_FOUND', `${what} not found`);
export const conflict = (code: string, msg: string, details?: unknown) => new AppError(409, code, msg, details);

export function assert(cond: unknown, err: AppError): asserts cond {
  if (!cond) throw err;
}
