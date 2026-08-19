import type { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import { env } from "../config/env";

export interface JwtPayload {
  userId: string;
  email: string;
}

const secret = new TextEncoder().encode(env.JWT_SECRET);

export const jwtAuth = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = header.slice(7);

  try {
    const { payload } = await jwtVerify<JwtPayload>(token, secret);
    (req as any).userId = payload.userId;
    (req as any).userEmail = payload.email;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
