import { TextArea, TextField } from "@radix-ui/themes";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { SharePreviewButton } from "@/components/Box/components/SharePreviewButton";
import { Alert } from "@/ui/Alert";
import { Button } from "@/ui/Button.tsx";
import ErrorBoundary from "@/ui/ErrorBoundry";
import { Text } from "@/ui/Typography";
import { FieldArea } from "../../../components/FieldArea";
import { InputNumber } from "../../../components/InputNumber";
import { ParticipantItem } from "../../../components/ParticipantItem";
import { usePartOfCreateBoxStore } from "./hooks";
import { useLockBox } from "./hooks/useHandleBoxCreation";
import { useCreateBoxConnection } from "./useCreateBoxConnection";

export const CreateBox = () => {
  return (
    <div className="flex flex-col gap-6">
      <Text variant="pageTitle" className="mt-4">
        Create a box
      </Text>
      <ErrorBoundary
        fallback={({ handleRetry, isRetrying }) => (
          <div className="flex flex-col gap-4">
            <Alert variant="error">Something went wrong</Alert>
            <Button
              variant="primary"
              onClick={handleRetry}
              className="self-start"
              loading={isRetrying}
            >
              Try to connect again
            </Button>
          </div>
        )}
      >
        <CreateBoxContent />
      </ErrorBoundary>
    </div>
  );
};

export const CreateBoxContent: React.FC = () => {
  const { state, actions, getError, validate } = usePartOfCreateBoxStore();

  const [localTitle, setLocalTitle] = useState(state.title);
  const [localContent, setLocalContent] = useState(state.content);
  const [localThreshold, setLocalThreshold] = useState(state.threshold);
  const [isContentSharedToPeer, setIsContentSharedToPeer] = useState<
    Record<string, boolean>
  >({});

  const { sendBoxUpdate, sendBoxLocked, sendKeyholdersUpdate } =
    useCreateBoxConnection();
  const { lockBox } = useLockBox();

  const keyHoldersRef = useRef(state.keyHolders);

  useEffect(() => {
    keyHoldersRef.current = state.keyHolders;
    sendKeyholdersUpdate(state.keyHolders);
  }, [state.keyHolders, sendKeyholdersUpdate]);

  useEffect(() => {
    keyHoldersRef.current.forEach((keyHolder) => {
      const isContentShared = isContentSharedToPeer[keyHolder.id] === true;
      sendBoxUpdate({
        id: keyHolder.id,
        title: state.title,
        keyHolderThreshold: state.threshold,
        content: isContentShared ? state.content : undefined,
        isContentShared,
      });
    });
  }, [
    state.content,
    state.threshold,
    state.title,
    isContentSharedToPeer,
    sendBoxUpdate,
  ]);

  useEffect(() => {
    const timeoutHandler = setTimeout(() => {
      actions.setBoxInfo({
        title: localTitle,
        content: localContent,
        threshold: localThreshold,
      });
    }, 250);

    return () => clearTimeout(timeoutHandler);
  }, [localTitle, localContent, localThreshold, actions.setBoxInfo]);

  const noParticipantConnected = state.keyHolders.length === 0;

  const handleBoxCreation = async () => {
    const isValid = validate();
    if (!isValid) {
      return;
    }

    const { encryptedMessage, key, keys } = lockBox();
    const notLeaderKeys = keys.filter((k) => k !== key);
    state.keyHolders.forEach((keyHolder) => {
      const key = notLeaderKeys.shift();

      if (!key) {
        console.error("No key available for keyHolder:", keyHolder.id);
        return;
      }

      if (key) {
        sendBoxLocked({
          localPeerID: keyHolder.id,
          key,
          encryptedMessage,
        });
      }
    });
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <FieldArea label="Name of the box">
          <TextField.Root
            id="title"
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            className="max-w-md w-full"
          />
          {getError("title") && (
            <Text variant="primaryError">{getError("title")}</Text>
          )}
        </FieldArea>
        <FieldArea label="Content: ">
          <TextArea
            id="content"
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            rows={10}
            className="w-full"
          />
          {getError("content") && (
            <Text variant="primaryError">{getError("content")}</Text>
          )}
        </FieldArea>
        <FieldArea label="Key Threshold:">
          <InputNumber
            min={1}
            defaultValue={1}
            max={10}
            onChange={(e) =>
              setLocalThreshold(Number.parseInt(e.currentTarget.value))
            }
            className="min-w-10"
          />
          {getError("threshold") && (
            <Text variant="primaryError">{getError("threshold")}</Text>
          )}
        </FieldArea>
        <FieldArea label="You - leader">
          <ParticipantItem
            name={state.leader.name}
            userAgent={state.leader.userAgent}
          />
        </FieldArea>
        <FieldArea label="KeyHolders: ">
          <div className="flex flex-col gap-1.5 w-full">
            {state.keyHolders.length === 0 && (
              <Text variant="secondaryText">
                No key holders yet. Waiting for others to join...
              </Text>
            )}
            {state.keyHolders.map((p) => (
              <ParticipantItem
                key={p.id}
                name={p.name}
                userAgent={p.userAgent}
                buttonSlot={
                  <SharePreviewButton
                    checked={!!isContentSharedToPeer[p.id]}
                    onToggle={(checked) =>
                      setIsContentSharedToPeer((prev) => ({
                        ...prev,
                        [p.id]: checked,
                      }))
                    }
                  />
                }
              />
            ))}
          </div>
          {getError("keyHolders") && (
            <Text variant="primaryError">{getError("keyHolders")}</Text>
          )}
        </FieldArea>
      </div>
      <div>
        <Button
          variant="prominent"
          onClick={handleBoxCreation}
          disabled={noParticipantConnected}
        >
          Create Box
        </Button>
      </div>
    </>
  );
};

export default CreateBox;
