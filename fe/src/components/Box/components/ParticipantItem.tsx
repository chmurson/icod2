import { PersonIcon } from "@radix-ui/react-icons";
import { Text } from "@/ui/Typography";
import { UserAgent } from "./UserAgent";
export const ParticipantItem = ({
	name,
	userAgent,
}: {
	name: string;
	userAgent: string;
}) => {
	return (
		<div className="flex gap-4">
			<div className="flex items-center gap-2">
				<PersonIcon />
				<Text variant="primaryText">{name}</Text>
			</div>
			<UserAgent ua={userAgent} />
		</div>
	);
};
