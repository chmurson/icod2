import { useDownloadBoxStore } from "@/stores";
import type { ParticipantType } from "@/stores/boxStore/common-types";

export const useBoxDownloadState = () => {
	const state = useDownloadBoxStore((state) => state);

	if (state.type === "fromCreateBox") {
		const {
			content,
			leader,
			keyholders,
			threshold,
			title,
			encryptedMessage,
			generatedKey,
		} = state.state;

		return {
			type: "fromCreateBox",
			title,
			threshold,
			leader,
			keyholders,
			content,
			encryptedMessage,
			generatedKey,
		};
	}

	if (state.type === "fromJoinBox") {
		const {
			content,
			leader,
			threshold,
			title,
			encryptedMessage,
			generatedKey,
			otherKeyholders,
			you,
		} = state.state;

		return {
			type: "fromJoinBox",
			content,
			leader,
			threshold,
			title,
			encryptedMessage,
			generatedKey,
			otherKeyholders,
			you,
		};
	}

	return {
		type: "",
		title: "",
		treshold: "",
		leader: {
			id: "",
			name: "",
			userAgent: "",
		} satisfies ParticipantType,
		keyholders: [],
		contnet: "",
	};
	// const title = useCreateBoxStore((state) => state.title);
};
