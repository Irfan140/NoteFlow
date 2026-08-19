import { z } from "zod";

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z
    .string()
    .trim()
    .url("EXPO_PUBLIC_API_URL must be a valid URL"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid environment configuration:\n${message}`);
}

export const env = parsed.data;