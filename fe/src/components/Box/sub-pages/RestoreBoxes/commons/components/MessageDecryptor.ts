import { logger } from "@icod2/protocols";
import init, { restore_message } from "icod-crypto-js";
import wasm from "icod-crypto-js/icod_crypto_js_bg.wasm?url";
import {
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

let isWasmInitialized = false;
async function initWasm() {
  if (isWasmInitialized) {
    return;
  }

  await init(wasm);
  isWasmInitialized = true;
}

type Props = {
  children: (arg: {
    decryptedMessage: string | undefined;
    error: string | undefined;
  }) => ReactNode;
  encryptedMessage: string;
  keys: string[];
};

export const MessageDecryptor: FC<Props> = ({
  encryptedMessage,
  keys,
  children,
}) => {
  const [decryptedMessage, setDecryptedMessage] = useState<string | undefined>(
    undefined,
  );
  const [error, setError] = useState<string | undefined>(undefined);

  const decryptMessage = useCallback(() => {
    try {
      const restoredMessage = restore_message([encryptedMessage], keys);
      setDecryptedMessage(restoredMessage);
    } catch (e) {
      logger.error(e);
      const defaultMessage = "Unknown error";

      if (e instanceof Error) {
        setError(e.message ?? defaultMessage);
      } else {
        setError(defaultMessage);
      }
    }
  }, [keys, encryptedMessage]);

  useEffect(() => {
    let ignore = false;
    initWasm().then(() => {
      if (!ignore) {
        decryptMessage();
      }
    });

    return () => {
      ignore = true;
    };
  }, [decryptMessage]);

  return children({ decryptedMessage, error });
};
