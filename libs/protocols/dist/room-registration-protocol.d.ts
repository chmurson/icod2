import type { Libp2p } from "libp2p";
export type ChatMessage = string | Record<string, unknown>;
export declare const ROOM_REGISTRATION_PROTOCOL =
  "/myapp/room-registration/1.0.0";
type Callbacks = {
  onRegisterRoom: (roomName: string) => void;
  onUnregisterRoom: (roomName: string) => void;
};
export declare function initRoomRegistrationProtocol(
  libp2p: Libp2p,
  callbacks?: Callbacks,
): {
  start: () => Promise<void>;
  attachOngoingStream: (peerIdStr: string) => Promise<{
    close: () => void;
    registerRoom: (roomName: string) => Promise<void>;
    unregisterRoom: (roomName: string) => Promise<void>;
  }>;
  close: () => void;
};
//# sourceMappingURL=room-registration-protocol.d.ts.map
