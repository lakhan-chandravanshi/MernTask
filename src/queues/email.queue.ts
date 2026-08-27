import { Queue } from "bullmq";
import { env } from "../config/env";

export const emailQueue = new Queue(
  "email-queue",
  {
    connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT
    }
  }
);

export async function addWelcomeEmailJob(
  email: string,
  name: string
) {
  await emailQueue.add(
    "welcome-email",
    {
      email,
      name
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000
      },
      removeOnComplete: true,
      removeOnFail: false
    }
  );
}