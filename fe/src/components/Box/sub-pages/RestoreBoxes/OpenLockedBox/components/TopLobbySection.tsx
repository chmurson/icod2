import { useOpenLockedBoxStore } from "@/stores/boxStore";
import { CounterWithInfo } from "../../commons/components/CounterWithInfo";
import { OpenBoxButton as OpenBoxButtonDumb } from "../../commons/components/OpenBoxButton";
import { useShouldShowUnlockButton } from "../hooks/useShouldShowUnlockButton";

export const TopLobbySection = () => {
  const { shouldShowUnlockButton } = useShouldShowUnlockButton();

  const keyThreshold = useOpenLockedBoxStore((state) => state.keyThreshold);
  const actions = useOpenLockedBoxStore((state) => state.actions);

  const onlineKeyHoldersCount = useOpenLockedBoxStore(
    (state) =>
      state.onlineKeyHolders.length + state.offLineKeyHolders.length + 1,
  );

  const unlockingStartDate = useOpenLockedBoxStore(
    (state) => state.unlockingStartDate,
  );

  return (
    <>
      {!shouldShowUnlockButton && (
        <CounterWithInfo
          unlockingStartDate={unlockingStartDate}
          keyThreshold={keyThreshold}
          onlineKeyHoldersCount={onlineKeyHoldersCount}
          onFinish={() => actions.setReadyToUnlock()}
        />
      )}
      {shouldShowUnlockButton && <OpenBoxButton />}
    </>
  );
};

const OpenBoxButton = () => {
  const receivedKeysByKeyHolderId = useOpenLockedBoxStore(
    (state) => state.receivedKeysByKeyHolderId,
  );

  const key = useOpenLockedBoxStore((state) => state.key);

  const encryptedMessage = useOpenLockedBoxStore(
    (state) => state.encryptedMessage,
  );

  const keys = [...Object.values(receivedKeysByKeyHolderId ?? {}), key];

  return <OpenBoxButtonDumb encryptedMessage={encryptedMessage} keys={keys} />;
};
