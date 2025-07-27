export const createKeyholderHelloHash = async ({
  encryptedMessage,
  numberOfKeys,
  threshold,
  allKeyHoldersId,
}: {
  encryptedMessage: string;
  numberOfKeys: number;
  threshold: number;
  allKeyHoldersId: string[];
}) => {
  const sortedKeyHolders = allKeyHoldersId.sort().join("");

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
