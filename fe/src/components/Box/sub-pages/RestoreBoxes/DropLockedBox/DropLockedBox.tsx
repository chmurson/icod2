import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StartLeaderFollowerAlert } from "@/components/Box/components/StartLeaderFollowerAlert";
import { useRoomToken } from "@/services/libp2p/useRoomRegistration";
import type { LockedBox } from "@/stores/boxStore/common-types";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import { useOpenLockedBoxStore } from "@/stores/boxStore/openLockedBoxStore";
import { Alert } from "@/ui/Alert";
import { Button } from "@/ui/Button";
import { Text } from "@/ui/Typography";
import { cn } from "@/utils/cn";
import {
  clearPersistedStartedUnlockingInfo,
  isPersistedStartedUnlocking,
} from "../commons/persistStartedUnlocking";
import { useDevExpAutoLockedBoxUpload } from "./useDevExpAutoLockedBoxUpload";

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
  const { roomToken } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<LockedBox | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openLockedBoxState = useOpenLockedBoxStore();
  const joinLockedBoxState = useJoinLockedBoxStore();
  const { generateAndPersistRoomToken } = useRoomToken();

  const isForcingLeader = roomToken
    ? isPersistedStartedUnlocking(roomToken)
    : false;

  useEffect(() => {
    if (!isPersistedStartedUnlocking(roomToken ?? "")) {
      clearPersistedStartedUnlockingInfo();
    }
  }, [roomToken]);

  const isFollower = !isForcingLeader && (roomToken?.trim().length ?? 0) > 0;
  const joinLockedBoxError = useJoinLockedBoxStore((state) => state.error);

  useEffect(() => {
    if (joinLockedBoxError) {
      setError(joinLockedBoxError);
    }
  }, [joinLockedBoxError]);

  const consumeLockedBox = useCallback(
    (data: object) => {
      if (!isLockedBoxFile(data)) {
        setError("File is not a valid LockedBoxFile.");
        return;
      }
      setSuccess(data);

      if (isFollower) {
        if (!roomToken) {
          setError("Room token is required.");
          return;
        }

        joinLockedBoxState.actions.connect({
          boxTitle: data.boxTitle,
          encryptedMessage: data.encryptedMessage,
          key: data.key,
          keyHolderId: data.keyHolderId,
          keyHolders: data.keyHolders,
          keyThreshold: data.keyThreshold,
          roomToken,
        });
      } else {
        const notEmptyRoomToken = roomToken
          ? roomToken
          : generateAndPersistRoomToken();

        openLockedBoxState.actions.connect({
          boxTitle: data.boxTitle,
          encryptedMessage: data.encryptedMessage,
          key: data.key,
          keyHolderId: data.keyHolderId,
          keyHolders: data.keyHolders,
          keyThreshold: data.keyThreshold,
          roomToken: notEmptyRoomToken,
        });
      }
    },
    [
      isFollower,
      joinLockedBoxState.actions.connect,
      openLockedBoxState.actions.connect,
      roomToken,
      generateAndPersistRoomToken,
    ],
  );

  const handleFile = async (file: File) => {
    setError(null);
    setSuccess(null);
    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      setError("Only JSON files are supported.");
      return;
    }
    try {
      clearPersistedStartedUnlockingInfo();
      const text = await file.text();
      const data = JSON.parse(text);
      consumeLockedBox(data);
    } catch (_) {
      setError("Only JSON files are supported.");
    }
  };

  useDevExpAutoLockedBoxUpload({
    onAutoUpload: consumeLockedBox,
    skip: !!error,
  });

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    window.clearTimeout(dragLeaveTimeoutHandler.current);
    e.preventDefault();
    setIsDragOver(true);
  };

  const dragLeaveTimeoutHandler = useRef<number | undefined>(undefined);

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    window.clearTimeout(dragLeaveTimeoutHandler.current);
    e.preventDefault();
    // Only set isDragOver to false if we're actually leaving the drop zone
    // This prevents flickering when dragging over child elements
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      dragLeaveTimeoutHandler.current = window.setTimeout(() => {
        setIsDragOver(false);
      }, 250);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    (isFollower
      ? joinLockedBoxState.actions.reset
      : openLockedBoxState.actions.reset)();

    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener("dragover", handleGlobalDragOver);
    document.addEventListener("drop", handleGlobalDrop);

    return () => {
      document.removeEventListener("dragover", handleGlobalDragOver);
      document.removeEventListener("drop", handleGlobalDrop);
      clearTimeout(dragLeaveTimeoutHandler.current);
    };
  }, [
    joinLockedBoxState.actions.reset,
    openLockedBoxState.actions.reset,
    isFollower,
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-8">
        <Text variant="pageTitle" className="mt-4">
          {!isFollower && "Start Unlocking a Box"}
          {isFollower && "Join Unlocking a Box"}
        </Text>
        {isFollower && (
          <StartLeaderFollowerAlert
            className="self-stretch"
            followerAlertContent={
              <>
                You are going to <b>join</b> process of unlocking a box.
              </>
            }
            type={isFollower ? "follower" : "leader"}
            followerNavigateButtonText="Start unlocking instead"
            followerNavigateToLink="/unlock-box"
            leaderAlertContent={
              <>
                You are going to <b>start</b> process of unlocking a box.
              </>
            }
          />
        )}
        {!isFollower && (
          <Alert variant="info">
            You are going to <b>start</b> process of unlocking a box.
          </Alert>
        )}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className={`flex flex-col justify-center h-42 rounded-xl border-2 border-dashed shadow-md p-10 text-center transition-all duration-300 ease-in-out ${
            isDragOver
              ? "border-[var(--accent-9)] bg-[var(--accent-2)] bg-gradient-to-br shadow-lg border-3"
              : "border-gray-400 bg-gradient-to-br from-slate-50 to-slate-200 dark:from-gray-800 dark:to-gray-900"
          }`}
        >
          {error && <div className="text-red-600 mb-4">{error}</div>}
          {success && (
            <div className="text-green-600 mb-4">
              Secret box loaded successfully!
            </div>
          )}
          <div
            className={cn(
              "mb-3 transition-colors duration-300",
              isDragOver && "text-[var(--accent-9)] text-3xl",
            )}
          >
            {isDragOver
              ? "Drop your file here!"
              : "Please upload your locked box file"}
          </div>
          {!isDragOver && (
            <Button
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              className={`transition-transform duration-300 self-center ${isDragOver ? "scale-110" : ""}`}
            >
              Select File
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
        <div className="flex mt-8">
          <Link style={{ textDecoration: "none" }} to="/">
            <Button variant="secondary">Back</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
