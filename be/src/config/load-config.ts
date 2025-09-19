import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";
import { defaultConfig } from "./default-config.js";
import type { AppConfig } from "./types.js";

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

export function loadConfig(): AppConfig {
  const configPaths = [
    join(configDirPath, "config.local.yaml"),
    join(configDirPath, "config.local.yml"),
    join(configDirPath, "config.local.json"),
    join(configDirPath, "config.yaml"),
    join(configDirPath, "config.yml"),
    join(configDirPath, "config.json"),
  ];

  let fileConfig: Partial<AppConfig> = {};
  let configLoadedFromFile = false;

  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      console.log(`Loading config from: ${configPath}`);
      fileConfig = loadFileConfig(configPath);
      configLoadedFromFile = true;
      break;
    }
  }

  if (!configLoadedFromFile) {
    console.log(`No config file found at ${configDirPath}`);
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
    logging: { ...defaultConfig.logging, ...fileConfig.logging },
  };

  return config;
}
