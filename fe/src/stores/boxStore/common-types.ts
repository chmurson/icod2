export type DeviceType = "💻" | "📱" | "❓";

export type ParticipantType = {
  id: string;
  name: string;
  userAgent: string;
};

export type LockedBox = {
  encryptedMessage: string;
  key: string;
  boxTitle: string;
  keyHolderId: string;
  keyThreshold: number;
  keyHolders: ParticipantType[];
};

export const lockedBoxStoreStateCommonPart = {
  state: "initial" as
    | "initial"
    | "drop-box"
    | "connecting"
    | "connected"
    | "disconnected"
    | "ready-to-unlock",
  you: {
    id: "",
    name: "",
    userAgent: "",
  } satisfies ParticipantType,
  keyThreshold: 1,
  key: "",
  receivedKeysByKeyHolderId: undefined as Record<string, string> | undefined,
  shareAccessKeyMapByKeyHolderId: {} as Record<string, Record<string, boolean>>,
  onlineKeyHolders: [] as ParticipantType[],
  offLineKeyHolders: [] as ParticipantType[],
  unlockingStartDate: null as Date | null,
  encryptedMessage: "",
  roomToken: "",
};

export type LockedBoxStoreCommonPart = typeof lockedBoxStoreStateCommonPart & {
  actions: {
    setReadyToUnlock: () => void;
  };
};
