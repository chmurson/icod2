import { Avatar, Badge } from "@radix-ui/themes";
import type { FC } from "react";
import { IoMdKey } from "react-icons/io";
import type { ParticipantType } from "@/stores/boxStore/common-types";
import { useTailwindBreakpoints } from "@/utils/useTailwindBreakpoints";

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
  const { isMaxSm } = useTailwindBreakpoints();
  const maxSize = isMaxSm ? 4 : 5;
  const wrappedAvatars = possibleKeyHolders.slice(maxSize);
  const keysSharedFromWrappedAvatars = wrappedAvatars.filter((wa) =>
    keyholdersSharingTheirKeys.includes(wa.id),
  ).length;
  return (
    <div className="inline-flex flex-1 gap-1 grow-0 items-center">
      {possibleKeyHolders.slice(0, maxSize).map((kh) => (
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
      {wrappedAvatars.length > 0 && (
        <Badge
          radius="full"
          className="ml-1"
          variant={keysSharedFromWrappedAvatars > 0 ? "solid" : "outline"}
        >
          +{keysSharedFromWrappedAvatars}/{wrappedAvatars.length}
        </Badge>
      )}
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
