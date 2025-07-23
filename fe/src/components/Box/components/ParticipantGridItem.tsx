import { Avatar } from "@radix-ui/themes";
import type { ReactNode } from "react";
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
    <div className="flex gap-4 items-center justify-between py-2 border-b border-gray-200">
      <div className="flex gap-3 items-center">
        <Avatar
          fallback={name[0]}
          radius="full"
          style={{ height: 48, width: 48 }}
        />
        <div className="flex flex-col py-1">
          <div className="flex items-center gap-2">
            {name.trim() && (
              <Text variant="primaryText" className="font-semibold">
                {name.trim() !== "" ? name : ""}
              </Text>
            )}
            {!name.trim() && <Text variant="secondaryText">Anonymous</Text>}
          </div>
          <UserAgent ua={userAgent} className="text-sm text-gray-400" />
        </div>
      </div>
      {sharedKeysSlot}
      {buttonSlot}
    </div>
  );
};
