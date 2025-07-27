import type { ParticipantType } from "@/stores/boxStore/common-types";

export const createKeyholderHelloHash = async ({
  encryptedMessage,
  numberOfKeys,
  threshold,
  keyHolders,
}: {
  encryptedMessage: string;
  numberOfKeys: number;
  threshold: number;
  keyHolders: ParticipantType[];
}) => {
  const sortedKeyHolders = keyHolders
    .map((kh) => kh.id)
    .sort()
    .join("");
  const hashableString =
    encryptedMessage + numberOfKeys + threshold + sortedKeyHolders;

  const encoder = new TextEncoder();
  const data = encoder.encode(hashableString);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};
