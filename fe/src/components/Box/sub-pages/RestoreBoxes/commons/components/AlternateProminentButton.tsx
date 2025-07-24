import type { ButtonProps as RadixButtonProps } from "@radix-ui/themes";
import type { FC } from "react";
import { Button } from "@/ui/Button";
import { cn } from "@/utils/cn";

type Props = Omit<RadixButtonProps, "variant">;

export const AlternateProminentButton: FC<Props> = (props) => {
  const { className, ...restOfProps } = props;
  return (
    <Button
      {...restOfProps}
      className={cn(
        className,
        "py-8.5 px-26 bg-[var(--alt-accent-3)] text-[var(--alt-accent-9)] text-2xl font-semibold rounded-full border-2 border-white shadow-xl",
        " dark:border-gray-300 dark:shadow-gray-100/25 dark:shadow-lg",
      )}
    />
  );
};
