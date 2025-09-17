export type KeyHolderWelcomesLeader = {
  type: "keyholder:welcome-leader";
  name: string;
  userAgent: string;
  roomToken: string;
};

export function isKeyHolderWelcomesLeader(
  payload: object,
): payload is KeyHolderWelcomesLeader {
  return (
    "type" in payload &&
    payload.type === "keyholder:welcome-leader" &&
    "name" in payload &&
    typeof payload.name === "string" &&
    "userAgent" in payload &&
    typeof payload.userAgent === "string" &&
    "roomToken" in payload &&
    typeof payload.roomToken === "string"
  );
}

export type LeaderWelcomesKeyholder = {
  type: "leader:welcome-keyholder";
  leaderInfo: {
    id: string;
    name: string;
    userAgent: string;
  };
  boxInfo: {
    name: string;
    keyHolderThreshold: number;
  };
  keyHolderId: string;
};

export type LeaderNotAuthorizedKeyholder = {
  type: "leader:keyholder-not-athorized";
  reason?: string;
};

export function isLeaderNotAuthorizedKeyholder(
  payload: object,
): payload is LeaderNotAuthorizedKeyholder {
  return "type" in payload && payload.type === "leader:keyholder-not-athorized";
}

export function isLeaderWelcomesKeyholder(
  payload: object,
): payload is LeaderWelcomesKeyholder {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "type" in payload &&
    payload.type === "leader:welcome-keyholder" &&
    "leaderInfo" in payload &&
    typeof payload.leaderInfo === "object" &&
    payload.leaderInfo !== null &&
    "name" in payload.leaderInfo &&
    typeof payload.leaderInfo.name === "string" &&
    "userAgent" in payload.leaderInfo &&
    typeof payload.leaderInfo.userAgent === "string" &&
    "id" in payload.leaderInfo &&
    typeof payload.leaderInfo.id === "string" &&
    "boxInfo" in payload &&
    typeof payload.boxInfo === "object" &&
    payload.boxInfo !== null &&
    "name" in payload.boxInfo &&
    typeof payload.boxInfo.name === "string" &&
    "keyHolderThreshold" in payload.boxInfo &&
    typeof payload.boxInfo.keyHolderThreshold === "number" &&
    "keyHolderId" in payload &&
    typeof payload.keyHolderId === "string"
  );
}

export type LeaderSendsBoxUpdate = {
  type: "leader:sends-box-update";
  name: string;
  keyHolderThreshold: number;
  content?: string;
};

export function isLeaderSendsBoxUpdate(
  payload: object,
): payload is LeaderSendsBoxUpdate {
  return (
    "type" in payload &&
    payload.type === "leader:sends-box-update" &&
    "name" in payload &&
    typeof payload.name === "string" &&
    "keyHolderThreshold" in payload &&
    typeof payload.keyHolderThreshold === "number" &&
    (!("content" in payload) || typeof payload.content === "string")
  );
}

export type LeaderSendsBoxCreated = {
  type: "leader:box-created";
  key: string;
  encryptedMessage: string;
};

export function isLeaderSendsBoxCreated(
  payload: object,
): payload is LeaderSendsBoxCreated {
  return (
    "type" in payload &&
    payload.type === "leader:box-created" &&
    "key" in payload &&
    typeof payload.key === "string" &&
    "encryptedMessage" in payload &&
    typeof payload.encryptedMessage === "string"
  );
}

export type KeyHolderSendsCreatedBoxReceived = {
  type: "keyholder:created-box-received";
};

export const isKeyHolderSendsCreatedBoxReceived = (
  message: unknown,
): message is KeyHolderSendsCreatedBoxReceived => {
  return (
    typeof message === "object" &&
    message !== null &&
    "type" in message &&
    message.type === "keyholder:created-box-received"
  );
};

export type LeaderSendsKeyHolderList = {
  type: "leader:keyholder-list";
  allKeyHolders: {
    id: string;
    name: string;
    userAgent: string;
  }[];
};

export const isLeaderSendsKeyHolderList = (
  payload: object,
): payload is LeaderSendsKeyHolderList => {
  return "type" in payload && payload.type === "leader:keyholder-list";
};
