import { useCallback, useState } from "react";
import { useCreateBoxStore } from "@/stores";

export const useNaiveShowHiddenMessage = () => {
	const message = useCreateBoxStore((state) => state.content);
	const [visibleMessage, setVisisableMessage] = useState("");

	const hideMessage = useCallback(() => {
		setVisisableMessage("");
	}, []);

	const showMessage = useCallback(() => {
		setVisisableMessage(message);
	}, [message]);

	return {
		visibleMessage,
		hideMessage,
		showMessage,
	};
};
