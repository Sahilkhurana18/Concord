import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

/**
 * Verifies a short-lived token issued by the web app's /api/token endpoint,
 * sent as an Authorization: Bearer header — not a cookie. This sidesteps
 * cross-site cookie restrictions entirely (browsers increasingly block
 * cookies on cross-site requests by default, even with SameSite=None;
 * Secure set), since an explicit header isn't subject to cookie policy.
 */
export function requireUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.API_TOKEN_SECRET ?? "dev-api-token-secret-change-me"
    ) as { sub: string; email: string };

    req.user = { id: decoded.sub, email: decoded.email };
    next();
  } catch {
    res.status(401).json({ error: "Not authenticated" });
  }
}
