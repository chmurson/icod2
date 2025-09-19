import { loggerGate } from "@icod2/protocols";
import { loadConfig } from "./config/load-config.js";
import { startLibp2pRelay } from "./start-libp2p-relay.js";

const { libp2p, logging } = loadConfig();

if (logging) {
  loggerGate.setLevel(logging.level);
}

startLibp2pRelay({
  announceMultiaddrs: libp2p.announceMultiaddrs,
  listenMultiaddrs: libp2p.listenMultiaddrs,
});
