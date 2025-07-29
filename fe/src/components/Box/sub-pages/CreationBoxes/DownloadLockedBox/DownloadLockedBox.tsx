import { DownloadIcon } from "@radix-ui/react-icons";
import { useCallback, useEffect, useState } from "react"; // Added useEffect
import { ParticipantItem } from "@/components/Box/components/ParticipantItem";
import { ContentCard } from "@/components/layout";
import {
  useCreateBoxStore,
  useDownloadBoxStore,
  useJoinBoxStore,
} from "@/stores";
import { Button } from "@/ui/Button";
import {
  NavigateAwayAlert,
  useNavigateAwayBlocker,
} from "@/ui/NavigateAwayAlert";
import { Text } from "@/ui/Typography";
import { LeaveLobbyButton } from "../commons/components";
import { useDownloadLockedBox, useDownloadLockedBoxState } from "./hooks";

export const DownloadLockedBox: React.FC = () => {
  const downloadLockedBoxState = useDownloadLockedBoxState();
  const clearKeyAndMessage = useDownloadBoxStore(
    (state) => state.clearKeyAndMessage,
  );

  const createBoxReset = useCreateBoxStore((state) => state.actions.reset);
  const joinBoxReset = useJoinBoxStore((state) => state.actions.reset);

  const resetPreviousStepStore =
    downloadLockedBoxState.type === "fromCreateBox"
      ? createBoxReset
      : joinBoxReset;

  useEffect(() => {
    resetPreviousStepStore();
  }, [resetPreviousStepStore]);

  const [isLockedBoxDownloaded, setIsLockedBoxDownloaded] = useState(false);

  const { downloadLockedBox, error: downloadError } = useDownloadLockedBox({
    onSuccess: () => setIsLockedBoxDownloaded(true),
    onPrepared: () => clearKeyAndMessage(),
  });

  const handleClickDownloadButton = () => {
    downloadLockedBox();
  };

  const shouldNavigationBeBlocked = useCallback(
    () => !isLockedBoxDownloaded,
    [isLockedBoxDownloaded],
  );

  const blocker = useNavigateAwayBlocker({
    shouldNavigationBeBlocked,
  });

  return (
    <div className="flex flex-col gap-8">
      <Text variant="pageTitle" className="mt-4">
        Locked Box
      </Text>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 items-center">
          <Text variant="label">Name:</Text>
          <Text variant="primaryText">{downloadLockedBoxState.title}</Text>
        </div>
        <div className="flex gap-2 items-center">
          <Text variant="label">Key Treshold:</Text>
          <Text variant="primaryText">{downloadLockedBoxState.threshold}</Text>
        </div>
        <div className="flex flex-col gap-1">
          {!downloadLockedBoxState.you && (
            <Text variant="label">You - leader:</Text>
          )}
          {downloadLockedBoxState.you && <Text variant="label">Leader:</Text>}
          <ParticipantItem
            name={downloadLockedBoxState.leader.name}
            userAgent={downloadLockedBoxState.leader.userAgent}
          />
        </div>
        {downloadLockedBoxState.you && (
          <div className="flex flex-col gap-1">
            <Text variant="label">You:</Text>
            <ParticipantItem
              name={downloadLockedBoxState.you.name}
              userAgent={downloadLockedBoxState.you.userAgent}
            />
          </div>
        )}
        {!downloadLockedBoxState.you && (
          <div className="flex flex-col gap-1">
            <Text variant="label">Keyholders:</Text>
            <div>
              {downloadLockedBoxState.keyHolders.map((p) => (
                <ParticipantItem
                  key={p.id}
                  name={p.name}
                  userAgent={p.userAgent}
                />
              ))}
            </div>
          </div>
        )}
        {downloadLockedBoxState.you &&
          downloadLockedBoxState.otherKeyHolders.length > 0 && (
            <div className="flex flex-col gap-1">
              <Text variant="label">Other keyholders:</Text>
              <div>
                {downloadLockedBoxState.otherKeyHolders.map((p) => (
                  <ParticipantItem
                    key={p.id}
                    name={p.name}
                    userAgent={p.userAgent}
                  />
                ))}
              </div>
            </div>
          )}
      </div>
      <div className="flex flex-col gap-1 items-end mb-4">
        <div className="inline-flex max-sm:w-full">
          <Button
            variant="prominent"
            onClick={handleClickDownloadButton}
            className="max-sm:w-full"
          >
            <DownloadIcon /> Download the Locked Box
          </Button>
          <div>
            {downloadError && (
              <Text variant="primaryError" color="crimson">
                Failed to download: {downloadError}
              </Text>
            )}
          </div>
        </div>
      </div>
      <ContentCard.OutsideSlot asChild>
        <LeaveLobbyButton>Back to Homepage</LeaveLobbyButton>
      </ContentCard.OutsideSlot>
      <NavigateAwayAlert
        textTitle="The Locked Box is not downloaded"
        textDescription="Are you sure? This application will no longer be accessible, and you
        will lose your chance to download the Locked Box."
        open={blocker.state === "blocked"}
        onClose={() => {
          blocker.reset?.();
        }}
        onGoBack={() => {
          blocker.proceed?.();
        }}
      />
    </div>
  );
};
