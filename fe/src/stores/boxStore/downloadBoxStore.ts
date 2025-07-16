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
        | "keyholders"
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
        | "otherKeyholders"
        | "you"
        | "title"
        | "content"
        | "encryptedMessage"
        | "generatedKey"
        | "threshold"
      >;
    }
  | {
      type: undefined;
    };

type Actions = {
  fromCreateBox: () => void;
  fromJoinBox: () => void;
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
        keyholders: createBoxState.keyholders,
        threshold: createBoxState.threshold,
        title: createBoxState.title,
      },
    });
  },
  fromJoinBox: () => {
    const joinBoxState = useJoinBoxCreationState.getState();
    set({
      type: "fromJoinBox",
      state: {
        content: joinBoxState.content,
        encryptedMessage: joinBoxState.encryptedMessage,
        generatedKey: joinBoxState.generatedKey,
        leader: joinBoxState.leader,
        otherKeyholders: joinBoxState.otherKeyholders,
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
