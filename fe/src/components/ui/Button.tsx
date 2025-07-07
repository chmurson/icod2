import {
	Button as RadixButton,
	type ButtonProps as RadixButtonProps,
	Spinner,
} from "@radix-ui/themes";
import { twMerge } from "tailwind-merge";

type ButtonVariant = "prominent" | "primary" | "secondary";

interface ButtonProps extends Omit<RadixButtonProps, "variant"> {
	variant?: ButtonVariant;
	loading?: boolean;
	loadingText?: string;
	iconSlot?: React.ReactNode;
	ref?: React.Ref<HTMLButtonElement>;
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

export function Button({
	className,
	loading = false,
	loadingText,
	children,
	disabled,
	ref,
	variant,
	iconSlot = null,
	...props
}: ButtonProps) {
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
}

Button.displayName = "Button";
