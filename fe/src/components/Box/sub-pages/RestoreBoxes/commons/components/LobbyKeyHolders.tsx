import { type ComponentType, type FC, type ReactNode, useMemo } from "react";
import {
  ParticipantItemAvatar,
  ParticipantItemDescription,
} from "@/components/Box/components/ParticipantItem";
import { ShareAccessButton as ShareAccessButtonDumb } from "@/components/Box/components/ShareAccessButton";
import type {
  LockedBoxStoreCommonPart,
  ParticipantType,
} from "@/stores/boxStore/common-types";
import { Text } from "@/ui/Typography";
import { cn } from "@/utils/cn";
import { useTailwindBreakpoints } from "@/utils/useTailwindBreakpoints";
import tokenSvg from "./assets/token.svg";
import { AltProminentBadgeButton } from "./BoxUnlockedButtonBadge";
import { ConnectingLabel } from "./ConnectingLabel";
import { DisconnectedLabel } from "./DisconnectedLabel";
import { MissingOneKeyLabel } from "./MIssingOneKeyLabel";
import { ReadyToUnlockLabel } from "./ReadyToUnlockLabel";

export const LoobbyKeyHolders: FC<{
  status: LockedBoxStoreCommonPart["state"];
  you: ParticipantType & { isLeader?: boolean };
  onlineKeyHolders: ParticipantType[];
  offLineKeyHolders: ParticipantType[];
  possibleKeyHolders: ParticipantType[];
  shareAccessKeyMapByKeyHolderId: Record<string, Record<string, boolean>>;
  keyThreshold: number;
  ShareAccesKeyAvatars: ComponentType<{
    keyHolderId: string;
    isYou?: boolean;
    possibleKeyHolders: ParticipantType[];
  }>;
  ShareAccessDropdown: ComponentType<{
    onlineKeyHolders: ParticipantType[];
    shortText?: boolean;
  }>;
  ShareAccessButton: ComponentType<{
    keyHolderId: string;
    shortText?: boolean;
  }>;
}> = ({
  status,
  offLineKeyHolders,
  onlineKeyHolders,
  possibleKeyHolders,
  you,
  shareAccessKeyMapByKeyHolderId,
  keyThreshold,
  ShareAccesKeyAvatars,
  ShareAccessDropdown,
  ShareAccessButton,
}) => {
  const { isMaxSm } = useTailwindBreakpoints();
  const labelType = isReadyToUnlockAndMissingOne(
    shareAccessKeyMapByKeyHolderId,
    keyThreshold,
    you.id,
  );
  const finalLabelType = useMemo(() => {
    if (status === "connecting") {
      return "is-connecting";
    }
    return labelType;
  }, [labelType, status]);
  const isReadyToUnLockStatus = status === "ready-to-unlock";

  return (
    <div className="flex flex-col gap-12">
      <div className="grid grid-cols-[minmax(360px,_1fr)_1fr] max-sm:grid-cols-[1fr]">
        <div className="col-span-full py-1">
          <Text variant="label">Your access key</Text>
        </div>
        <ParticipantRow
          label={finalLabelType}
          name={you.name}
          userAgent={you.userAgent}
          shareAcceessKeyAvatarsSlot={
            <ShareAccesKeyAvatars
              isYou
              keyHolderId={you.id}
              possibleKeyHolders={possibleKeyHolders}
            />
          }
          shareButtonSlot={
            <>
              {!isReadyToUnLockStatus && (
                <ShareAccessDropdown
                  onlineKeyHolders={onlineKeyHolders}
                  shortText={isMaxSm}
                />
              )}
              {isReadyToUnLockStatus && labelType === "is-ready-to-unlock" && (
                <BoxUnlockedBadgeButton />
              )}
            </>
          }
        />

        {onlineKeyHolders.length > 0 && (
          <div className="col-span-full py-1 mb-1 mt-12">
            <Text variant="label">Online keyholders:</Text>
          </div>
        )}
        {onlineKeyHolders.length !== 0 &&
          onlineKeyHolders.map((kh) => {
            const labelType = isReadyToUnlockAndMissingOne(
              shareAccessKeyMapByKeyHolderId,
              keyThreshold,
              kh.id,
            );

            return (
              <ParticipantRow
                key={kh.id}
                name={kh.name}
                label={labelType}
                userAgent={kh.userAgent}
                shareAcceessKeyAvatarsSlot={
                  <ShareAccesKeyAvatars
                    keyHolderId={kh.id}
                    possibleKeyHolders={possibleKeyHolders}
                  />
                }
                shareButtonSlot={
                  <>
                    {!isReadyToUnLockStatus && (
                      <ShareAccessButton
                        keyHolderId={kh.id}
                        shortText={isMaxSm}
                      />
                    )}
                    {isReadyToUnLockStatus &&
                      labelType === "is-ready-to-unlock" && (
                        <BoxUnlockedBadgeButton />
                      )}
                  </>
                }
              />
            );
          })}
        <div className="col-span-full py-1 mt-12">
          <Text variant="label">Offline key holders:</Text>
        </div>
        {offLineKeyHolders.length === 0 && (
          <div className="col-span-full py-1">
            <Text variant="secondaryText" className="text-sm">
              All key holders are online
            </Text>
          </div>
        )}
        {offLineKeyHolders.map((kh) => (
          <ParticipantRow
            key={kh.id}
            name={kh.name}
            userAgent={kh.userAgent}
            shareAcceessKeyAvatarsSlot={
              <ShareAccesKeyAvatars
                keyHolderId={kh.id}
                possibleKeyHolders={possibleKeyHolders}
              />
            }
            shareButtonSlot={
              <ShareAccessButtonDumb
                checked={false}
                disabled
                shortText={isMaxSm}
              />
            }
          />
        ))}
      </div>
    </div>
  );
};

const ParticipantRow = (props: {
  name: string;
  userAgent: string;
  label?:
    | "is-missing-one"
    | "is-ready-to-unlock"
    | "is-connecting"
    | "is-disconnected";
  shareButtonSlot: ReactNode;
  shareAcceessKeyAvatarsSlot: ReactNode;
}) => {
  const {
    label,
    name,
    shareButtonSlot,
    userAgent,
    shareAcceessKeyAvatarsSlot,
  } = props;

  return (
    <>
      <div className="py-3 pr-4 border-b border-gray-200 dark:border-gray-700 flex gap-2 just-be max-sm:pr-0 max-sm:border-0 max-sm:py-1 max-sm:pt-4 max-sm:overflow-hidden max-sm:max-w-full justify-between">
        <div className="flex gap-4  min-w-0 overflow-hidden shrink max-sm:gap-2">
          <ParticipantItemAvatar name={name} />
          <ParticipantItemDescription name={name} ua={userAgent} />
        </div>
        <div className="flex items-center shrink-0">
          {label === "is-missing-one" && <MissingOneKeyLabel />}
          {label === "is-ready-to-unlock" && <ReadyToUnlockLabel />}
          {label === "is-disconnected" && <DisconnectedLabel />}
          {label === "is-connecting" && <ConnectingLabel />}
        </div>
      </div>
      <div
        className={cn(
          "py-3 border-b  border-gray-200 dark:border-gray-700 flex gap-2 items-center justify-between max-sm:py-1 max-sm:pb-4 max-sm:overflow-hidden max-sm:max-w-full",
        )}
      >
        {shareAcceessKeyAvatarsSlot}
        {shareButtonSlot}
      </div>
    </>
  );
};

const isReadyToUnlockAndMissingOne = (
  shareAccessKeyMapByKeyHolderId: Record<string, Record<string, boolean>>,
  keyThreshold: number,
  keyHolderId: string,
) => {
  const numberOfAccesses = Object.entries(
    shareAccessKeyMapByKeyHolderId ?? {},
  ).filter(([_, withWhoMap]) => {
    return withWhoMap[keyHolderId] === true;
  }).length;
  const fullAmountOfKeys = numberOfAccesses + 1;
  const isReadyToUnlock = fullAmountOfKeys >= keyThreshold;
  if (isReadyToUnlock) {
    return "is-ready-to-unlock";
  }
  const isMissingOne = fullAmountOfKeys === keyThreshold - 1;
  if (isMissingOne) {
    return "is-missing-one";
  }

  return;
};

const BoxUnlockedBadgeButton = () => (
  <AltProminentBadgeButton>
    <img height={16} width={16} src={tokenSvg} alt="box-logo" />
    Box unlocked
  </AltProminentBadgeButton>
);
