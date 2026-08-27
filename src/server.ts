import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { redis } from "./config/redis";

async function startServer() {
  try {
    await prisma.$connect();

    console.log(
      "PostgreSQL connected"
    );

    await redis.ping();

    console.log(
      "Redis connection verified"
    );

    app.listen(
      env.PORT,
      () => {
        console.log(
          `Server running on http://localhost:${env.PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "Failed to start server:",
      error
    );

    process.exit(1);
  }
}

startServer();