import { z } from "zod";

export const noteSchema = z.object({
  id: z.string().trim().min(1, "Note id is required"),
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Content is required"),
});

export const notesSchema = z.array(noteSchema);

export const noteInputSchema = noteSchema.omit({ id: true });

export const summaryJobResponseSchema = z.object({
  jobId: z.string().min(1),
  status: z.literal("queued"),
});

export const summaryStatusResponseSchema = z.object({
  jobId: z.string().min(1),
  status: z.enum(["queued", "processing", "completed", "failed"]),
  summary: z.string().trim().min(1).nullable().optional(),
  error: z.string().optional(),
});

export const routeIdSchema = z
  .union([z.string(), z.array(z.string())])
  .transform((value) => (Array.isArray(value) ? value[0] : value))
  .pipe(z.string().trim().min(1, "Missing note id"));

export type Note = z.infer<typeof noteSchema>;
export type NoteInput = z.infer<typeof noteInputSchema>;
