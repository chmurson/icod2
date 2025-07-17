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
    name: string;
    userAgent: string;
  };
  boxInfo: {
    name: string;
    keyHolderTreshold: number;
  };
};
