import type { Libp2p } from "@libp2p/interface";
import { toString as u8ToString } from "uint8arrays";

export async function registerProtoHandle(
  protocol: string,
  libp2p: Libp2p,
  onMessage: (message: string, peerIdStr: string) => void,
): Promise<void> {
  await libp2p.handle(protocol, async (stream, connection) => {
    try {
      for await (const buf of stream) {
        try {
          if (buf === undefined || buf === null) {
            console.log("Skipping undefined/null buffer");
            continue;
          }

          if (!buf || typeof buf !== "object") {
            console.log("Skipping non-object buffer:", typeof buf);
            continue;
          }

          if (!("length" in buf) || buf.length === 0) {
            console.log("Skipping buffer with no length or zero length");
            continue;
          }

          let validBuffer: Uint8Array;
          if (buf instanceof Uint8Array) {
            validBuffer = buf;
          } else if (ArrayBuffer.isView(buf)) {
            validBuffer = new Uint8Array(
              buf.buffer,
              buf.byteOffset,
              buf.byteLength,
            );
          } else if (buf instanceof ArrayBuffer) {
            validBuffer = new Uint8Array(buf);
          } else if (Array.isArray(buf)) {
            validBuffer = new Uint8Array(buf);
          } else if (buf && typeof buf === "object" && "subarray" in buf) {
            validBuffer = buf.subarray
              ? buf.subarray()
              : // biome-ignore lint/suspicious/noExplicitAny: otherwise does not work
                new Uint8Array(Array.from(buf as any));
          } else {
            console.log("Cannot convert buffer to Uint8Array, skipping:", buf);
            continue;
          }

          const message = u8ToString(validBuffer);
          console.log("message:", message);
          onMessage(message, connection.remotePeer.toString());
        } catch (error) {
          console.error("Error processing message:", error);
        }
      }
    } catch (error) {
      console.error("Error handling stream:", error);
    }
  });
}
