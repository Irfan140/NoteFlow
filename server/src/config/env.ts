import { config } from "dotenv";
import { z } from "zod";

config({
  path: `.env.${process.env.NODE_ENV ?? "development"}`,
});

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().default(5000),

  DATABASE_URL: z.string().url(),

  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_PUBLISHABLE_KEY: z.string().min(1),

  GROQ_API_KEY: z.string().min(1),

  REDIS_URL: z.string().url().default("redis://localhost:6379"),

  LANGSMITH_TRACING: z
    .string()
    .optional()
    .default("false")
    .transform((value) => value.toLowerCase() === "true"),
  LANGSMITH_ENDPOINT: z
    .string()
    .url()
    .default("https://api.smith.langchain.com"),
  LANGSMITH_API_KEY: z.string().min(1).optional(),
  LANGSMITH_PROJECT: z.string().min(1).default("NoteFlow"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
