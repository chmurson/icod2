import type { CreateBoxSchema } from "./../useValidateBoxForm";

async function lazySecureMessage(
  content: string,
  totalKeysNumber: number,
  keysThreshold: number,
) {
  const module = await import("./secureMessage");
  return module.secureMessage(content, totalKeysNumber, keysThreshold);
}

export const useCreateLockedBox = () => {
  const createLockedBox = async ({
    content,
    keyHolders,
    threshold,
  }: CreateBoxSchema) => {
    const keysNumber = keyHolders.length + 1; // Leader + key holders

    const secured = await lazySecureMessage(content, keysNumber, threshold);

    return {
      encryptedMessage: secured.encryptedMessage,
      keys: secured.keysCunks,
    };
  };

  return {
    createLockedBox,
  };
};
