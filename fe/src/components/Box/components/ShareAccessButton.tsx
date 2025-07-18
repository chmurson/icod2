import type { FC } from "react";
import { IoMdKey } from "react-icons/io";
import { ToggleButton, type ToggleButtonProps } from "@/ui/ToggleButton";

type Props = Omit<
  ToggleButtonProps,
  "iconOn" | "iconOff" | "textOn" | "textOff"
>;

export const ShareAccessButton: FC<Props> = (props) => {
  return (
    <ToggleButton
      iconOn={<IoMdKey />}
      iconOff={<IoMdKey />}
      textOn="Stop sharing"
      textOff="Share your key"
      {...props}
    />
  );
};
