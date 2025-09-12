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

export function loadConfig(): AppConfig {
  const configPaths = [
    join(process.cwd(), "config.local.yaml"),
    join(process.cwd(), "config.local.yml"),
    join(process.cwd(), "config.local.json"),
    join(process.cwd(), "config.yaml"),
    join(process.cwd(), "config.yml"),
    join(process.cwd(), "config.json"),
  ];

  let fileConfig: Partial<AppConfig> = {};

  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      console.log(`Loading config from: ${configPath}`);
      fileConfig = loadFileConfig(configPath);
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
    logging: { ...defaultConfig.logging, ...fileConfig.logging },
  };

  return config;
}
