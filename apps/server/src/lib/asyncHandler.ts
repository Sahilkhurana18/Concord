import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Express 4 does not automatically catch rejected promises from async
 * route handlers — an unhandled rejection there crashes the whole Node
 * process (Node 15+ terminates on unhandled rejections by default), taking
 * every other in-flight request down with it. Wrapping every handler with
 * this forwards any thrown/rejected error to Express's error-handling
 * middleware instead, so one bad request (a DB hiccup, bad input, etc.)
 * degrades to a single 500 response rather than an outage.
 */
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
