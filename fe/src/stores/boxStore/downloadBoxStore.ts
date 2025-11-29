import { create, type StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import { type CreateBoxStateData, useCreateBoxStore } from "./createBoxStore";
import { type JoinBoxStateData, useJoinBoxStore } from "./joinBoxStore";

type DownloadBoxFromCreateState = {
  type: "fromCreateBox";
  state: Pick<
    CreateBoxStateData,
    | "roomToken"
    | "leader"
    | "keyHolders"
    | "threshold"
    | "title"
    | "content"
    | "encryptedMessage"
    | "generatedKey"
  > & {
    confirmationBoxesReceivedByKeyHolderId: string[];
  };
};

type DownloadBoxFromJoinState = {
  type: "fromJoinBox";
  state: Pick<
    JoinBoxStateData,
    | "roomToken"
    | "leader"
    | "otherKeyHolders"
    | "you"
    | "title"
    | "content"
    | "encryptedMessage"
    | "generatedKey"
    | "threshold"
  >;
};

type DownloadBoxUndefinedState = {
  type: undefined;
};

type DownloadBoxStoreStateType =
  | DownloadBoxFromCreateState
  | DownloadBoxFromJoinState
  | DownloadBoxUndefinedState;

type Actions = {
  fromCreateBox: (payload: {
    encryptedMessage: string;
    key: string;
    roomToken: string;
  }) => void;
  fromJoinBox: (payload: {
    encryptedMessage: string;
    key: string;
    roomToken: string;
  }) => void;
  reset: () => void;
  clearKeyAndMessage: () => void;
  addConfirmationBoxReceived: (keyHolderId: string) => void;
};

const createStoreFn: StateCreator<DownloadBoxStoreStateType & Actions> = (
  set,
  get,
) => ({
  type: undefined,
  reset: () => set({ type: undefined, state: undefined }),
  clearKeyAndMessage: () => {
    const current = get();
    if (current.type === "fromCreateBox") {
      return set({
        state: {
          ...current.state,
          encryptedMessage: "",
          generatedKey: "",
        },
      });
    }
    if (current.type === "fromJoinBox") {
      return set({
        state: {
          ...current.state,
          encryptedMessage: "",
          generatedKey: "",
        },
      });
    }
  },
  addConfirmationBoxReceived: (keyHolderId: string) => {
    const state = get();
    if (state.type !== "fromCreateBox") {
      return;
    }
    const currentList = state.state.confirmationBoxesReceivedByKeyHolderId;
    if (currentList.includes(keyHolderId)) {
      return;
    }

    return set({
      state: {
        ...state.state,
        confirmationBoxesReceivedByKeyHolderId: [...currentList, keyHolderId],
      },
    });
  },
  fromCreateBox: ({ roomToken, encryptedMessage, key }) => {
    const createBoxState = useCreateBoxStore.getState();
    set({
      type: "fromCreateBox",
      state: {
        roomToken,
        content: createBoxState.content,
        encryptedMessage: encryptedMessage,
        generatedKey: key,
        leader: createBoxState.leader,
        keyHolders: createBoxState.keyHolders,
        threshold: createBoxState.threshold,
        title: createBoxState.title,
        confirmationBoxesReceivedByKeyHolderId: [],
      },
    });
  },
  fromJoinBox: ({ encryptedMessage, key, roomToken }) => {
    const joinBoxState = useJoinBoxStore.getState();
    set({
      type: "fromJoinBox",
      state: {
        roomToken,
        content: joinBoxState.content,
        encryptedMessage: encryptedMessage,
        generatedKey: key,
        leader: joinBoxState.leader,
        otherKeyHolders: joinBoxState.otherKeyHolders,
        title: joinBoxState.title,
        you: joinBoxState.you,
        threshold: joinBoxState.threshold,
      },
    });
  },
});

export const useDownloadBoxStore = create<
  DownloadBoxStoreStateType & Actions
>()(
  devtools(createStoreFn, {
    name: "downloadBoxStore",
  }),
);
