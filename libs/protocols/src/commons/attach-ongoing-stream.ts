import type { Libp2p, Stream } from "@libp2p/interface";
import { peerIdFromString } from "@libp2p/peer-id";
import {
  fromString as u8FromString,
  toString as u8ToString,
} from "uint8arrays";
import { loggerGate } from "./loggerGate.js";

export async function attachOngoingStream(
  protocol: string,
  libp2p: Libp2p,
  peerIdStr: string,
  onResponseMessage: (msg: string) => void,
) {
  let stream: Stream;

  try {
    const peerId = peerIdFromString(peerIdStr);
    stream = await libp2p.dialProtocol(peerId, protocol);

    stream.addEventListener("message", (event) => {
      const message = u8ToString(event.data);
      onResponseMessage(message);
    });
  } catch (err) {
    loggerGate.canError && console.error(err);
    throw err;
  }

  const sendText = (text: string) => {
    try {
      const result = stream.send(u8FromString(text));
      if (!result) {
        throw new Error("Failed to send message because buffer is full");
      }
    } catch (err) {
      loggerGate.canError && console.error(err);
      throw err;
    }
  };
  const sendJson = (obj: Record<string, unknown>) => {
    return sendText(JSON.stringify(obj));
  };

  return {
    sendJson,
    dispose() {
      stream?.close();
    },
  };
}
