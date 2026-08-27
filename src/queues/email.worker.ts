import { Worker } from "bullmq";
import { env } from "../config/env";
import { sendWelcomeEmail } from "../services/email.service";

const worker = new Worker(
  "email-queue",

  async (job) => {
    console.log(
      `Processing email job: ${job.id}`
    );

    if (job.name === "welcome-email") {
      await sendWelcomeEmail(
        job.data.email,
        job.data.name
      );
    }
  },

  {
    connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT
    }
  }
);

worker.on("completed", (job) => {
  console.log(
    `Email job ${job.id} completed`
  );
});

worker.on("failed", (job, error) => {
  console.error(
    `Email job ${job?.id} failed`,
    error
  );
});

console.log("Email worker started");