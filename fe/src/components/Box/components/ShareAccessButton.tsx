import type { FC } from "react";
import { IoMdKey } from "react-icons/io";
import { ToggleButton, type ToggleButtonProps } from "@/ui/ToggleButton";

type Props = Omit<
  ToggleButtonProps,
  "iconOn" | "iconOff" | "textOn" | "textOff"
> & { shortText?: boolean };

export const ShareAccessButton: FC<Props> = (props) => {
  const { shortText, ...restOfProps } = props;
  return (
    <ToggleButton
      iconOn={<IoMdKey />}
      iconOff={<IoMdKey />}
      textOn={shortText ? "Stop sharing" : "Stop sharing key"}
      textOff={shortText ? "Start sharing" : "Share your key"}
      {...restOfProps}
    />
  );
};
