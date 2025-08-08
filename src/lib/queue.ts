import { Queue, Worker, QueueEvents, JobsOptions } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379");

export type JobPayload =
  | { kind: "TRANSCRIBE"; sourceId: string; orgId?: string; jobId?: string }
  | { kind: "PROCESS_SOURCE"; sourceId: string; orgId?: string; jobId: string }
  | { kind: "EXPORT_DOCX"; sopId: string; orgId?: string };

export const jobsQueue = new Queue<JobPayload>("jobs", { connection });
export const jobsEvents = new QueueEvents("jobs", { connection });

export const defaultOpts: JobsOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 2000 },
  removeOnComplete: true,
  removeOnFail: false,
};


