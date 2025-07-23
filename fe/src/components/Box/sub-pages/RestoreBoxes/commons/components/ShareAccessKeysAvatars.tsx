import { Avatar } from "@radix-ui/themes";
import type { FC } from "react";
import { IoMdKey } from "react-icons/io";
import type { ParticipantType } from "@/stores/boxStore/common-types";

type Props = {
  keyHolderId: string;
  possibleKeyHolders: ParticipantType[];
  keyholdersSharingTheirKeys: string[];
};

export const ShareAccessKeysAvatars: FC<Props> = ({
  keyHolderId,
  possibleKeyHolders,
  keyholdersSharingTheirKeys,
}) => {
  return (
    <div className="flex flex-1 gap-1">
      {possibleKeyHolders.map((kh) => (
        <div key={kh.id}>
          {(kh.id === keyHolderId ||
            keyholdersSharingTheirKeys.includes(kh.id)) && (
            <SharedKeyAvatar name={kh.name} />
          )}
          {kh.id !== keyHolderId &&
            !keyholdersSharingTheirKeys.includes(kh.id) && <GreyKeyAvatar />}
        </div>
      ))}
    </div>
  );
};

const GreyKeyAvatar = () => {
  return (
    <Avatar
      size="1"
      fallback={<IoMdKey size={18} />}
      variant="solid"
      color="gray"
      className="opacity-25"
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
