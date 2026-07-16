import { z } from "zod";

export const summarizeRequestSchema = z.object({
  content: z.string().trim().min(10, "Content is too short to summarize"),
});

export const summarizeResponseSchema = z.object({
  summary: z.string().trim().min(1),
});

export type SummarizeRequest = z.infer<typeof summarizeRequestSchema>;
export type SummarizeResponse = z.infer<typeof summarizeResponseSchema>;
