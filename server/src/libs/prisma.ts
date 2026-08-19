import { PrismaClient } from "../../generated/client/index";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env.ts";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

export const prisma = new PrismaClient({
  adapter,
});
