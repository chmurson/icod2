import { loggerGate } from "@icod2/protocols";
import type { Libp2p } from "@libp2p/interface";
import type { Ping } from "@libp2p/ping";
import type { Multiaddr } from "@multiformats/multiaddr";

type LocalLibp2p = Libp2p<{ ping: Ping }>;

const timeout = 5000;

export async function startPing(libp2p: Libp2p, peerMultiaddr: Multiaddr[]) {
  if (!libp2p.services.ping) {
    throw new Error("Ping service is not available");
  }

  await ping(libp2p as LocalLibp2p, peerMultiaddr);
}

async function ping(libp2p: LocalLibp2p, peerMultiaddr: Multiaddr[]) {
  loggerGate.canLog && console.log(`Start ping for peer ${peerMultiaddr}`);
  try {
    const result = await libp2p.services.ping.ping(peerMultiaddr);
    loggerGate.canLog &&
      console.log(`Ring result for peer ${peerMultiaddr}`, result);
    await new Promise((resolve) => setTimeout(resolve, timeout));
    ping(libp2p, peerMultiaddr);
  } catch (error) {
    loggerGate.canLog &&
      console.error(`Error pinging peer ${peerMultiaddr}`, error);
  }
}
