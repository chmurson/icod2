import { Avatar } from "@radix-ui/themes";
import type { FC, ReactNode } from "react";
import { Text } from "@/ui/Typography";
import { UserAgent } from "./UserAgent";

export const ParticipantItem = ({
  name,
  userAgent,
  buttonSlot,
  sharedKeysSlot,
}: {
  name: string;
  userAgent: string;
  sharedKeysSlot?: ReactNode;
  buttonSlot?: ReactNode;
}) => {
  return (
    <div className="flex gap-4 items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
      <div className="flex gap-3 items-center">
        <ParticipantItemAvatar name={name} />
        <ParticipantItemDescription name={name} ua={userAgent} />
      </div>
      {sharedKeysSlot}
      {buttonSlot}
    </div>
  );
};

export const ParticipantItemAvatar: FC<{ name: string }> = ({ name }) => {
  return (
    <Avatar
      fallback={name[0]}
      radius="full"
      variant="soft"
      style={{ height: 48, width: 48 }}
    />
  );
};

export const ParticipantItemDescription: FC<{ name: string; ua: string }> = ({
  name,
  ua,
}) => {
  return (
    <div className="flex flex-col py-1">
      <div className="flex items-center gap-2">
        {name.trim() && (
          <Text
            variant="primaryText"
            className="font-semibold text-ellipsis truncate"
          >
            {name.trim() !== "" ? name : ""}
          </Text>
        )}
        {!name.trim() && <Text variant="secondaryText">Anonymous</Text>}
      </div>
      <UserAgent ua={ua} className="text-sm text-gray-400" />
    </div>
  );
};
