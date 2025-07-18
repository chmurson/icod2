import { create } from "zustand";

interface StoreLeaderIdState {
  leaderId: string | null;
  setLeaderId: (id: string) => void;
}

export const useStoreLeaderId = create<StoreLeaderIdState>((set) => ({
  leaderId: null,
  setLeaderId: (id) => set({ leaderId: id }),
}));
