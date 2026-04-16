import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { config } from "../config.js";

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
  };
};

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "HttpError";
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  const body: ApiErrorBody = {
    error: {
      code: "NOT_FOUND",
      message: "Resource not found",
    },
  };
  res.status(404).json(body);
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (res.headersSent) return;

  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join(".") || "(root)"}: ${e.message}`).join("; ");
    const body: ApiErrorBody = {
      error: {
        code: "VALIDATION_ERROR",
        message: message || "Validation failed",
      },
    };
    res.status(400).json(body);
    return;
  }

  if (err instanceof HttpError) {
    const body: ApiErrorBody = {
      error: { code: err.code, message: err.message },
    };
    res.status(err.status).json(body);
    return;
  }

  const message = err instanceof Error ? err.message : "Unexpected error";
  const body: ApiErrorBody = {
    error: {
      code: "INTERNAL_ERROR",
      message: config.nodeEnv === "production" ? "Internal server error" : message,
    },
  };
  if (config.nodeEnv !== "production") console.error(err);
  else if (err instanceof Error) console.error(err.stack ?? err.message);
  res.status(500).json(body);
}
