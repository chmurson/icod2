import { useCreateBoxStore } from "@/stores";

export const usePartOfCreateBoxStore = () => {
  const title = useCreateBoxStore((state) => state.title);
  const status = useCreateBoxStore((state) => state.state);
  const content = useCreateBoxStore((state) => state.content);
  const leader = useCreateBoxStore((state) => state.leader);
  const threshold = useCreateBoxStore((state) => state.threshold);
  const keyHolders = useCreateBoxStore((state) => state.keyHolders);
  const contentPreviewSharedWith = useCreateBoxStore(
    (state) => state.contentPreviewSharedWith,
  );
  const actions = useCreateBoxStore((state) => state.actions);

  return {
    state: {
      status,
      title,
      content,
      leader,
      threshold,
      keyHolders,
      contentPreviewSharedWith,
    },
    actions,
  };
};
