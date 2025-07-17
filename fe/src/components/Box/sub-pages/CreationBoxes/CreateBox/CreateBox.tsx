import { TextArea, TextField } from "@radix-ui/themes";
import type React from "react";
import { useEffect, useState } from "react";
import { leaderService } from "@/services/web-rtc/leaderSingleton";
import { useDownloadBoxStore } from "@/stores";
import { Button } from "@/ui/Button.tsx";
import { Text } from "@/ui/Typography";
import { FieldArea } from "../../../components/FieldArea";
import { InputNumber } from "../../../components/InputNumber";
import { ParticipantItem } from "../../../components/ParticipantItem";
import { usePartOfCreateBoxStore } from "./hooks";
import { useLockBox } from "./hooks/useHandleBoxCreation";
import { useCreateBoxConnection } from "./useCreateBoxConnection";

export const CreateBox: React.FC = () => {
  const { state, actions, getError, validate } = usePartOfCreateBoxStore();

  const [localTitle, setLocalTitle] = useState(state.title);
  const [localContent, setLocalContent] = useState(state.content);
  const [localThreshold, setLocalThreshold] = useState(state.threshold);
  const [isContentSharedToPeer, setIsContentSharedToPeer] = useState<
    Record<string, boolean>
  >({});

  const { sendBoxUpdate, sendBoxCreated } = useCreateBoxConnection();
  const { handleBoxCreation } = useLockBox();

  useEffect(() => {
    const timeoutHandler = setTimeout(() => {
      actions.setBoxInfo({
        title: localTitle,
        content: localContent,
        threshold: localThreshold,
      });
    }, 250);

    sendBoxUpdate({
      keyHolderTreshold: localThreshold,
      title: localTitle,
    });

    return () => clearTimeout(timeoutHandler);
  }, [
    localTitle,
    localContent,
    localThreshold,
    actions.setBoxInfo,
    sendBoxUpdate,
  ]);

  const noParticipantConnected = state.keyHolders.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <Text variant="pageTitle" className="mt-4">
        Create a box
      </Text>
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
          <div className="flex flex-col gap-1.5">
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
                isContentShared={!!isContentSharedToPeer[p.id]}
                onContentShareChange={(checked) => {
                  setIsContentSharedToPeer((prev) => ({
                    ...prev,
                    [p.id]: checked,
                  }));
                }}
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
    </div>
  );
};

export default CreateBox;
