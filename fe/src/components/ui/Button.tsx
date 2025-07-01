import { Slot } from "@radix-ui/react-slot";
import { twMerge } from "tailwind-merge";

function Spinner() {
	return (
		<svg
			role="img"
			aria-label="Loading"
			className="animate-spin mr-2 h-5 w-5 text-inherit inline"
			viewBox="0 0 24 24"
			fill="none"
		>
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="4"
			/>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
			/>
		</svg>
	);
}

type ButtonVariant = "default" | "prominent" | "primary" | "secondary";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	asChild?: boolean;
	variant?: ButtonVariant;
	loading?: boolean;
	loadingText?: string;
	ref?: React.Ref<HTMLButtonElement>;
}

export function Button({
	asChild = false,
	variant = "default",
	className,
	loading = false,
	loadingText,
	children,
	disabled,
	ref,
	...props
}: ButtonProps) {
	const Comp = asChild ? Slot : "button";
	return (
		<Comp
			ref={ref}
			className={twMerge(
				"rounded-xl px-8 py-4 text-lg font-handwriting border transition-all flex items-center justify-center",
				variant === "default" && "bg-gray-500 text-gray-900 border-gray-500",
				variant === "prominent" &&
					"bg-purple-400 text-white border-purple-400 shadow-lg",
				variant === "primary" && "bg-purple-300 text-white border-purple-300",
				variant === "secondary" &&
					"bg-transparent text-purple-600 border-purple-400",
				(loading || disabled) && "opacity-50 cursor-not-allowed",
				className,
			)}
			disabled={loading || disabled}
			{...props}
		>
			{loading && <Spinner />}
			{loading ? loadingText || children : children}
		</Comp>
	);
}
Button.displayName = "Button";
