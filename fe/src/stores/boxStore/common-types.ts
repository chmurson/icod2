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
