// Message types for OpenLockedBox <-> JoinLockedBox WebRTC communication

export * from "./leader-keyholder-interface";

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
