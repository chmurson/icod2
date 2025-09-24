import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";
import { isString } from "../utils/typeguards.js";
import { defaultConfig } from "./default-config.js";
import type { AppConfig, LoggingConfig } from "./types.js";

function loadFileConfig(configPath: string): Partial<AppConfig> {
  if (!existsSync(configPath)) {
    return {};
  }

  const content = readFileSync(configPath, "utf8");
  const ext = configPath.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "json":
      return JSON.parse(content);
    case "yaml":
    case "yml":
      return yaml.load(content) as Partial<AppConfig>;
    default:
      throw new Error(`Unsupported config file format: ${ext}`);
  }
}

const configDirPath = process.cwd();

export type LoadConfigResult = {
  config: AppConfig;
  sourcePath?: string;
};

export function loadConfig(): LoadConfigResult {
  const configPath = process.env.CONFIG_PATH;

  const configPaths = [
    configPath &&
      (configPath[0] === "/" ? configPath : join(configDirPath, configPath)),
    join(configDirPath, "config.local.yaml"),
    join(configDirPath, "config.local.yml"),
    join(configDirPath, "config.local.json"),
    join(configDirPath, "config.yaml"),
    join(configDirPath, "config.yml"),
    join(configDirPath, "config.json"),
  ].filter(isString);

  let fileConfig: Partial<AppConfig> = {};
  let sourcePath: string | undefined;

  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      fileConfig = loadFileConfig(configPath);
      sourcePath = configPath;
      break;
    }
  }

  const config: AppConfig = {
    ...defaultConfig,
    libp2p: {
      ...defaultConfig.libp2p,
      ...fileConfig.libp2p,
      listenMultiaddrs:
        fileConfig.libp2p?.listenMultiaddrs ||
        defaultConfig.libp2p.listenMultiaddrs,
      announceMultiaddrs:
        fileConfig.libp2p?.announceMultiaddrs ||
        defaultConfig.libp2p.announceMultiaddrs,
    },
    logging: mergeLogging(defaultConfig.logging, fileConfig.logging),
  };

  return { config, sourcePath };
}

function mergeLogging(
  base: LoggingConfig,
  override?: Partial<LoggingConfig>,
): LoggingConfig {
  const result: LoggingConfig = {
    ...base,
    ...override,
  };

  result.axiom = {
    ...base.axiom,
    ...override?.axiom,
  };

  return result;
}
