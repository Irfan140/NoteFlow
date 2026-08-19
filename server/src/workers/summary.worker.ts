import { Worker } from "bullmq";
import { createRedisConnection } from "../libs/redis";
import { logger } from "../libs/logger";
import { SUMMARY_QUEUE_NAME, type SummaryJobData } from "../queues/summary.queue";
import { processSummaryJob } from "../processors/summary.processor";

export const summaryWorker = new Worker<SummaryJobData>(SUMMARY_QUEUE_NAME, processSummaryJob, {
  connection: createRedisConnection(),
  concurrency: 2,
});

summaryWorker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "Summary job completed");
});

summaryWorker.on("failed", (job, error) => {
  logger.error({ err: error, jobId: job?.id }, "Summary job failed");
});

summaryWorker.on("error", (error) => {
  logger.error({ err: error }, "Summary worker error");
});
