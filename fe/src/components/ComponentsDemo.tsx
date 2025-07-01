import { Button } from "./ui/Button";
import { Typography } from "./ui/Typography";

function ComponentsDemo() {
	return (
		<div style={{ padding: 24 }}>
			<h1>Components Demo</h1>
			<p>This page will showcase various UI components.</p>
			{/* Components will be added here */}
			<div className="space-y-8 p-8">
				<div className="flex gap-8">
					<Button variant="default">Create the vault</Button>
					<Button variant="prominent">Prominent primary button</Button>
					<Button variant="primary">Primary button</Button>
					<Button variant="secondary">Secondary button</Button>
				</div>
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
		</div>
	);
}

export default ComponentsDemo;
