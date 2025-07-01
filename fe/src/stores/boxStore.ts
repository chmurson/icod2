import { create } from "zustand";

export type PageState =
	| "welcome"
	| "create"
	| "join"
	| "createDownload"
	| "joinDownload";

interface BoxState {
	currentPage: PageState;
	boxId: string;
	setCurrentPage: (page: PageState) => void;
	setBoxId: (id: string) => void;
	handleCreateClick: () => void;
	handleJoinClick: () => void;
	handleBoxCreated: (newBoxId: string) => void;
	handleJoinBox: (joinBoxId: string) => void;
	handleBackToWelcome: () => void;
	reset: () => void;
}

export const useBoxStore = create<BoxState>((set) => ({
	currentPage: "welcome",
	boxId: "",
	setCurrentPage: (page) => set({ currentPage: page }),
	setBoxId: (id) => set({ boxId: id }),
	handleCreateClick: () => set({ currentPage: "create" }),
	handleJoinClick: () => set({ currentPage: "join" }),
	handleBoxCreated: (newBoxId) =>
		set({
			boxId: newBoxId,
			currentPage: "createDownload",
		}),
	handleJoinBox: (joinBoxId) =>
		set({
			boxId: joinBoxId,
			currentPage: "joinDownload",
		}),
	handleBackToWelcome: () =>
		set({
			currentPage: "welcome",
			boxId: "",
		}),
	reset: () =>
		set({
			currentPage: "welcome",
			boxId: "",
		}),
}));
