import { useOpenLockedBoxStore } from "@/stores/boxStore";
import { Text } from "@/ui/Typography";
import {
  LoadingTextReceiveingKeys,
  useGetTopLobbyMetaStatus,
} from "../../commons";
import { CounterWithInfo } from "../../commons/components/CounterWithInfo";
import { OpenBoxButton as OpenBoxButtonDumb } from "../../commons/components/OpenBoxButton";

export const TopLobbySection = () => {
  const metaStatus = useGetTopLobbyMetaStatus(useOpenLockedBoxStore);

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
      {(metaStatus === "not-ready-to-unlock" ||
        metaStatus === "keyholder-not-able-to-unlock") && (
        <CounterWithInfo
          unlockingStartDate={unlockingStartDate}
          keyThreshold={keyThreshold}
          onlineKeyHoldersCount={onlineKeyHoldersCount}
          onFinish={() => actions.setReadyToUnlock()}
        />
      )}
      <div className="flex flex-col gap-4">
        {(metaStatus === "keyholder-able-to-unlock" ||
          metaStatus === "keyholder-not-yet-able-to-unlock") && (
          <OpenBoxButton
            disabled={metaStatus === "keyholder-not-yet-able-to-unlock"}
          />
        )}
        {metaStatus === "keyholder-able-to-unlock" && (
          <Text variant="secondaryText" className="self-center">
            All keys collected - ready to unlock
          </Text>
        )}
        {metaStatus === "keyholder-not-yet-able-to-unlock" && (
          <LoadingTextReceiveingKeys />
        )}
      </div>
    </>
  );
};
const OpenBoxButton = ({ disabled = false }: { disabled?: boolean }) => {
  const receivedKeysByKeyHolderId = useOpenLockedBoxStore(
    (state) => state.receivedKeysByKeyHolderId,
  );

  const key = useOpenLockedBoxStore((state) => state.key);

  const encryptedMessage = useOpenLockedBoxStore(
    (state) => state.encryptedMessage,
  );

  const keys = [...Object.values(receivedKeysByKeyHolderId ?? {}), key];

  return (
    <OpenBoxButtonDumb
      encryptedMessage={encryptedMessage}
      keys={keys}
      disabled={disabled}
      className={disabled ? "cursor-wait" : ""}
    />
  );
};
