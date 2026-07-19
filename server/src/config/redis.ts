import IORedis from "ioredis";
import { env } from "./env";

export const createRedisConnection = () =>
  new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });
