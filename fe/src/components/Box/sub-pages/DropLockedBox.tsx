import { useRef, useState } from "react";
import type { LockedBox } from "@/stores/boxStore/common-types";
import { useOpenBoxCreationState } from "@/stores/boxStore/openBoxCreationState";
import { Button } from "@/ui/Button";
import { Text } from "@/ui/Typography";

function isLockedBoxFile(data: object): data is LockedBox {
  return (
    "encryptedMessage" in data &&
    typeof data.encryptedMessage === "string" &&
    "key" in data &&
    typeof data.key === "string" &&
    "boxTitle" in data &&
    typeof data.boxTitle === "string" &&
    "keyHolderId" in data &&
    typeof data.keyHolderId === "string" &&
    "keyThreshold" in data &&
    typeof data.keyThreshold === "number" &&
    "keyHolders" in data &&
    Array.isArray(data.keyHolders) &&
    data.keyHolders.every(
      (kh) =>
        "id" in kh &&
        typeof kh.id === "string" &&
        "name" in kh &&
        typeof kh.name === "string" &&
        "userAgent" in kh &&
        typeof kh.userAgent === "string",
    )
  );
}

export const DropLockedBox: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<LockedBox | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openBoxState = useOpenBoxCreationState();

  const handleFile = async (file: File) => {
    setError(null);
    setSuccess(null);
    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      setError("Only JSON files are supported.");
      return;
    }
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!isLockedBoxFile(data)) {
        setError("File is not a valid LockedBoxFile.");
        return;
      }
      setSuccess(data);
      openBoxState.actions.connect({
        boxTitle: data.boxTitle,
        encryptedMessage: data.encryptedMessage,
        key: data.key,
        keyHolderId: data.keyHolderId,
        keyHolders: data.keyHolders,
        keyThreshold: data.keyThreshold,
      });
    } catch (_) {
      setError("Only JSON files are supported.");
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleBackClick = () => {
    openBoxState.actions.reset();
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex items-center gap-8">
        <div className="flex-1">
          <Text variant="pageTitle" className="mb-4 text-center">
            Open a locked box
          </Text>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="rounded-xl border-2 border-dashed border-gray-400 bg-gradient-to-br from-slate-50 to-slate-200 dark:from-gray-800 dark:to-gray-900 shadow-md p-10 text-center transition-colors"
          >
            {error && <div className="text-red-600 mb-4">{error}</div>}
            {success && (
              <div className="text-green-600 mb-4">
                Secret box loaded successfully!
              </div>
            )}
            <div className="mb-3">Please upload your secret box</div>
            <Button
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
            >
              Select File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
          <div className="flex justify-center mt-8">
            <Button
              variant="secondary"
              onClick={handleBackClick}
              className="h-12 min-w-[80px]"
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
