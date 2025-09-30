import { loadConfig } from "./config/load-config.js";
import { startToListenToErrors } from "./listen-to-errors.js";
import { getLogger, initializeLogger } from "./logger.js";
import { startLibp2pRelay } from "./start-libp2p-relay.js";
import { StdoutEmitter } from "./utils/stdout-emitter.js";

const { config, sourcePath } = loadConfig();
const { libp2p, logging } = config;

const logger = initializeLogger(logging);
startToListenToErrors(logger);

const stdoutEmitter = new StdoutEmitter();

stdoutEmitter.on("data", (data) => {
  getLogger().info({ data: data.toString() }, "stdout");
});

if (sourcePath) {
  logger.info({ configPath: sourcePath }, "Configuration loaded");
} else {
  logger.warn(
    { searchDirectory: process.cwd() },
    "No configuration file found; using defaults",
  );
}

try {
  startLibp2pRelay({
    announceMultiaddrs: libp2p.announceMultiaddrs,
    listenMultiaddrs: libp2p.listenMultiaddrs,
  });
} catch (error) {
  logger.error({ error }, "Failed to start libp2p relay");
}
