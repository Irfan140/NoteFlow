import { z } from "zod";

const emailSchema = z.string().trim().email("Enter a valid email address");

const passwordSchema = z.string().min(1, "Password is required");

const verificationCodeSchema = z
  .string()
  .trim()
  .min(1, "Verification code is required");

export const signInSchema = z.object({
  emailAddress: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = signInSchema;

export const verificationCodeSchemaForm = z.object({
  code: verificationCodeSchema,
});
