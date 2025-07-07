import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import { Button, Flex, TextField } from "@radix-ui/themes";
import type React from "react";
import { useCallback, useState } from "react";

interface InputNumberProps extends TextField.RootProps {
	min?: number;
	max?: number;
	defaultValue?: number;
}

export const InputNumber: React.FC<InputNumberProps> = ({
	min = Number.NEGATIVE_INFINITY,
	max = Number.POSITIVE_INFINITY,
	defaultValue = 0,
	value: controlledValue,
	onChange,
	...props
}) => {
	const [internalValue, setInternalValue] = useState<number>(() => {
		const initial = Number(controlledValue ?? defaultValue);
		return Math.max(min, Math.min(max, Number.isNaN(initial) ? min : initial));
	});

	const currentValue =
		controlledValue !== undefined ? Number(controlledValue) : internalValue;

	const updateValue = useCallback(
		(newValue: number) => {
			const clampedValue = Math.max(min, Math.min(max, newValue));
			if (controlledValue === undefined) {
				setInternalValue(clampedValue);
			}
			if (onChange) {
				// Create a synthetic event object for consistency with HTML input change events
				const syntheticEvent = {
					target: { value: String(clampedValue) },
					currentTarget: { value: String(clampedValue) },
				} as React.ChangeEvent<HTMLInputElement>;
				onChange(syntheticEvent);
			}
		},
		[min, max, controlledValue, onChange],
	);

	const handleDecrement = useCallback(() => {
		updateValue(currentValue - 1);
	}, [currentValue, updateValue]);

	const handleIncrement = useCallback(() => {
		updateValue(currentValue + 1);
	}, [currentValue, updateValue]);

	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = Number(event.target.value);
			if (!Number.isNaN(newValue)) {
				updateValue(newValue);
			} else if (event.target.value === "") {
				// Allow empty string temporarily for user input, but clamp to min if committed
				if (controlledValue === undefined) {
					setInternalValue(Number.NaN); // Or some indicator that it's empty
				}
				if (onChange) {
					onChange(event);
				}
			} else {
				// If it's not a valid number and not empty, just pass the event
				if (onChange) {
					onChange(event);
				}
			}
		},
		[updateValue, controlledValue, onChange],
	);

	// Handle blur to clamp NaN or empty string to min
	const handleBlur = useCallback(
		(event: React.FocusEvent<HTMLInputElement>) => {
			if (Number.isNaN(currentValue)) {
				updateValue(min);
			}
			if (props.onBlur) {
				props.onBlur(event);
			}
		},
		[currentValue, updateValue, min, props.onBlur],
	);

	return (
		<Flex align="center" gap="1">
			<Button
				type="button"
				variant="soft"
				size="2"
				onClick={handleDecrement}
				disabled={currentValue <= min}
				aria-label="Decrement value"
			>
				<MinusIcon />
			</Button>
			<TextField.Root
				type="number"
				value={Number.isNaN(currentValue) ? "" : currentValue}
				onChange={handleChange}
				onBlur={handleBlur}
				min={min}
				max={max}
				{...props}
			/>
			<Button
				type="button"
				variant="soft"
				size="2"
				onClick={handleIncrement}
				disabled={currentValue >= max}
				aria-label="Increment value"
			>
				<PlusIcon />
			</Button>
		</Flex>
	);
};
