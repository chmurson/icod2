import { TextArea, TextField } from "@radix-ui/themes";
import type React from "react";
import { useEffect } from "react";
import { SharePreviewButton } from "@/components/Box/components/SharePreviewButton";
import { ContentCard } from "@/components/layout";
import { useDownloadBoxStore } from "@/stores";
import { Alert } from "@/ui/Alert";
import { Button } from "@/ui/Button.tsx";
import ErrorBoundary from "@/ui/ErrorBoundry";
import {
  NavigateAwayAlert,
  useNavigateAwayBlocker,
} from "@/ui/NavigateAwayAlert";
import { Text } from "@/ui/Typography";
import { FieldArea } from "../../../components/FieldArea";
import { InputNumber } from "../../../components/InputNumber";
import { ParticipantItem } from "../../../components/ParticipantItem";
import { useCreateBoxConnectionContext } from "../CreateBoxConnectionProvider/CreateBoxConnectionProvider";
import { LeaveLobbyButton } from "../commons/components";
import { router } from "./dataChannelRouter";
import { useDataChannelSendMessages } from "./dataChannelSendMessage";
import {
  useBoxCreationValidation,
  useCreateLockedBox,
  useKeepKeyHoldersUpdated,
  usePartOfCreateBoxStore,
  useShareableURL,
} from "./hooks";

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
  const context = useCreateBoxConnectionContext();

  useEffect(() => {
    context.addRouter("create-box-router", router);

    return () => {
      context.removeRouter("create-box-router");
    };
  }, [context.addRouter, context.removeRouter]);

  const { state, actions } = usePartOfCreateBoxStore();
  const setDownloadStoreFromCreateBox = useDownloadBoxStore(
    (state) => state.fromCreateBox,
  );

  const { sendLockedBoxes } = useDataChannelSendMessages({
    dataChannelManagerRef: context.dataChannelMngRef,
  });

  const { createLockedBox } = useCreateLockedBox();

  const { getError, handleBoxCreationValidation } = useBoxCreationValidation({
    onValid: async (payload) => {
      const { encryptedMessage, keys } = await createLockedBox(payload);
      const [leaderKey, ...restOfKeys] = keys;
      sendLockedBoxes({ encryptedMessage, keys: restOfKeys });
      setDownloadStoreFromCreateBox({ encryptedMessage, key: leaderKey });
    },
  });

  useKeepKeyHoldersUpdated(context.dataChannelMngRef);

  const noParticipantConnected = state.keyHolders.length === 0;

  const shareableURL = useShareableURL();

  const blocker = useNavigateAwayBlocker({
    shouldNavigationBeBlocked: () => true,
  });

  return (
    <>
      <div className="flex flex-col gap-4">
        <FieldArea label="Invite URL">
          <TextField.Root value={shareableURL} readOnly />
        </FieldArea>
        <FieldArea label="Name of the box">
          <TextField.Root
            id="title"
            type="text"
            value={state.title}
            onChange={(e) => actions.setBoxInfo({ title: e.target.value })}
            className="max-w-md w-full"
            disabled={state.status === "creating"}
          />
          {getError("title") && (
            <Text variant="primaryError">{getError("title")}</Text>
          )}
        </FieldArea>
        <FieldArea label="Content: ">
          <TextArea
            id="content"
            value={state.content}
            onChange={(e) => actions.setBoxInfo({ content: e.target.value })}
            rows={10}
            className="w-full"
            disabled={state.status === "creating"}
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
            value={state.threshold}
            onChange={(e) =>
              actions.setBoxInfo({
                threshold: Number.parseInt(e.currentTarget.value),
              })
            }
            disabled={state.status === "creating"}
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
              <Text variant="secondaryText" className="text-sm">
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
                    className="max-sm:text-xs max-sm:h-6"
                    checked={!!state.contentPreviewSharedWith[p.id]}
                    onToggle={(checked) =>
                      actions.setContentPreviewSharedWith(p.id, checked)
                    }
                    disabled={state.status === "creating"}
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
      <div className="flex justify-end mb-4">
        <Button
          variant="prominent"
          className="px-20 max-sm:w-full"
          onClick={() =>
            handleBoxCreationValidation({
              content: state.content,
              keyHolders: state.keyHolders,
              threshold: state.threshold,
              title: state.title,
            })
          }
          disabled={noParticipantConnected}
          loading={state.status === "creating"}
        >
          Create Box
        </Button>
      </div>
      <ContentCard.OutsideSlot asChild>
        <LeaveLobbyButton>Leave lobby</LeaveLobbyButton>
      </ContentCard.OutsideSlot>
      <NavigateAwayAlert
        open={blocker.state === "blocked"}
        textTitle="Critical action required as Leader"
        textDescription="You are the Leader of this Box and your action is critical. Leaving now could affect other participants. Are you sure you want to navigate away?"
        onGoBack={() => blocker.proceed?.()}
        onClose={() => blocker.reset?.()}
      />
    </>
  );
};

export default CreateBox;
