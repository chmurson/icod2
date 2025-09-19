import type { AppConfig } from "./types.js";

export const defaultConfig: AppConfig = {
  libp2p: {
    listenMultiaddrs: ["/ip4/0.0.0.0/tcp/8080/ws"],
    announceMultiaddrs: ["/ip4/0.0.0.0/tcp/8080/ws"],
  },
  logging: {
    level: "info",
  },
};
