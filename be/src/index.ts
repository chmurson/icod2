import { loadConfig } from "./config/load-config.js";
import { startLibp2pRelay } from "./start-libp2p-relay.js";

const { libp2p } = loadConfig();

startLibp2pRelay({
  announceMultiaddrs: libp2p.announceMultiaddrs,
  listenMultiaddrs: libp2p.listenMultiaddrs,
});
