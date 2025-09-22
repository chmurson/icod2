import type { Libp2p } from "@libp2p/interface";
import { byteStream } from "it-byte-stream";
import { toString as u8ToString } from "uint8arrays";

export function registerProtoHandle(
  protocol: string,
  libp2p: Libp2p,
  onMessage: (message: string, peerIdStr: string) => void,
) {
  return libp2p.handle(protocol, async ({ stream, connection }) => {
    const chatStream = byteStream(stream);

    while (true) {
      const buf = await chatStream.read();
      if (!buf) break;
      const message = u8ToString(buf.subarray());
      onMessage(message, connection.remotePeer.toString());
    }
  });
}
