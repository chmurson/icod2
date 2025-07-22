import type { ParticipantType } from "@/stores/boxStore/common-types";

// Message types for OpenLockedBox <-> JoinLockedBox WebRTC communication

export interface KeyholderHello {
  type: "keyholder:hello";
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

export interface LeaderOnlineKeyholders {
  type: "leader:online-keyholders";
  onlineKeyHolders: ParticipantType[];
}

export interface LeaderOfflineKeyholders {
  type: "leader:offline-keyholders";
  offlineKeyHolders: ParticipantType[];
}

export type RestoreBoxesMessage =
  | KeyholderHello
  | LeaderWelcome
  | LeaderError
  | LeaderOnlineKeyholders
  | LeaderOfflineKeyholders;

export function isKeyholderHello(msg: object): msg is KeyholderHello {
  return (
    "type" in msg &&
    msg.type === "keyholder:hello" &&
    "key" in msg &&
    typeof msg.key === "string" &&
    "id" in msg &&
    typeof msg.id === "string"
  );
}

export function isLeaderWelcome(msg: any): msg is LeaderWelcome {
  return msg && msg.type === "leader:welcome";
}

export function isLeaderError(msg: any): msg is LeaderError {
  return msg && msg.type === "leader:error";
}

export function isLeaderOnlineKeyholders(
  msg: any,
): msg is LeaderOnlineKeyholders {
  return msg && msg.type === "leader:online-keyholders";
}

export function isLeaderOfflineKeyholders(
  msg: any,
): msg is LeaderOfflineKeyholders {
  return (
    msg &&
    msg.type === "leader:online-keyholders" &&
    typeof msg.keyholder === "object"
  );
}

export type FollowerSendsPartialStateMessage = {
  type: "follower:send-partial-state";
  keyHoldersIdsToSharedKeyWith: string[];
};

export function isFollowerSendsPartialStateMessage(
  msg: object,
): msg is FollowerSendsPartialStateMessage {
  return !msg && "type" in msg;
}
