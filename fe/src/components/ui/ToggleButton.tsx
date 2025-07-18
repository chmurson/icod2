import type { ButtonProps as RadixButtonProps } from "@radix-ui/themes";
import { type FC, useState } from "react";
import { Button } from "./Button";

export type ToggleButtonProps = {
  checked?: boolean; // for controlled
  defaultChecked?: boolean; // for uncontrolled
  onToggle?: (checked: boolean) => void;

  iconOn?: React.ReactNode;
  iconOff?: React.ReactNode;
  textOn: string;
  textOff: string;

  disabled?: boolean;
  // ...more, as needed
} & Omit<RadixButtonProps, "variant" | "onToggle">;

export const ToggleButton: FC<ToggleButtonProps> = (props) => {
  const {
    disabled,
    checked,
    textOn,
    textOff,
    onToggle,
    defaultChecked,
    iconOn,
    iconOff,
    ...restOfProps
  } = props;

  const [internalChecked, setInternalChecked] = useState(
    defaultChecked ?? false,
  );

  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;

  const handleClick = () => {
    if (disabled) {
      return;
    }

    if (!isControlled) {
      setInternalChecked(!checked);
    }

    onToggle?.(!checked);
  };

  return (
    <Button
      variant={isChecked ? "primary" : "secondary"}
      disabled={disabled}
      onClick={handleClick}
      {...restOfProps}
    >
      {isChecked ? iconOn : iconOff}
      {isChecked ? textOn : textOff}
    </Button>
  );
};
