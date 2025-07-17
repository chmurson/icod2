import init, { ChunksConfiguration, secure_message } from "icod-crypto-js";
import wasm from "icod-crypto-js/icod_crypto_js_bg.wasm?url";
import { useEffect } from "react";
import { useCreateBoxStore, useDownloadBoxStore } from "@/stores";

let isCryptoJsInitialized = false;

function initCryptoJs() {
  if (!isCryptoJsInitialized) {
    init(wasm);
    isCryptoJsInitialized = true;
  }
}

export const useLockBox = () => {
  useEffect(() => {
    initCryptoJs();
  }, []);

  const createDownloadStoreFromCreateBox = useDownloadBoxStore(
    (state) => state.fromCreateBox,
  );

  const lockBox = () => {
    const { title, content, keyHolders, actions, threshold } =
      useCreateBoxStore.getState();

    const numKeys = keyHolders.length + 1; // Leader + key holders
    const secured = secure_message(
      content,
      undefined,
      new ChunksConfiguration(threshold, numKeys - threshold),
    );

    const encryptedMessage = secured.encrypted_message[0] as string;
    const key = secured.chunks[0] as string;

    actions.lock({
      title: title,
      content: content,
      encryptedMessage: encryptedMessage,
      generatedKey: key,
      generatedKeys: secured.chunks as string[],
    });

    createDownloadStoreFromCreateBox();

    return {
      encryptedMessage,
      key: secured.chunks[0],
      keys: secured.chunks as string[],
    };
  };

  return {
    lockBox,
  };
};
