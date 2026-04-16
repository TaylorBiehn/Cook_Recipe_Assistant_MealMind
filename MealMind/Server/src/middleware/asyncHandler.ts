import type { NextFunction, Request, RequestHandler, Response } from "express";

/** Express 4 wrapper so async route errors reach `errorHandler`. */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler {
  return (req, res, next) => {
    void fn(req, res, next).catch(next);
  };
}
