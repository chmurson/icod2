import { DownloadIcon, PlusIcon, StarIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/Button";
import { Typography } from "./ui/Typography";

function ComponentsDemo() {
	return (
		<div style={{ padding: 24 }}>
			<h1>Components Demo</h1>
			<p>This page will showcase various UI components.</p>
			{/* Components will be added here */}
			<Buttons addIcon={false} />
			<Buttons addIcon={true} />

			<div className="mt-12 space-y-2">
				<Typography variant="pageTitle" as="h1">
					Page title
				</Typography>
				<Typography variant="sectionTitle" as="h2">
					Section title
				</Typography>
				<Typography variant="primaryText">Primary text</Typography>
				<Typography variant="label">Label</Typography>
				<Typography variant="secondaryText">Secondary text</Typography>
			</div>
		</div>
	);
}

const Buttons = ({ addIcon }: { addIcon: boolean }) => {
	return (
		<div className="flex">
			<div className="flex flex-col gap-12 p-8">
				<div>Active</div>
				<div>Loading</div>
				<div>Disabled</div>
			</div>
			<div className="space-y-8 p-8">
				<div className="flex gap-8">
					<Button variant="prominent" iconSlot={addIcon ? <PlusIcon /> : null}>
						Prominent button
					</Button>
					<Button
						variant="primary"
						iconSlot={addIcon ? <DownloadIcon /> : null}
					>
						Primary button
					</Button>
					<Button variant="secondary" iconSlot={addIcon ? <StarIcon /> : null}>
						Secondary button
					</Button>
				</div>
				<div className="flex gap-8">
					<Button
						variant="prominent"
						loading
						iconSlot={addIcon ? <PlusIcon /> : null}
					>
						Prominent button
					</Button>
					<Button
						variant="primary"
						loading
						iconSlot={addIcon ? <DownloadIcon /> : null}
					>
						Primary button
					</Button>
					<Button
						variant="secondary"
						loading
						iconSlot={addIcon ? <StarIcon /> : null}
					>
						Secondary button
					</Button>
				</div>
				<div className="flex gap-8">
					<Button
						variant="prominent"
						disabled
						iconSlot={addIcon ? <PlusIcon /> : null}
					>
						Prominent button
					</Button>
					<Button
						variant="primary"
						disabled
						iconSlot={addIcon ? <DownloadIcon /> : null}
					>
						Primary button
					</Button>
					<Button
						variant="secondary"
						disabled
						iconSlot={addIcon ? <StarIcon /> : null}
					>
						Secondary button
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ComponentsDemo;
