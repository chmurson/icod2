import type { Libp2p, Stream } from "@libp2p/interface";
import { peerIdFromString } from "@libp2p/peer-id";
import { byteStream } from "it-byte-stream";
import {
  fromString as u8FromString,
  toString as u8ToString,
} from "uint8arrays";
import { loggerGate } from "./loggerGate";

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
    stream = await libp2p.dialProtocol(peerId, protocol);
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
