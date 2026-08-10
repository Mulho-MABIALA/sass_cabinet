export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  details?: unknown;
}

export function ok<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}

export function fail(message: string, details?: unknown): ApiError {
  return { success: false, message, details };
}
