import { Slot } from "@radix-ui/react-slot";
import type { ElementType } from "react";
import { twMerge } from "tailwind-merge";

type TypographyProps<C extends ElementType = "div"> =
	React.HTMLAttributes<HTMLElement> & {
		asChild?: boolean;
		as?: C;
		variant:
			| "pageTitle"
			| "sectionTitle"
			| "primaryText"
			| "label"
			| "secondaryText";
	};

export function Typography<C extends ElementType = "div">({
	as = "div" as C,
	asChild = false,
	variant,
	className,
	...props
}: TypographyProps<C>) {
	const Comp = asChild ? Slot : (as as ElementType);
	return (
		<Comp
			className={twMerge(
				variant === "pageTitle" && "text-3xl font-bold",
				variant === "sectionTitle" && "text-xl font-medium mt-4",
				variant === "primaryText" && "text-base font-normal",
				variant === "label" && "text-sm font-semibold text-gray-500",
				variant === "secondaryText" && "text-base text-gray-400",
				className,
			)}
			{...props}
		/>
	);
}
