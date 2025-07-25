import type { ComponentType, FC } from "react";
import { Fragment } from "react/jsx-runtime";
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

export const LoobbyKeyHolders: FC<{
  status: LockedBoxStoreCommonPart["state"];
  you: ParticipantType;
  onlineKeyHolders: ParticipantType[];
  offLineKeyHolders: ParticipantType[];
  possibleKeyHolders: ParticipantType[];
  ShareAccesKeyAvatars: ComponentType<{
    keyHolderId: string;
    possibleKeyHolders: ParticipantType[];
  }>;
  ShareAccessDropdown: ComponentType<{
    onlineKeyHolders: ParticipantType[];
  }>;
  ShareAccessButton: ComponentType<{
    keyHolderId: string;
  }>;
}> = ({
  status,
  offLineKeyHolders,
  onlineKeyHolders,
  possibleKeyHolders,
  you,
  ShareAccesKeyAvatars,
  ShareAccessDropdown,
  ShareAccessButton,
}) => {
  const hideShareButtons = status === "ready-to-unlock";

  return (
    <div className="flex flex-col gap-12">
      <div className="grid grid-cols-[60px_200px_120px_1fr_200px]">
        <div className="col-span-full py-1">
          <Text variant="label">Your access key</Text>
        </div>
        <div className="py-3 border-b  border-gray-200 dark:border-gray-700">
          <ParticipantItemAvatar name={you.name} />
        </div>
        <div className="py-3 border-b  border-gray-200 dark:border-gray-700">
          <ParticipantItemDescription name={you.name} ua={you.userAgent} />
        </div>
        <div className="py-3 border-b  border-gray-200 dark:border-gray-700 flex items-center">
          <Text variant="secondaryText" className="text-sm">
            Ready to unlock
          </Text>
        </div>
        <div className="py-3 border-b  border-gray-200 dark:border-gray-700 flex items-center">
          <ShareAccesKeyAvatars
            keyHolderId={you.id}
            possibleKeyHolders={possibleKeyHolders}
          />
        </div>
        <div className="flex justify-end items-center py-3 border-b  border-gray-200 dark:border-gray-700 ">
          {!hideShareButtons && (
            <ShareAccessDropdown onlineKeyHolders={onlineKeyHolders} />
          )}
        </div>
        {onlineKeyHolders.length > 0 && (
          <div className="col-span-full py-1 mb-1 mt-12">
            <Text variant="label">Online keyholders:</Text>
          </div>
        )}
        {onlineKeyHolders.length !== 0 &&
          onlineKeyHolders.map((kh) => (
            <Fragment key={kh.id}>
              <div className="py-3 border-b  border-gray-200 dark:border-gray-700">
                <ParticipantItemAvatar name={kh.name} />
              </div>
              <div className="py-3 border-b  border-gray-200 dark:border-gray-700">
                <ParticipantItemDescription name={kh.name} ua={kh.userAgent} />
              </div>
              <div className="py-3 border-b  border-gray-200 dark:border-gray-700 flex items-center">
                <Text variant="secondaryText" className="text-sm">
                  Ready to unlock
                </Text>
              </div>
              <div className="py-3 border-b  border-gray-200 dark:border-gray-700 flex items-center">
                <ShareAccesKeyAvatars
                  keyHolderId={kh.id}
                  possibleKeyHolders={possibleKeyHolders}
                />
              </div>
              <div className="flex justify-end items-center py-3 border-b  border-gray-200 dark:border-gray-700">
                {!hideShareButtons && <ShareAccessButton keyHolderId={kh.id} />}
              </div>
            </Fragment>
          ))}
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
          <Fragment key={kh.id}>
            <div className="py-3 border-b  border-gray-200 dark:border-gray-700">
              <ParticipantItemAvatar name={kh.name} />
            </div>
            <div className="py-3 border-b  border-gray-200 dark:border-gray-700">
              <ParticipantItemDescription name={kh.name} ua={kh.userAgent} />
            </div>
            <div className="py-3 border-b  border-gray-200 dark:border-gray-700 flex items-center">
              <Text variant="secondaryText" className="text-sm">
                Ready to unlock
              </Text>
            </div>
            <div className="py-3 border-b  border-gray-200 dark:border-gray-700 flex items-center">
              <ShareAccesKeyAvatars
                keyHolderId={kh.id}
                possibleKeyHolders={possibleKeyHolders}
              />
            </div>
            <div className="flex justify-end items-center py-3 border-b  border-gray-200 dark:border-gray-700">
              {!hideShareButtons && (
                <ShareAccessButtonDumb checked={false} disabled />
              )}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
};
