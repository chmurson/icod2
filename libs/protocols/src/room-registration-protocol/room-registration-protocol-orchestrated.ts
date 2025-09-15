import type { Libp2p } from "libp2p";
import type { z } from "zod";
import { attachOngoingStream } from "../commons/attach-ongoing-stream.js";
import {
  RequestResponseBuilder,
  RequestResponseManager,
} from "./../commons/message-orchestrator.js";
import { parseJsonSafely } from "../commons/parse-json-safely.js";
import { registerProtoHandle } from "../commons/register-proto-handle.js";
import {
  type Messages,
  messagesSchemas,
  type Responses,
  responseSchemas,
} from "./messages-and-responses.js";

export type ChatMessage = string | Record<string, unknown>;

export const ROOM_REGISTRATION_PROTOCOL = "/myapp/room-registration/1.0.0";

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
  const manager = new RequestResponseManager<Record<string, unknown>>();

  if (callbacks) {
    manager.registerMessageHandler(
      (message): message is Messages["registerRoom"] => {
        const result = messagesSchemas.registerRoom.safeParse(message);
        return result.success;
      },
      (message, peerId) => {
        console.log("Registering room:", message.roomName);
        callbacks.onRegisterRoom(message.roomName, peerId);
      },
    );

    manager.registerMessageHandler(
      (msg): msg is Messages["unregisterRoom"] => {
        const result = messagesSchemas.unregisterRoom.safeParse(msg);
        return result.success;
      },
      (message, peerId) => {
        console.log("Unregistering room:", message.roomName);
        callbacks.onUnregisterRoom(message.roomName, peerId);
      },
    );
  }

  const createPeerConnection = async (peerIdStr: string) => {
    const { sendJson, getStream } = await attachOngoingStream(
      ROOM_REGISTRATION_PROTOCOL,
      libp2p,
      peerIdStr,
      (message) => {
        const json = parseJsonSafely(message);
        if (json) {
          manager.processIncomingMessage(json, peerIdStr);
        }
      },
    );

    manager.configureSendFunction(sendJson);

    return {
      manager,
      close: () => {
        manager.clearPendingRequests();
        getStream().close();
      },
      sendResponse: (message: Responses[keyof Responses]) => {
        return sendJson(message);
      },
      operations: {
        registerRoom: async (roomToken: string) => {
          try {
            const response = await manager.executeRequestResponse(
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
            const response = await manager.executeRequestResponse(
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
        console.log("Received message:", message, "from peer", peerId);
        const json = parseJsonSafely(message);
        if (!json) return;

        if (!manager.processIncomingMessage(json, peerId)) {
          console.warn("Unhandled message:", json);
        }
      },
    );
  };

  const close = () => {
    libp2p.unhandle(ROOM_REGISTRATION_PROTOCOL);
  };

  return {
    start,
    createPeerConnection,
    close,
  };
}
