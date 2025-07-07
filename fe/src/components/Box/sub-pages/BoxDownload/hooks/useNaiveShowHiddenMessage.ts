import { useCallback, useState } from "react";
import { useBoxDownloadState } from "./useBoxDownloadState";

export const useNaiveShowHiddenMessage = () => {
	const { content } = useBoxDownloadState();
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
