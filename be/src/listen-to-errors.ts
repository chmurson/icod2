import type { Logger } from "./logger";

export function startToListenToErrors(logger: Logger) {
  process.on("unhandledRejection", (reason, promise) => {
    logger.error(
      {
        reason,
        promise: promise.toString(),
      },
      "Unhandled Promise Rejection",
    );
  });

  process.on("uncaughtException", (error) => {
    logger.error({ error }, "Uncaught Exception");

    // Clean up and exit - uncaught exceptions are serious
    process.exit(1);
  });

  process.on("warning", (warning) => {
    logger.warn(
      {
        name: warning.name,
        message: warning.message,
        stack: warning.stack,
      },
      "Process Warning",
    );
  });
}
