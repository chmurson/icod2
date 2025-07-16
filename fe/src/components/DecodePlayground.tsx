import init, { restore_message } from "icod-crypto-js";
import wasm from "icod-crypto-js/icod_crypto_js_bg.wasm?url";
import { useEffect, useState } from "react";

const DecodePlayground = () => {
  const [encryptedMessageInput, setEncryptedMessageInput] = useState("");
  const [threshold, setThreshold] = useState(2);
  const [decryptionKeys, setDecryptionKeys] = useState<string[]>(
    new Array(threshold).fill(""),
  );
  const [decryptedMessage, setDecryptedMessage] = useState<string | null>(null);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);

  useEffect(() => {
    init(wasm);
  }, []);

  useEffect(() => {
    setDecryptionKeys(new Array(threshold).fill(""));
  }, [threshold]);

  const handleDecrypt = () => {
    setDecryptionError(null);
    setDecryptedMessage(null);

    const encryptedMessageParts: string[] = [encryptedMessageInput];

    const providedKeys = decryptionKeys.filter((key) => key.trim() !== "");
    if (providedKeys.length < threshold) {
      setDecryptionError(`Please provide at least ${threshold} keys.`);
      return;
    }

    try {
      const chunksToRestore = providedKeys.map((key) => key.toLowerCase());
      const restored = restore_message(encryptedMessageParts, chunksToRestore);
      setDecryptedMessage(restored);
      setDecryptionError(null);
    } catch (_e) {
      console.error(_e);
      setDecryptionError(
        "Decryption failed. Please ensure the keys are correct and you have provided enough of them.",
      );
    }
  };

  const handleDecryptionKeyChange = (index: number, value: string) => {
    const newKeys = [...decryptionKeys];
    newKeys[index] = value;
    setDecryptionKeys(newKeys);
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-gray-800 text-white">
      <h2 className="text-xl font-bold mb-4">Decode Playground</h2>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="encryptedMessage"
            className="block text-sm font-medium text-gray-300"
          >
            Encrypted Message
          </label>
          <textarea
            id="encryptedMessage"
            value={encryptedMessageInput}
            onChange={(e) => setEncryptedMessageInput(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            rows={5}
          />
        </div>
        <div>
          <label
            htmlFor="threshold"
            className="block text-sm font-medium text-gray-300"
          >
            Threshold
          </label>
          <input
            type="number"
            id="threshold"
            value={threshold}
            onChange={(e) => setThreshold(Number.parseInt(e.target.value, 10))}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            min={1}
          />
        </div>
        <div className="mt-6 border-t border-gray-600 pt-6">
          <h3 className="text-lg font-bold">Decryption Keys</h3>
          <p className="text-sm text-gray-400">
            Enter {threshold} of the generated keys to restore the message.
          </p>
          <div className="space-y-4 mt-4">
            {decryptionKeys.map((_key, index) => (
              <div key={`decryption-key-${"123"}`}>
                <label
                  htmlFor={`decryptionKey-${"123"}`}
                  className="block text-sm font-medium text-gray-300"
                >
                  Key {index + 1}
                </label>
                <input
                  type="text"
                  id={`decryptionKey-${index}`}
                  value={decryptionKeys[index]}
                  onChange={(e) =>
                    handleDecryptionKeyChange(index, e.target.value)
                  }
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
                />
              </div>
            ))}
            <button
              type="submit"
              onClick={handleDecrypt}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Decrypt
            </button>
            {decryptionError && (
              <p className="text-red-500">{decryptionError}</p>
            )}
            {decryptedMessage && (
              <div className="mt-4">
                <h4 className="text-md font-bold">Decrypted Message:</h4>
                <p className="font-mono text-sm p-2 bg-gray-900 rounded mt-1">
                  {decryptedMessage}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecodePlayground;
