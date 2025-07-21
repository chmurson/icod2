// Message types for OpenLockedBox <-> JoinLockedBox WebRTC communication

export interface KeyholderHello {
  type: "keyholder:hello";
  key: string;
  encryptedMessage: string;
  userAgent: string;
  id: string;
}

export interface LeaderWelcome {
  type: "leader:welcome";
  name: string;
  userAgent: string;
  id: string;
  onlineKeyHolders: Array<{ id: string; name: string; userAgent: string }>;
}

export interface LeaderError {
  type: "leader:error";
  reason: string;
}

export type RestoreBoxesMessage = KeyholderHello | LeaderWelcome | LeaderError;

export function isKeyholderHello(msg: any): msg is KeyholderHello {
  return (
    msg &&
    msg.type === "keyholder:hello" &&
    typeof msg.key === "string" &&
    typeof msg.encryptedMessage === "string" &&
    typeof msg.userAgent === "string" &&
    typeof msg.id === "string"
  );
}

export function isLeaderWelcome(msg: any): msg is LeaderWelcome {
  return msg && msg.type === "leader:welcome";
}

export function isLeaderError(msg: any): msg is LeaderError {
  return msg && msg.type === "leader:error";
}
