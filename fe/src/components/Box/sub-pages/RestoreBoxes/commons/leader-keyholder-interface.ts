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
    "id" in msg &&
    typeof msg.id === "string" &&
    "userAgent" in msg &&
    typeof msg.userAgent === "string"
  );
}

export function isLeaderWelcome(msg: object): msg is LeaderWelcome {
  return (
    "type" in msg &&
    msg.type === "leader:welcome" &&
    "name" in msg &&
    typeof msg.name === "string" &&
    "userAgent" in msg &&
    typeof msg.userAgent === "string" &&
    "id" in msg &&
    typeof msg.id === "string" &&
    "onlineKeyHolders" in msg &&
    Array.isArray(msg.onlineKeyHolders)
  );
}

export function isLeaderError(msg: object): msg is LeaderError {
  return (
    "type" in msg &&
    msg.type === "leader:error" &&
    "reason" in msg &&
    typeof msg.reason === "string"
  );
}

export function isLeaderOnlineKeyholders(
  msg: object,
): msg is LeaderOnlineKeyholders {
  return (
    "type" in msg &&
    msg.type === "leader:online-keyholders" &&
    "onlineKeyHolders" in msg &&
    Array.isArray(msg.onlineKeyHolders)
  );
}

export function isLeaderOfflineKeyholders(
  msg: object,
): msg is LeaderOfflineKeyholders {
  return (
    "type" in msg &&
    msg.type === "leader:offline-keyholders" &&
    "offlineKeyHolders" in msg &&
    Array.isArray(msg.offlineKeyHolders)
  );
}

export type FollowerSendsPartialStateMessage = {
  type: "follower:send-partial-state";
  keyHoldersIdsToSharedKeyWith: string[];
};

export function isFollowerSendsPartialStateMessage(
  msg: object,
): msg is FollowerSendsPartialStateMessage {
  return (
    typeof msg === "object" &&
    msg !== null &&
    "type" in msg &&
    msg.type === "follower:send-partial-state" &&
    "keyHoldersIdsToSharedKeyWith" in msg &&
    Array.isArray(msg.keyHoldersIdsToSharedKeyWith)
  );
}

export type LeaderSendsPartialStateMessage = {
  type: "leader:send-partial-state";
  shareAccessKeyMapByKeyHolderId?: Record<string, Record<string, boolean>>;
  onlineKeyHolders?: ParticipantType[];
};

export function isLeaderSendsPartialStateMessage(
  msg: object,
): msg is LeaderSendsPartialStateMessage {
  return (
    typeof msg === "object" &&
    msg !== null &&
    "type" in msg &&
    msg.type === "leader:send-partial-state" &&
    (!("shareAccessKeyMapByKeyHolderId" in msg) ||
      (typeof msg.shareAccessKeyMapByKeyHolderId === "object" &&
        msg.shareAccessKeyMapByKeyHolderId !== null))
  );
}
