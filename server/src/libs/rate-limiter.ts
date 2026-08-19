import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "./redis";

const store = new RedisStore({
  sendCommand: (...args: string[]) => redisClient.call(...args),
  prefix: "rl:",
});

// General rate limiter for all note routes (per IP)
export const notesRateLimiter = rateLimit({
  store,
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// Stricter rate limiter for the summarization endpoint (per authenticated user)
export const summarizeRateLimiter = rateLimit({
  store,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate-limit per authenticated user rather than IP
    return (req as any).userId ?? req.ip ?? "anonymous";
  },
  message: { error: "Too many summarization requests, please try again later." },
});
