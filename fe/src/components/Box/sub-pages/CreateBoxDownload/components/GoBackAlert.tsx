import { AlertDialog } from "@radix-ui/themes";
import type { ReactNode } from "react";
import { Button } from "@/ui/Button";

export const GoBackAlert = ({
	triggerSlot,
	onGoBack,
	open,
	onClose,
}: {
	triggerSlot?: ReactNode;
	onGoBack: () => void;
	onClose?: () => void;
	open?: boolean;
}) => {
	return (
		<AlertDialog.Root open={open}>
			{triggerSlot && <AlertDialog.Trigger>{triggerSlot}</AlertDialog.Trigger>}
			<AlertDialog.Content maxWidth="450px">
				<AlertDialog.Title>Box shard is not downloaded</AlertDialog.Title>
				<AlertDialog.Description size="2">
					Are you sure? This application will no longer be accessible, and you
					will lose your chance to download the box shard.
				</AlertDialog.Description>

				<div className="flex justify-between mt-4">
					<AlertDialog.Cancel>
						<Button variant="primary" onClick={onClose}>
							Upps, cancel
						</Button>
					</AlertDialog.Cancel>
					<AlertDialog.Action>
						<Button variant="secondary" onClick={onGoBack}>
							Ignore the alert and close the page
						</Button>
					</AlertDialog.Action>
				</div>
			</AlertDialog.Content>
		</AlertDialog.Root>
	);
};
