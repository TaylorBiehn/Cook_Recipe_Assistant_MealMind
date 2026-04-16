import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { z, ZodTypeAny } from "zod";

export function validateBody<Schema extends ZodTypeAny>(schema: Schema): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }
    (req as Request & { body: z.output<Schema> }).body = parsed.data;
    next();
  };
}
