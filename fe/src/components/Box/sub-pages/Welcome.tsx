import type React from "react";
import type { ReactNode } from "react";
import { useJoinBoxCreationState } from "@/stores";
import { useCreateBoxStore } from "@/stores/boxStore/createBoxStore";
import { Button } from "@/ui/Button";
import { Typography } from "@/ui/Typography";

const Welcome: React.FC = () => {
	const startCreateBox = useCreateBoxStore((state) => state.actions.start);
	const startJoinBox = useJoinBoxCreationState((state) => state.actions.start);

	return (
		<div className="flex flex-col gap-4 pb-12">
			<Typography variant="pageTitle" as="h1" className="mt-2">
				Decantralized Box
			</Typography>
			<InfoBox
				title="Create a Box"
				text={
					<>
						<p className="my-1">Start by creating a box. You’ll:</p>
						<ul className="my-1">
							<li>- Define the message or content you want to protect.</li>
							<li>- Invite others (your friends or devices) to join.</li>
							<li>
								- Set a threshold (e.g. 3 out of 5) — the number of people
								required to unlock the vault later.
							</li>
						</ul>
					</>
				}
				buttonSlot={
					<Button onClick={startCreateBox} variant="prominent">
						Create Box
					</Button>
				}
			/>
			<InfoBox
				title="Join the Box Creation"
				text={
					<>
						<p className="my-1">Start by creating a box. You’ll:</p>
						<ul className="my-1">
							<li>
								- Join by clicking a link or entering a token they shared with
								you.
							</li>
							<li>- Take part in the box setup process.</li>
							<li>
								- Wait for the creator to define the final message or content.
							</li>
						</ul>
					</>
				}
				buttonSlot={
					<Button onClick={startJoinBox} variant="prominent">
						Join the Box Creation
					</Button>
				}
			/>

			<InfoBox
				title="Open an Existing Box"
				text={
					<>
						<p className="my-1">
							Once a vault is created, it can only be opened when:
						</p>
						<ul className="my-1">
							<li>
								- At least the required number of people (as set during
								creation) agree to open it.
							</li>
							<li>
								- You’ll confirm your intent to unlock the content with others.
							</li>
						</ul>
					</>
				}
				buttonSlot={
					<Button onClick={startJoinBox} variant="prominent" disabled>
						Open an Existing Box
					</Button>
				}
			/>
		</div>
	);
};

const InfoBox = ({
	buttonSlot,
	text,
	title,
}: {
	title: string;
	text: ReactNode;
	buttonSlot: ReactNode;
}) => (
	<div className="flex gap-2 flex-col">
		<Typography variant="sectionTitle">{title}</Typography>
		<div className="flex flex-row gap-6 justify-between max-md:flex-col">
			<Typography variant="primaryText">{text}</Typography>
			<div className="flex justify-center items-end max-md:justify-start">
				{buttonSlot}
			</div>
		</div>
	</div>
);

export default Welcome;
