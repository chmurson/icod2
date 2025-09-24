import pino, { type Logger as PinoLogger } from "pino";
import type { LoggingConfig } from "./config/types.js";

type ResolvedAxiomConfig = {
  dataset: string;
  token: string;
  orgId?: string;
  url?: string;
};

let loggerInstance: PinoLogger | undefined;

export type Logger = PinoLogger;

export function initializeLogger(logging: LoggingConfig): Logger {
  if (loggerInstance) {
    return loggerInstance;
  }

  loggerInstance = createLogger(logging);
  return loggerInstance;
}

export function getLogger(): Logger {
  if (!loggerInstance) {
    throw new Error(
      "Logger has not been initialized. Call initializeLogger() first.",
    );
  }

  return loggerInstance;
}

function createLogger(logging: LoggingConfig): Logger {
  const level = logging.level ?? "info";
  const axiomConfig = resolveAxiomConfig(logging);

  if (!axiomConfig) {
    return pino({ level });
  }

  const transport = pino.transport<Record<string, unknown>>({
    targets: [
      {
        target: "pino/file",
        options: { destination: 1 },
        level,
      },
      {
        target: "@axiomhq/pino",
        options: axiomConfig,
        level,
      },
    ],
  });

  return pino({ level }, transport);
}

function resolveAxiomConfig(
  logging: LoggingConfig,
): ResolvedAxiomConfig | undefined {
  const axiom = logging.axiom ?? {};

  const dataset = axiom.dataset ?? process.env.AXIOM_DATASET;
  const token = axiom.token ?? process.env.AXIOM_TOKEN;
  const orgId = axiom.orgId ?? process.env.AXIOM_ORG_ID;
  const url = axiom.url ?? process.env.AXIOM_URL;
  const enabled =
    typeof axiom.enabled === "boolean"
      ? axiom.enabled
      : Boolean(dataset && token);

  if (!enabled) {
    return undefined;
  }

  if (!dataset || !token) {
    console.warn(
      "Axiom logging is enabled but AXIOM_DATASET or AXIOM_TOKEN are missing. Disabling Axiom transport.",
    );
    return undefined;
  }

  return { dataset, token, orgId, url };
}
