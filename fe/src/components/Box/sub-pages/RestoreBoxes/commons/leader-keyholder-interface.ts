import type { ParticipantType } from "@/stores/boxStore/common-types";

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

export interface LeaderCounterStart {
  type: "leader:counter-start";
  unlockingStartDate: string;
}

export interface LeaderCounterStop {
  type: "leader:counter-stop";
}

export interface LeaderSendsPartialStateMessage {
  type: "leader:send-partial-state";
  shareAccessKeyMapByKeyHolderId?: Record<string, Record<string, boolean>>;
  onlineKeyHolders?: ParticipantType[];
}

export type RestoreBoxesMessage =
  | KeyholderHello
  | LeaderWelcome
  | LeaderError
  | LeaderCounterStart
  | LeaderCounterStop
  | LeaderSendsPartialStateMessage;

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

export function isLeaderCounterStart(msg: any): msg is LeaderCounterStart {
  return (
    msg &&
    msg.type === "leader:counter-start" &&
    typeof msg.unlockingStartDate === "string"
  );
}

export function isLeaderCounterStop(msg: any): msg is LeaderCounterStop {
  return msg && msg.type === "leader:counter-stop";
}

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
