import type { Libp2p, PeerId, Stream } from "@libp2p/interface";
import { peerIdFromString } from "@libp2p/peer-id";
import { byteStream } from "it-byte-stream";
import {
  fromString as u8FromString,
  toString as u8ToString,
} from "uint8arrays";
import { loggerGate } from "./loggerGate.js";

async function dialProtocolWithRetry(
  libp2p: Libp2p,
  peerId: PeerId,
  protocol: string,
  peerIdStr: string,
): Promise<Stream> {
  let attempt = 0;
  const maxDelay = 30000; // Maximum delay of 30 seconds
  const baseDelay = 1000; // Start with 1 second
  let reasonNotToContinue: string | undefined;

  while (!reasonNotToContinue) {
    try {
      const isPeerConnected = libp2p
        .getPeers()
        .map((x) => x.toString())
        .includes(peerIdStr);

      if (!isPeerConnected) {
        reasonNotToContinue = `Peer ${peerIdStr} is not connected`;
        continue;
      }

      return await libp2p.dialProtocol(peerId, protocol);
    } catch (dialError) {
      attempt++;
      const delay = Math.min(baseDelay * 2 ** (attempt - 1), maxDelay);

      loggerGate.canError &&
        console.error(
          `Failed to dial protocol ${protocol} to peer ${peerIdStr} (attempt ${attempt}). Retrying in ${delay}ms...`,
          dialError,
        );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error(
    reasonNotToContinue
      ? reasonNotToContinue
      : "Dialing retries have been unexpectedly stopped",
  );
}

export async function attachOngoingStream(
  protocol: string,
  libp2p: Libp2p,
  peerIdStr: string,
  onResponseMessage: (msg: string) => void,
) {
  let stream: Stream;
  let byteStreamInstance: ReturnType<typeof byteStream>;

  try {
    const peerId = peerIdFromString(peerIdStr);
    stream = await dialProtocolWithRetry(libp2p, peerId, protocol, peerIdStr);
    let keepListening = true;
    byteStreamInstance = byteStream(stream);

    Promise.resolve().then(async () => {
      while (keepListening) {
        const buf = await byteStreamInstance.read();
        if (!buf) {
          keepListening = false;
          break;
        }
        const message = u8ToString(buf.subarray());
        onResponseMessage(message);
      }
    });
  } catch (err) {
    loggerGate.canError && console.error(err);
    throw err;
  }

  const sendText = (text: string) => {
    return byteStreamInstance.write(u8FromString(text));
  };
  const sendJson = (obj: Record<string, unknown>) => {
    return sendText(JSON.stringify(obj));
  };

  return {
    sendText,
    sendJson,
    getStream() {
      return stream;
    },
    byteStreamInstance,
  };
}
