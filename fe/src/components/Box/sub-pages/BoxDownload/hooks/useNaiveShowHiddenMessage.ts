import { useCallback, useState } from "react";
import { useCreateBoxDownloadState } from "./useCreateBoxDownloadState";

export const useNaiveShowHiddenMessage = () => {
	const { content } = useCreateBoxDownloadState();
	const [visibleMessage, setVisisableMessage] = useState("");

	const hideMessage = useCallback(() => {
		setVisisableMessage("");
	}, []);

	const showMessage = useCallback(() => {
		setVisisableMessage(content ?? "");
	}, [content]);

	return {
		visibleMessage,
		hideMessage,
		showMessage,
	};
};
