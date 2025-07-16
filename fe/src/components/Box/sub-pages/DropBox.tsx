import { useRef, useState } from "react";
import type { LockedBoxFile } from "@/stores/boxStore/common-types";
import { useOpenBoxCreationState } from "@/stores/boxStore/openBoxCreationState";
import { Button } from "@/ui/Button";

function isLockedBoxFile(data: any): data is LockedBoxFile {
  return (
    data &&
    typeof data === "object" &&
    typeof data.encryptedMessage === "string" &&
    typeof data.key === "string" &&
    typeof data.boxTitle === "string" &&
    typeof data.keyHolderId === "string" &&
    typeof data.keyThreshold === "number" &&
    Array.isArray(data.keyHolders) &&
    data.keyHolders.every(
      (kh: any) =>
        kh &&
        typeof kh === "object" &&
        typeof kh.id === "string" &&
        typeof kh.name === "string" &&
        typeof kh.userAgent === "string",
    )
  );
}

export const DropBox: React.FC = () => {
  const openBoxState = useOpenBoxCreationState();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (openBoxState.state === "initial") {
    return <div>Loading...</div>;
  }

  const handleBackClick = () => {
    openBoxState.actions.reset();
    setError(null);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(null);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.name.endsWith(".json")) {
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
      openBoxState.actions.connect({
        boxTitle: data.boxTitle,
        encryptedMessage: data.encryptedMessage,
        key: data.key,
        keyHolderId: data.keyHolderId,
        keyHolders: data.keyHolders,
        keyThreshold: data.keyThreshold,
      });
      setError(null);
    } catch (err) {
      setError(
        "Failed to parse file: " +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (!file.name.endsWith(".json")) {
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
      openBoxState.actions.connect({
        boxTitle: data.boxTitle,
        encryptedMessage: data.encryptedMessage,
        key: data.key,
        keyHolderId: data.keyHolderId,
        keyHolders: data.keyHolders,
        keyThreshold: data.keyThreshold,
      });
      setError(null);
    } catch (err) {
      setError(
        "Failed to parse file: " +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  };

  return (
    <div>
      <div>Hello world</div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: "2px dashed #888",
          borderRadius: 8,
          padding: 32,
          textAlign: "center",
          marginBottom: 16,
          background: "#fafafa",
        }}
      >
        <div>Drop your LockedBoxFile (.json) here</div>
        <div style={{ margin: "8px 0" }}>or</div>
        <Button variant="primary" onClick={() => fileInputRef.current?.click()}>
          Select File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          style={{ display: "none" }}
          onChange={handleFileInput}
        />
        {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}
      </div>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {JSON.stringify(openBoxState, null, 2)}
      </pre>
      <Button variant="secondary" onClick={handleBackClick}>
        Back
      </Button>
    </div>
  );
};
