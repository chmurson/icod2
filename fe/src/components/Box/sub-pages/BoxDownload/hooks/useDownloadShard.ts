import { useCallback, useState } from "react";
import { useBoxDownloadState } from "./useBoxDownloadState";

const defaultArgs = {};

export const useDownloadShard = ({
	onSuccess,
}: {
	onSuccess?: () => void;
} = defaultArgs) => {
	const { encryptedMessage, generatedKey } = useBoxDownloadState();

	const [error, setError] = useState<string | undefined>(undefined);

	const downloadKeyShardAndMessage = useCallback(() => {
		setError(undefined);
		if (!encryptedMessage?.trim() || !generatedKey?.trim()) {
			setError("Encrypted message and generate key are not set!");
			return;
		}
		downloadFile(encryptedMessage, "encrypted-message.txt");
		downloadFile(generatedKey, "key-shard.txt");

		onSuccess?.();
	}, [encryptedMessage, generatedKey, onSuccess]);

	return {
		downloadKeyShardAndMessage,
		error,
	};
};

function downloadFile(content: string, fileName: string) {
	const blob = new Blob([content], { type: "text/plain" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = fileName;
	a.click();
	URL.revokeObjectURL(url);
}
