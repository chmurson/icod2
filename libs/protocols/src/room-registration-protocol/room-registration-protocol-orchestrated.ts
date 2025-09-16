import type { Libp2p } from "libp2p";
import type { z } from "zod";
import { attachOngoingStream } from "../commons/attach-ongoing-stream.js";
import logger from "../commons/customLogger.js";
import { parseJsonSafely } from "../commons/parse-json-safely.js";
import { registerProtoHandle } from "../commons/register-proto-handle.js";
import {
  RequestResponseBuilder,
  RequestResponseManager,
} from "./../commons/request-response-manager.js";
import {
  type Messages,
  messagesSchemas,
  type Responses,
  responseSchemas,
} from "./messages-and-responses.js";

export type ChatMessage = string | Record<string, unknown>;

export const ROOM_REGISTRATION_PROTOCOL = "/icod2/room-registration/1.0.0";

type Callbacks = {
  onRegisterRoom: (roomName: string, peerId: string) => void;
  onUnregisterRoom: (roomName: string, peerId: string) => void;
};

const requestResponsePairs = {
  registerRoom: (roomToken: string) =>
    RequestResponseBuilder.create<
      Messages["registerRoom"],
      z.infer<typeof responseSchemas.registerRoomSuccess>
    >("registerRoom")
      .withRequest({
        type: "register-room",
        roomName: roomToken,
      } satisfies Messages["registerRoom"])
      .expectResponse(responseSchemas.registerRoomSuccess)
      .withTimeout(10_000)
      .withRetry({
        maxAttempts: 3,
        delayMs: 1000,
        backoffMultiplier: 2,
      })
      .build(),

  unregisterRoom: (roomName: string) =>
    RequestResponseBuilder.create<
      Messages["unregisterRoom"],
      z.infer<typeof responseSchemas.unregisterRoomSuccess>
    >("unregisterRoom")
      .withRequest({
        type: "unregister-room",
        roomName,
      } satisfies Messages["unregisterRoom"])
      .expectResponse(responseSchemas.unregisterRoomSuccess)
      .withTimeout(5_000)
      .build(),
};

export function initRoomRegistrationProtocol(
  libp2p: Libp2p,
  callbacks?: Callbacks,
) {
  const peerManagers = new Map<
    string,
    RequestResponseManager<Record<string, unknown>>
  >();

  const createPeerConnection = async (peerIdStr: string) => {
    const peerManager = new RequestResponseManager<Record<string, unknown>>();

    const { sendJson, getStream } = await attachOngoingStream(
      ROOM_REGISTRATION_PROTOCOL,
      libp2p,
      peerIdStr,
      (message) => {
        const json = parseJsonSafely(message);
        if (json) {
          peerManager.processIncomingMessage(json, peerIdStr);
        }
      },
    );

    peerManager.configureSendFunction(sendJson);

    peerManagers.set(peerIdStr, peerManager);

    return {
      manager: peerManager,
      close: () => {
        peerManager.clearPendingRequests();
        peerManagers.delete(peerIdStr);
        getStream().close();
      },
      sendResponse: (message: Responses[keyof Responses]) => {
        return sendJson(message);
      },
      operations: {
        registerRoom: async (roomToken: string) => {
          try {
            const response = await peerManager.executeRequestResponse(
              requestResponsePairs.registerRoom(roomToken),
              "register-room",
            );
            return { success: true, response };
          } catch (error) {
            throw new Error(`Failed to register room ${roomToken}: ${error}`);
          }
        },
        unregisterRoom: async (roomToken: string) => {
          try {
            const response = await peerManager.executeRequestResponse(
              requestResponsePairs.unregisterRoom(roomToken),
              "unregister-room",
            );
            return { success: true, response };
          } catch (error) {
            throw new Error(`Failed to unregister room ${roomToken}: ${error}`);
          }
        },
      },
    };
  };

  const start = (): Promise<void> => {
    return registerProtoHandle(
      ROOM_REGISTRATION_PROTOCOL,
      libp2p,
      (message, peerId) => {
        logger.log("Received message:", message, "from peer", peerId);
        const json = parseJsonSafely(message);
        if (!json) return;

        const peerManager = peerManagers.get(peerId);
        let handled = false;

        if (peerManager) {
          handled = peerManager.processIncomingMessage(json, peerId);
        }

        if (!handled && callbacks) {
          if (messagesSchemas.registerRoom.safeParse(json).success) {
            const msg = json as Messages["registerRoom"];
            callbacks.onRegisterRoom(msg.roomName, peerId);
            handled = true;
          } else if (messagesSchemas.unregisterRoom.safeParse(json).success) {
            const msg = json as Messages["unregisterRoom"];
            callbacks.onUnregisterRoom(msg.roomName, peerId);
            handled = true;
          }
        }

        if (!handled) {
          logger.warn("Unhandled message:", json);
        }
      },
    );
  };

  const close = () => {
    for (const manager of peerManagers.values()) {
      manager.clearPendingRequests();
    }
    peerManagers.clear();

    libp2p.unhandle(ROOM_REGISTRATION_PROTOCOL);
  };

  return {
    start,
    createPeerConnection,
    close,
  };
}
