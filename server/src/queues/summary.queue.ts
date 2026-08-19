import { Queue } from "bullmq";
import { createRedisConnection } from "../libs/redis";

export const SUMMARY_QUEUE_NAME = "note-summaries";

export type SummaryJobData = {
  noteId: string;
  userId: string;
  content: string;
};

export const summaryQueue = new Queue<SummaryJobData>(SUMMARY_QUEUE_NAME, {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2_000,
    },
    removeOnComplete: {
      age: 60 * 60 * 24,
      count: 1_000,
    },
    removeOnFail: {
      age: 60 * 60 * 24 * 7,
    },
  },
});

export const enqueueSummary = (data: SummaryJobData) =>
  summaryQueue.add("summarize-note", data, {
    jobId: `summary-${data.noteId}-${Date.now()}`,
  });
