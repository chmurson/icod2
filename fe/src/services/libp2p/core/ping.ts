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

  const peerId = peerMultiaddr[0]
    ?.getComponents()
    .filter((x) => x.name === "p2p")
    .at(-1);

  if (!peerId) {
    loggerGate.canWarn && console.warn("Peer ID not found");
  }

  loggerGate.canLog && console.log(`Starting to ping peer ${peerId}`);

  await ping(libp2p as LocalLibp2p, peerMultiaddr);
}

async function ping(libp2p: LocalLibp2p, peerMultiaddr: Multiaddr[]) {
  while (true) {
    loggerGate.canLog &&
      console.log(`Sending ping to peer with ${peerMultiaddr}`);
    try {
      const result = await libp2p.services.ping.ping(peerMultiaddr);
      loggerGate.canLog && console.log(` ${peerMultiaddr}`, result);
      await new Promise((resolve) => setTimeout(resolve, timeout));
    } catch (error) {
      loggerGate.canLog &&
        console.error(`Error pinging peer ${peerMultiaddr}`, error);

      return; // end while loop
    }
  }
}
