import init, { ChunksConfiguration, secure_message } from "icod-crypto-js";
import wasm from "icod-crypto-js/icod_crypto_js_bg.wasm?url";

let isCryptoJsInitialized = false;

async function initCryptoJs() {
  if (!isCryptoJsInitialized) {
    await init(wasm);
    isCryptoJsInitialized = true;
  }
}

export async function secureMessage(
  content: string,
  totalKeysNumber: number,
  keysThreshold: number,
) {
  await initCryptoJs();

  const secured = secure_message(
    content,
    undefined,
    new ChunksConfiguration(keysThreshold, totalKeysNumber - keysThreshold),
  );

  return {
    encryptedMessage: secured.encrypted_message[0] as string,
    keysCunks: secured.chunks as string[],
  };
}
