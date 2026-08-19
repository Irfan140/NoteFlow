import { clerkClient } from "@clerk/express";
import { prisma } from "../libs/prisma";
import { logger } from "../libs/logger";

export const ensureUserExists = async (req: any, res: any, next: any) => {
  try {
    // Get Clerk userId from authentication middleware
    const userId = req.auth.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No userId found" });
    }

    // Check if user exists in DB
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) return next();

    // Fetch full user info from Clerk backend API
    const clerkUser = await clerkClient.users.getUser(userId);

    const email = clerkUser.emailAddresses[0]?.emailAddress || null;
    const name = clerkUser.firstName;
    const imageUrl = clerkUser.imageUrl;

    // Ensure required fields present
    if (!email) {
      logger.warn({ userId }, "Clerk user has no email");
      return res.status(400).json({ error: "Clerk user has no email address" });
    }

    // Create user in database
    await prisma.user.create({
      data: {
        id: userId,
        email: email,
        name,
        imageUrl,
      },
    });

    next();
  } catch (err) {
    logger.error({ err }, "ensureUserExists middleware failed");
    return res.status(500).json({ error: "ensureUserExists failed" });
  }
};
