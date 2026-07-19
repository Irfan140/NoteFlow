import { Worker } from "bullmq";
import { createRedisConnection } from "../config/redis";
import {
  SUMMARY_QUEUE_NAME,
  type SummaryJobData,
} from "../queues/summary.queue";
import { processSummaryJob } from "../processors/summary.processor";

export const summaryWorker = new Worker<SummaryJobData>(
  SUMMARY_QUEUE_NAME,
  processSummaryJob,
  {
    connection: createRedisConnection(),
    concurrency: 2,
  },
);

summaryWorker.on("completed", (job) => {
  console.log(`Summary job ${job.id} completed`);
});

summaryWorker.on("failed", (job, error) => {
  console.error(`Summary job ${job?.id ?? "unknown"} failed`, error);
});

summaryWorker.on("error", (error) => {
  console.error("Summary worker error", error);
});
