import type { TextArea } from "@radix-ui/themes";
import { cloneElement, useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "@/ui/Button";
import { Text } from "@/ui/Typography";

interface HiddenTextAreaProps {
	children: React.ReactElement<React.ComponentProps<typeof TextArea>>;
	onShow: () => void;
	onHide: () => void;
	hideDurationSeconds?: number;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const HiddenTextArea: React.FC<HiddenTextAreaProps> = ({
	children,
	onShow,
	onHide,
	hideDurationSeconds = 15,
	value,
	onChange,
}) => {
	const [isContentVisible, setIsContentVisible] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const [remainingTime, setRemainingTime] = useState(hideDurationSeconds);
	const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

	const startHideTimer = useCallback(() => {
		if (hideTimerRef.current) {
			clearInterval(hideTimerRef.current);
		}
		setRemainingTime(hideDurationSeconds);
		hideTimerRef.current = setInterval(() => {
			setRemainingTime((prevTime) => prevTime - 1);
		}, 1000);
	}, [hideDurationSeconds]);

	const handleShowClick = () => {
		setIsContentVisible(true);
		onShow();
		startHideTimer();
	};

	const handleHideClick = useCallback(() => {
		setIsContentVisible(false);
		if (hideTimerRef.current) {
			clearInterval(hideTimerRef.current);
			hideTimerRef.current = null;
		}
		setRemainingTime(hideDurationSeconds);
		onHide();
	}, [hideDurationSeconds, onHide]);

	useEffect(() => {
		if (isContentVisible && remainingTime <= 0) {
			handleHideClick();
		}
	}, [isContentVisible, remainingTime, handleHideClick]);

	useEffect(() => {
		return () => {
			if (hideTimerRef.current) {
				clearInterval(hideTimerRef.current);
			}
		};
	}, []);

	const clonedTextArea = cloneElement(children, {
		value: isContentVisible ? value : "",
		onChange: isContentVisible ? onChange : undefined,
		disabled: !isContentVisible,
	});

	return (
		<div
			className="relative w-full"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{!isContentVisible && (
				<div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md text-gray-500 dark:text-gray-400 gap-2">
					<Text variant="secondaryText">Content Hidden</Text>
					<div className={twMerge(isHovered ? "visible" : "invisible")}>
						<Button
							className="ml-2"
							onClick={handleShowClick}
							variant="secondary"
						>
							Show
						</Button>
					</div>
				</div>
			)}
			{clonedTextArea}
			{isContentVisible && (
				<div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
					<span>Content will be hidden in {remainingTime}s</span>
					<Button onClick={handleHideClick} variant="secondary" size="1">
						Hide now
					</Button>
				</div>
			)}
		</div>
	);
};
