import { create, type StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import { type CreateBoxStateData, useCreateBoxStore } from "./createBoxStore";
import {
	type JoinBoxStateData,
	useJoinBoxCreationState,
} from "./joinBoxCreationStore";

type DownloadBoxStoreStateType =
	| {
			type: "fromCreateBox";
			state: Pick<
				CreateBoxStateData,
				| "leader"
				| "participants"
				| "threshold"
				| "title"
				| "content"
				| "encryptedMessage"
				| "generatedKey"
			>;
	  }
	| {
			type: "fromJoinBox";
			state: Pick<
				JoinBoxStateData,
				| "leader"
				| "otherParticipants"
				| "you"
				| "title"
				| "content"
				| "encryptedMessage"
				| "generatedKey"
			>;
	  }
	| {
			type: undefined;
	  };

type Actions = {
	fromCreateBox: () => void;
};

const createStoreFn: StateCreator<DownloadBoxStoreStateType & Actions> = (
	set,
) => ({
	type: undefined,
	fromCreateBox: () => {
		const createBoxState = useCreateBoxStore.getState();
		set({
			type: "fromCreateBox",
			state: {
				content: createBoxState.content,
				encryptedMessage: createBoxState.encryptedMessage,
				generatedKey: createBoxState.generatedKey,
				leader: createBoxState.leader,
				participants: createBoxState.participants,
				threshold: createBoxState.threshold,
				title: createBoxState.title,
			},
		});
	},
	fromJoinBox: () => {},
});

export const useDownloadBoxStore = create<
	DownloadBoxStoreStateType & Actions
>()(
	devtools(createStoreFn, {
		name: "downloadBoxStore",
	}),
);
