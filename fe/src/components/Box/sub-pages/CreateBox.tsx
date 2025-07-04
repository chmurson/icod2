import init, { ChunksConfiguration, secure_message } from "icod-crypto-js";
import wasm from "icod-crypto-js/icod_crypto_js_bg.wasm?url";
import type React from "react";
import { useEffect, useState } from "react";
import { webRTCService } from "@/services/web-rtc/WebRTCService";
import { useCreateBoxStore } from "@/stores/boxStore/createBoxStore";
import { Button } from "@/ui/Button.tsx";

const CreateBox: React.FC = () => {
	const state = useCreateBoxStore((state) => state);
	const actions = useCreateBoxStore((state) => state.actions);

	const [localTitle, setLocalTitle] = useState(state.title);
	const [localContent, setLocalContent] = useState(state.content);

	useEffect(() => {
		init(wasm);
		webRTCService.connectLeader();

		return () => {
			webRTCService.disconnect();
		};
	}, []);

	const handleShareContent = () => {
		const numKeys = state.participants.length + 1; // Leader + participants
		const secured = secure_message(
			localContent,
			undefined,
			new ChunksConfiguration(state.threshold, numKeys - state.threshold),
		);

		actions.setMessage({
			title: localTitle,
			content: localContent, // Keep original content for local display
			encryptedMessage: secured.encrypted_message[0] as string,
			generatedKey: secured.chunks[0],
			generatedKeys: secured.chunks as string[],
		});
	};

	return (
		<div>
			<h1>Hi I'm Create Box page</h1>
			<div>
				<label htmlFor="title">Title: </label>
				<input
					id="title"
					type="text"
					value={localTitle}
					onChange={(e) => setLocalTitle(e.target.value)}
					className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 rounded-md px-2 py-1"
				/>
			</div>
			<div className="mt-4">
				<label htmlFor="content">Content: </label>
				<textarea
					id="content"
					value={localContent}
					onChange={(e) => setLocalContent(e.target.value)}
					rows={10}
					className="w-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 rounded-md px-2 py-1"
				/>
			</div>
			<div className="mt-2">
				<Button variant="secondary" onClick={handleShareContent}>
					Share Content
				</Button>
			</div>
			<fieldset className="mt-4">
				<legend>Threshold: </legend>
				<button
					type="button"
					onClick={() => actions.setMessage({ threshold: state.threshold - 1 })}
					disabled={state.threshold === 1}
				>
					-
				</button>
				<span className="w-16 text-center py-1 bg-gray-200 dark:bg-gray-700 rounded-md mx-2">
					{state.threshold}
				</span>
				<button
					type="button"
					onClick={() => {
						const numKeys = state.participants.length + 1;
						if (state.threshold < numKeys) {
							actions.setMessage({ threshold: state.threshold + 1 });
						}
					}}
					disabled={state.threshold >= state.participants.length + 1}
				>
					+
				</button>
			</fieldset>
			<Button variant="primary" onClick={actions.create}>
				Create Box
			</Button>
			<PrettyJson>{state}</PrettyJson>
		</div>
	);
};

const PrettyJson: React.FC<{ children: object }> = ({ children }) => {
	return (
		<pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
			{JSON.stringify(children, null, 2)}
		</pre>
	);
};

export default CreateBox;
