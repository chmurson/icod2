import type { FC } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { ToggleButton, type ToggleButtonProps } from "@/ui/ToggleButton";

type Props = Omit<
  ToggleButtonProps,
  "iconOn" | "iconOff" | "textOff" | "textOn"
>;

export const SharePreviewButton: FC<Props> = (props) => {
  return (
    <ToggleButton
      iconOn={<FiEyeOff />}
      iconOff={<FiEye />}
      textOff="Show content preview"
      textOn="Hide content preview"
      className=""
      {...props}
    />
  );
};
