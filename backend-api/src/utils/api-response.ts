import { Response } from 'express';

interface SuccessEnvelope<T> {
  success: true;
  message: string;
  data: T;
  requestId?: string;
}

interface ErrorEnvelope {
  success: false;
  message: string;
  errors?: unknown;
  requestId?: string;
}

export const sendSuccess = <T>(res: Response, statusCode: number, message: string, data: T): Response => {
  const body: SuccessEnvelope<T> = {
    success: true,
    message,
    data,
    requestId: res.locals.requestId as string | undefined
  };

  return res.status(statusCode).json(body);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown
): Response => {
  const body: ErrorEnvelope = {
    success: false,
    message,
    errors,
    requestId: res.locals.requestId as string | undefined
  };

  return res.status(statusCode).json(body);
};
