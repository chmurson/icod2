import { Avatar } from "@radix-ui/themes";
import type { FC } from "react";
import { IoMdKey } from "react-icons/io";
import type { ParticipantType } from "@/stores/boxStore/common-types";

type Props = {
  isYou: boolean;
  keyHolderId: string;
  possibleKeyHolders: ParticipantType[];
  keyholdersSharingTheirKeys: string[];
};

export const ShareAccessKeysAvatars: FC<Props> = ({
  keyHolderId,
  possibleKeyHolders,
  keyholdersSharingTheirKeys,
  isYou,
}) => {
  return (
    <div className="flex flex-1 gap-1">
      {possibleKeyHolders.map((kh) => (
        <div key={kh.id}>
          {kh.id === keyHolderId && isYou && <SimpleKeyAvatar type="accent" />}
          {((kh.id === keyHolderId && !isYou) ||
            keyholdersSharingTheirKeys.includes(kh.id)) && (
            <SharedKeyAvatar name={kh.name} />
          )}
          {kh.id !== keyHolderId &&
            !keyholdersSharingTheirKeys.includes(kh.id) && <SimpleKeyAvatar />}
        </div>
      ))}
    </div>
  );
};

const SimpleKeyAvatar = ({ type = "gray" }: { type?: "gray" | "accent" }) => {
  return (
    <Avatar
      size="1"
      fallback={<IoMdKey size={18} />}
      variant="solid"
      color={type === "gray" ? "gray" : undefined}
      className={type === "gray" ? "opacity-25" : "opacity-90"}
      radius="full"
    />
  );
};

const SharedKeyAvatar = ({ name }: { name: string }) => {
  return (
    <div className="relative">
      <Avatar size="1" fallback={name?.[0]} variant="soft" radius="full" />
      <Avatar
        className="absolute"
        style={{
          bottom: -4,
          right: -4,
          width: 14,
          height: 14,
        }}
        size="1"
        fallback={<IoMdKey size={18} />}
        variant="solid"
        radius="full"
      />
    </div>
  );
};
