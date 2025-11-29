import type { Logger } from "./logger.js";

export function startToListenToErrors(logger: Logger) {
  process.on("unhandledRejection", (reason, promise) => {
    // Extract more detailed error information
    const errorInfo: {
      promise: string;
      error?: {
        name: string;
        message: string;
        stack?: string;
      };
      reason?: unknown;
    } = {
      promise: promise.toString(),
    };

    if (reason instanceof Error) {
      errorInfo.error = {
        name: reason.name,
        message: reason.message,
        stack: reason.stack,
      };
    } else {
      errorInfo.reason = reason;
    }

    logger.error(errorInfo, "Unhandled Promise Rejection");
  });

  process.on("uncaughtException", (error) => {
    logger.error(
      {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      },
      "Uncaught Exception",
    );

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
