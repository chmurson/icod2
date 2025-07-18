import { forwardRef } from "react";
import { MdError, MdInfo, MdWarning } from "react-icons/md";
import { twMerge } from "tailwind-merge";

type AlertVariant = "error" | "warning" | "info";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
}

const alertVariantStyles: Record<AlertVariant, string> = {
  error:
    "border-red-500 bg-red-100/25 text-red-700 dark:text-red-500 dark:border-red-500/75 dark:bg-red-100/10",
  warning:
    "border-amber-500 bg-amber-100/25 text-amber-700 dark:text-amber-500 dark:border-amber-500/75 dark:bg-amber-100/10",
  info: "border-blue-500 bg-blue-100/25 text-blue-700 dark:text-blue-500 dark:border-blue-500/75 dark:bg-blue-100/10",
};

const alertVariantIcons: Record<AlertVariant, React.ReactNode> = {
  error: <MdError className="h-5 w-5 flex-shrink-0" />,
  warning: <MdWarning className="h-5 w-5 flex-shrink-0" />,
  info: <MdInfo className="h-5 w-5 flex-shrink-0" />,
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = "info",
      title,
      icon,
      showIcon = true,
      children,
      ...props
    },
    ref,
  ) => {
    const variantStyles = alertVariantStyles[variant];
    const defaultIcon = alertVariantIcons[variant];
    const displayIcon = icon || defaultIcon;

    return (
      <div
        ref={ref}
        className={twMerge(
          "border rounded-lg p-4 flex gap-3",
          variantStyles,
          className,
        )}
        {...props}
      >
        {showIcon && displayIcon}
        <div className="flex-1">
          {title && <h4 className="font-medium mb-1">{title}</h4>}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    );
  },
);

Alert.displayName = "Alert";
