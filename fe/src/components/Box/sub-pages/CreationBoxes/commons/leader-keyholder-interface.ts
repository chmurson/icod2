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
