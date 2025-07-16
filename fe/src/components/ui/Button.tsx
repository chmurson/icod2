import {
  Button as RadixButton,
  type ButtonProps as RadixButtonProps,
  Spinner,
} from "@radix-ui/themes";
import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type ButtonVariant = "prominent" | "primary" | "secondary";

interface ButtonProps extends Omit<RadixButtonProps, "variant"> {
  variant?: ButtonVariant;
  loading?: boolean;
  loadingText?: string;
  iconSlot?: React.ReactNode;
}

const buttonVariantToProps: Record<
  ButtonVariant,
  Pick<RadixButtonProps, "color" | "size" | "variant" | "className">
> = {
  prominent: {
    color: "plum",
    size: "3",
    variant: "solid",
    className: "py-4",
  },
  primary: { color: "plum", size: "2", variant: "solid" },
  secondary: { color: "plum", size: "2", variant: "outline" },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      loading = false,
      loadingText,
      children,
      disabled,
      variant,
      iconSlot = null,
      ...props
    },
    ref,
  ) => {
    const { className: variantClassName, ...variantProps } =
      buttonVariantToProps[variant || "primary"];

    return (
      <RadixButton
        ref={ref}
        disabled={loading || disabled}
        size="2"
        {...variantProps}
        {...props}
        className={twMerge(variantClassName, className)}
      >
        {!!iconSlot && <Spinner loading={loading}>{iconSlot}</Spinner>}
        {!iconSlot && <Spinner loading={loading} />}
        {children}
      </RadixButton>
    );
  },
);

Button.displayName = "Button";
