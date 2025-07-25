import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import { Text } from "@/ui/Typography";
import { useGetTopLobbyMetaStatus } from "../../commons";
import { LoadingTextReceiveingKeys } from "../../commons/components";
import { CounterWithInfo } from "../../commons/components/CounterWithInfo";
import { OpenBoxButton as OpenBoxButtonDumb } from "../../commons/components/OpenBoxButton";

export const TopLobbySection = () => {
  const metaStatus = useGetTopLobbyMetaStatus(useJoinLockedBoxStore);

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
  const receivedKeysByKeyHolderId = useJoinLockedBoxStore(
    (state) => state.receivedKeysByKeyHolderId,
  );

  const key = useJoinLockedBoxStore((state) => state.key);

  const encryptedMessage = useJoinLockedBoxStore(
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
