import IORedis from "ioredis";
import { env } from "../config/env";

export const createRedisConnection = () =>
  new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });
