import { useDownloadBoxStore } from "@/stores";
import type { ParticipantType } from "@/stores/boxStore/common-types";

export const useDownloadLockedBoxState = () => {
  const state = useDownloadBoxStore((state) => state);

  if (state.type === "fromCreateBox") {
    const {
      content,
      leader,
      keyHolders,
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
      keyHolders: keyHolders,
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
      otherKeyHolders,
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
      otherKeyHolders,
      you,
    };
  }

  return {
    type: "",
    title: "",
    threshold: "",
    leader: {
      id: "",
      name: "",
      userAgent: "",
    } satisfies ParticipantType,
    keyHolders: [],
    content: "",
  };
  // const title = useCreateBoxStore((state) => state.title);
};
