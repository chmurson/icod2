import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import { CounterWithInfo } from "../../commons/components/CounterWithInfo";
import { OpenBoxButton as OpenBoxButtonDumb } from "../../commons/components/OpenBoxButton";
import { useShouldShowUnlockButton } from "../hooks";

export const TopLobbySection = () => {
  const { shouldShowUnlockButton } = useShouldShowUnlockButton();

  const keyThreshold = useJoinLockedBoxStore((state) => state.keyThreshold);
  const actions = useJoinLockedBoxStore((state) => state.actions);

  const onlineKeyHoldersCount = useJoinLockedBoxStore(
    (state) =>
      state.onlineKeyHolders.length + state.offLineKeyHolders.length + 1,
  );

  const unlockingStartDate = useJoinLockedBoxStore(
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
  const receivedKeysByKeyHolderId = useJoinLockedBoxStore(
    (state) => state.receivedKeysByKeyHolderId,
  );

  const key = useJoinLockedBoxStore((state) => state.key);

  const encryptedMessage = useJoinLockedBoxStore(
    (state) => state.encryptedMessage,
  );

  const keys = [...Object.values(receivedKeysByKeyHolderId ?? {}), key];

  return <OpenBoxButtonDumb encryptedMessage={encryptedMessage} keys={keys} />;
};
