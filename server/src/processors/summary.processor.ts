import type { Job } from "bullmq";
import { summarizeContent } from "../services/summarize.service";
import * as noteService from "../services/note.service";
import type { SummaryJobData } from "../queues/summary.queue";

export const processSummaryJob = async (job: Job<SummaryJobData>) => {
  const { noteId, userId, content } = job.data;
  const { summary } = await summarizeContent({ content });

  await noteService.saveSummary(noteId, userId, summary);

  return { noteId, summary };
};
