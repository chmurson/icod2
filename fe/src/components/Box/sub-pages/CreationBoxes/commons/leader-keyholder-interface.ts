export type KeyHolderWelcomesLeader = {
  type: "keyholder:welcome-leader";
  name: string;
  userAgent: string;
};

export function isKeyHolderWelcomesLeader(
  payload: object,
): payload is KeyHolderWelcomesLeader {
  return (
    "type" in payload &&
    payload.type === "keyholder:welcome-leader" &&
    "name" in payload &&
    typeof payload.name === "string"
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
    keyHolderTreshold: number;
  };
  yourId: string;
};

export function isLeaderWelcomesKeyholder(
  payload: object,
): payload is LeaderWelcomesKeyholder {
  return (
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
    "keyHolderTreshold" in payload.boxInfo &&
    typeof payload.boxInfo.keyHolderTreshold === "number" &&
    "yourId" in payload &&
    typeof payload.yourId === "string"
  );
}

export type LeaderSendsBoxUpdate = {
  type: "leader:sends-box-update";
  boxInfo: {
    name: string;
    keyHolderTreshold: number;
  };
};

export function isLeaderSendsBoxUpdate(
  payload: object,
): payload is LeaderSendsBoxUpdate {
  return (
    "type" in payload &&
    payload.type === "leader:sends-box-update" &&
    "boxInfo" in payload &&
    typeof payload.boxInfo === "object" &&
    payload.boxInfo !== null &&
    "name" in payload.boxInfo &&
    typeof payload.boxInfo.name === "string" &&
    "keyHolderTreshold" in payload.boxInfo &&
    typeof payload.boxInfo.keyHolderTreshold === "number"
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
