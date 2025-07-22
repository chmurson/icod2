import { DataChannelMessageRouter } from "@/services/webrtc/DataChannelMessageRouter";
import { useOpenLockedBoxStore } from "@/stores/boxStore/openLockedBoxStore";
import type {
  LeaderError,
  LeaderWelcome,
} from "../commons/leader-keyholder-interface";
import { isKeyholderHello } from "../commons/leader-keyholder-interface";

export const router = new DataChannelMessageRouter();

router.addHandler(isKeyholderHello, (localId, message, dataChannelMng) => {
  console.log("[OpenLockedBox] Received message in handler:", message);
  const store = useOpenLockedBoxStore.getState();
  const actions = useOpenLockedBoxStore.getState().actions;

  const offline = store.offLineKeyHolders.find((x) => x.id === message.id);
  const online = store.onlineKeyHolders.find((x) => x.id === message.id);
  const encryptedMatch = store.encryptedMessage === message.encryptedMessage;
  const keyMatch = store.key === message.key;

  if (!offline || online || !encryptedMatch || keyMatch) {
    const errorMsg: LeaderError = {
      type: "leader:error",
      reason: keyMatch
        ? "You are trying to connect with key that is already present in session"
        : !offline
          ? "Keyholder not found or already online."
          : !encryptedMatch
            ? "Encrypted message does not match."
            : "Unknown error.",
    };
    dataChannelMng?.sendMessageToSinglePeer(localId, errorMsg);
    return;
  }

  // All good, add to onlineKeyHolders
  actions.connectKeyHolder({
    id: message.id,
    name: offline.name,
    userAgent: message.userAgent,
  });

  const welcomeMsg: LeaderWelcome = {
    type: "leader:welcome",
    name: store.you.name,
    userAgent: store.you.userAgent,
    id: store.you.id,
    onlineKeyHolders: [
      ...store.onlineKeyHolders,
      { id: message.id, name: offline.name, userAgent: message.userAgent },
    ],
  };
  dataChannelMng?.sendMessageToSinglePeer(localId, welcomeMsg);
});
