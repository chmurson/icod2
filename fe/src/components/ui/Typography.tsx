import { Slot } from "@radix-ui/react-slot";
import type { ElementType } from "react";
import { twMerge } from "tailwind-merge";

type TypographyVariant =
  | "pageTitle"
  | "sectionTitle"
  | "primaryText"
  | "label"
  | "secondaryText"
  | "primaryError";

type TypographyProps<C extends ElementType = "div"> =
  React.HTMLAttributes<HTMLElement> & {
    asChild?: boolean;
    as?: C;
    variant: TypographyVariant;
  };

const localPropsByVariant: Record<TypographyVariant, { as?: ElementType }> = {
  pageTitle: { as: "h1" },
  sectionTitle: { as: "h2" },
  primaryText: { as: "p" },
  label: { as: "p" },
  secondaryText: { as: "p" },
  primaryError: {
    as: "p",
  },
};

export function Typography<C extends ElementType = "div">({
  as = "div" as C,
  asChild = false,
  variant,
  className,
  ...props
}: TypographyProps<C>) {
  const Comp = asChild ? Slot : (as as ElementType);
  const localProps = localPropsByVariant[variant] || {};

  return (
    <Comp
      className={twMerge(
        variant === "pageTitle" && "text-3xl font-bold",
        variant === "sectionTitle" && "text-xl font-medium mt-4",
        variant === "primaryText" && "text-base font-normal",
        variant === "primaryError" && "text-base font-normal text-red-600",
        variant === "label" && "text-sm font-medium text-gray-500",
        variant === "secondaryText" && "text-base text-gray-400",
        className,
      )}
      {...localProps}
      {...props}
    />
  );
}

export const Text = Typography;
