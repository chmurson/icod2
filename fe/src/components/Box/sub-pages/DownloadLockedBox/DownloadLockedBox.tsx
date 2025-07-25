import { DownloadIcon } from "@radix-ui/react-icons";
import { TextArea } from "@radix-ui/themes";
import { useCallback, useState } from "react"; // Added useEffect
import { useNavigate } from "react-router-dom"; // Added useBlocker, useNavigate
import { HiddenTextArea } from "@/components/Box/components/HiddenTextArea";
import { ParticipantItem } from "@/components/Box/components/ParticipantItem";
import { useCreateBoxStore, useJoinBoxStore } from "@/stores";
import { Button } from "@/ui/Button";
import {
  NavigateAwayAlert,
  useNavigateAwayBlocker,
} from "@/ui/NavigateAwayAlert";
import { Text } from "@/ui/Typography";
import { ClosePageButton } from "./components";
import { useDownloadLockedBox, useDownloadLockedBoxState } from "./hooks";
import { useNaiveShowHiddenMessage } from "./hooks/useNaiveShowHiddenMessage";

export const DownloadLockedBox: React.FC = () => {
  const downloadLockedBoxState = useDownloadLockedBoxState();

  const createBoxReset = useCreateBoxStore((state) => state.actions.reset);
  const joinBoxReset = useJoinBoxStore((state) => state.actions.reset);

  const reset =
    downloadLockedBoxState.type === "fromCreateBox"
      ? createBoxReset
      : joinBoxReset;

  const { hideMessage, showMessage, visibleMessage } =
    useNaiveShowHiddenMessage();

  const navigate = useNavigate();

  const [isLockedBoxDownloaded, setIsLockedBoxDownloaded] = useState(false);

  const { downloadLockedBox, error: downloadError } = useDownloadLockedBox({
    onSuccess: () => setIsLockedBoxDownloaded(true),
  });

  const handleClickDownloadButton = () => {
    downloadLockedBox();
  };

  const resetAndNavigateAway = useCallback(() => {
    reset();
    navigate("/");
  }, [reset, navigate]);

  const shouldNavigationBeBlocked = useCallback(
    () => !isLockedBoxDownloaded,
    [isLockedBoxDownloaded],
  );

  const blocker = useNavigateAwayBlocker({
    shouldNavigationBeBlocked,
  });

  const [manuallyShowAlert, setManuallyShowAlert] = useState(false);

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
        {downloadLockedBoxState.type === "fromCreateBox" && (
          <div className="flex flex-col gap-1">
            <Text variant="label">Preview messae:</Text>
            <HiddenTextArea
              onShow={showMessage}
              onHide={hideMessage}
              value={visibleMessage}
              onChange={(e) => console.log(e.target.value)} // Example onChange
            >
              <TextArea rows={8} disabled />
            </HiddenTextArea>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-end">
          <Button variant="prominent" onClick={handleClickDownloadButton}>
            <DownloadIcon /> Download the Locked Box
          </Button>
          <ClosePageButton
            onClose={() => {
              if (shouldNavigationBeBlocked()) {
                setManuallyShowAlert(true);
                return;
              }
              resetAndNavigateAway();
            }}
          />
        </div>
        <div>
          {downloadError && (
            <Text variant="primaryError" color="crimson">
              Failed to download: {downloadError}
            </Text>
          )}
        </div>
      </div>
      <NavigateAwayAlert
        textTitle="The Locked Box is not downloaded"
        textDescription="Are you sure? This application will no longer be accessible, and you
        will lose your chance to download the Locked Box."
        open={blocker.state === "blocked" || manuallyShowAlert}
        onClose={() => {
          setManuallyShowAlert(false);
        }}
        onGoBack={() => {
          resetAndNavigateAway();
        }}
      />
    </div>
  );
};
