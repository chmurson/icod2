import { PersonIcon } from "@radix-ui/react-icons";
import { Text } from "@/ui/Typography";
import { UserAgent } from "./UserAgent";

export const ParticipantItem = ({
	name,
	userAgent,
	isContentShared,
	onContentShareChange,
}: {
	name: string;
	userAgent: string;
	isContentShared?: boolean;
	onContentShareChange?: (checked: boolean) => void;
}) => {
	return (
		<div className="flex gap-4 items-center">
			<div className="flex items-center gap-2">
				<PersonIcon />
				<Text variant="primaryText">{name}</Text>
			</div>
			<UserAgent ua={userAgent} />
			<div>
				{typeof isContentShared === "boolean" && onContentShareChange && (
					<label className="flex items-center gap-1 ml-2">
						<input
							type="checkbox"
							checked={isContentShared}
							onChange={(e) => onContentShareChange(e.target.checked)}
						/>
						<span>share content</span>
					</label>
				)}
			</div>
		</div>
	);
};
