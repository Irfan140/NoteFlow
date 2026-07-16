import type { Request, Response, NextFunction } from "express";
import { requireAuth } from "@clerk/express";

export const clerkAuth = requireAuth();

export const attachUserId = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Clerk injects auth object
  const userId = (req as any).auth?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  (req as any).userId = userId;
  next();
};
