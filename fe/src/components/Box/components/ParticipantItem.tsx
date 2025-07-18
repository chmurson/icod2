import { PersonIcon } from "@radix-ui/react-icons";
import type { ReactNode } from "react";
import { Text } from "@/ui/Typography";
import { UserAgent } from "./UserAgent";

export const ParticipantItem = ({
  name,
  userAgent,
  buttonSlot,
}: {
  name: string;
  userAgent: string;
  buttonSlot?: ReactNode;
}) => {
  return (
    <div className="flex gap-4 items-center justify-between">
      <div className="flex gap-4 items-center">
        <PersonIcon width={32} height={32} />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {name.trim() && (
              <Text variant="primaryText">
                {name.trim() !== "" ? name : ""}
              </Text>
            )}
            {!name.trim() && <Text variant="secondaryText">Anonymous</Text>}
          </div>
          <UserAgent ua={userAgent} className="text-sm text-gray-400" />
        </div>
      </div>
      {buttonSlot}
    </div>
  );
};
