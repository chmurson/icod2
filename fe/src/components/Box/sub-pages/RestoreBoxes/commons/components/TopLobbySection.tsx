import type { StoreApi, UseBoundStore } from "zustand";
import type { LockedBoxStoreCommonPart } from "@/stores/boxStore/common-types";
import { Text } from "@/ui/Typography";
import { cn } from "@/utils/cn";
import {
  LoadingTextReceiveingKeys,
  useGetTopLobbyMetaStatus,
} from "../../commons";
import { CounterWithInfo } from "../../commons/components/CounterWithInfo";
import { OpenBoxButton as OpenBoxButtonDumb } from "../../commons/components/OpenBoxButton";

type StoreStateSubset = LockedBoxStoreCommonPart;

type StoreHookType = UseBoundStore<StoreApi<StoreStateSubset>>;

export const TopLobbySection = ({
  useStoreHook,
}: {
  useStoreHook: StoreHookType;
}) => {
  const metaStatus = useGetTopLobbyMetaStatus(useStoreHook);

  const keyThreshold = useStoreHook((state) => state.keyThreshold);
  const actions = useStoreHook((state) => state.actions);

  const onlineKeyHoldersCount = useStoreHook(
    (state) =>
      state.onlineKeyHolders.length + state.offLineKeyHolders.length + 1,
  );

  const unlockingStartDate = useStoreHook((state) => state.unlockingStartDate);

  return (
    <>
      {(metaStatus === "not-ready-to-unlock" ||
        metaStatus === "keyholder-not-able-to-unlock") && (
        <CounterWithInfo
          unlockingStartDate={unlockingStartDate}
          keyThreshold={keyThreshold}
          onlineKeyHoldersCount={onlineKeyHoldersCount}
          onFinish={() => actions.setReadyToUnlock()}
          timeClassName={cn(
            metaStatus === "keyholder-not-able-to-unlock" && "opacity-25",
          )}
          textReplacement={
            metaStatus === "keyholder-not-able-to-unlock" ? (
              <Text variant="label" className="text-red-400">
                Not enough key holders have shared their keys to unlock the box
              </Text>
            ) : null
          }
        />
      )}
      <div className="flex flex-col gap-4">
        {(metaStatus === "keyholder-able-to-unlock" ||
          metaStatus === "keyholder-not-yet-able-to-unlock") && (
          <OpenBoxButton
            useStoreHook={useStoreHook}
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
const OpenBoxButton = ({
  disabled = false,
  useStoreHook,
}: {
  disabled?: boolean;
  useStoreHook: StoreHookType;
}) => {
  const receivedKeysByKeyHolderId = useStoreHook(
    (state) => state.receivedKeysByKeyHolderId,
  );

  const key = useStoreHook((state) => state.key);

  const encryptedMessage = useStoreHook((state) => state.encryptedMessage);

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
