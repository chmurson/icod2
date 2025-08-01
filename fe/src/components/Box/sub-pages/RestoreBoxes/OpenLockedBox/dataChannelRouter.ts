import { DataChannelMessageRouter } from "@/services/webrtc/DataChannelMessageRouter";
import { useOpenLockedBoxStore } from "@/stores/boxStore/openLockedBoxStore";
import { createKeyholderHelloHash } from "@/utils/createKeyholderHelloHash";
import type {
  LeaderError,
  LeaderWelcome,
} from "../commons/leader-keyholder-interface";
import {
  isFollowerSendsPartialStateMessage,
  isKeyholderHello,
  isKeyholderKey,
} from "../commons/leader-keyholder-interface";
import { usePeerToHolderMapRef } from "../commons/usePeerToHolderMapRef";
import { relayKey } from "./dataChannelSendMessages";

export const router = new DataChannelMessageRouter();

router.addHandler(isKeyholderHello, async (peerId, message, dataChannelMng) => {
  const store = useOpenLockedBoxStore.getState();
  const actions = useOpenLockedBoxStore.getState().actions;

  const offline = store.offLineKeyHolders.find((x) => x.id === message.id);
  const online = store.onlineKeyHolders.find((x) => x.id === message.id);

  const encryptedMatch = await validateHash(message.hash);

  let errorReason: string | null = null;

  if (!encryptedMatch) {
    errorReason = "Encrypted message does not match.";
  } else if (!offline && !online) {
    errorReason = "Keyholder not found";
  } else if (online) {
    errorReason = "Keyholder not found or already online.";
  }

  if (errorReason) {
    const errorMsg: LeaderError = {
      type: "leader:error",
      reason: errorReason,
    };
    dataChannelMng?.sendMessageToSinglePeer(peerId, errorMsg);
    return;
  }

  // All good, add to onlineKeyHolders
  actions.connectKeyHolder({
    id: message.id,
    name: offline?.name ?? "",
    userAgent: message.userAgent,
  });

  const keyHolderId = message.id;

  const welcomeMsg: LeaderWelcome = {
    type: "leader:welcome",
    name: store.you.name,
    userAgent: store.you.userAgent,
    id: store.you.id,
    onlineKeyHolders: [
      ...store.onlineKeyHolders,
      {
        id: message.id,
        name: offline?.name ?? "",
        userAgent: message.userAgent,
      },
    ],
  };
  usePeerToHolderMapRef.getValue().setPair({ peerId, keyHolderId });
  dataChannelMng?.sendMessageToSinglePeer(peerId, welcomeMsg);
});

router.addHandler(isFollowerSendsPartialStateMessage, (peerId, message) => {
  const { actions } = useOpenLockedBoxStore.getState();

  const keyHolderId = usePeerToHolderMapRef.getValue().getKeyholerId(peerId);
  if (!keyHolderId) {
    console.warn(`Keyholder id not found for peer: ${peerId}`);
    return;
  }

  const shareAccessKeyByKeyholderId = Object.fromEntries(
    message.keyHoldersIdsToSharedKeyWith.map((keyHolderId) => [
      keyHolderId,
      true,
    ]),
  );

  actions.setShareAccessKeyByKeyholderId(
    keyHolderId,
    shareAccessKeyByKeyholderId,
  );
});

router.addHandler(isKeyholderKey, (_, message, dataChannelMng) => {
  const { keyHolderId, key } = message;
  const { actions, shareAccessKeyMapByKeyHolderId, you } =
    useOpenLockedBoxStore.getState();

  if (shareAccessKeyMapByKeyHolderId[keyHolderId][you.id]) {
    actions.addReceivedKey({
      fromKeyHolderId: keyHolderId,
      key,
    });
  }

  const peersShareToKeys = shareAccessKeyMapByKeyHolderId[keyHolderId];

  const toSharePeersToShareKey = Object.keys(peersShareToKeys).reduce(
    (accumulator, key) => {
      if (peersShareToKeys[key] === true && key !== you.id) {
        accumulator[key] = true;
      }
      return accumulator;
    },
    {} as Record<string, boolean>,
  );

  if (toSharePeersToShareKey) {
    if (!dataChannelMng) {
      return;
    }

    for (const keyReceiverId of Object.keys(toSharePeersToShareKey)) {
      relayKey(dataChannelMng, {
        keyHolderId,
        keyReceiverId,
        keyToRelay: key,
      });
    }
  }
});

const validateHash = async (hashToCompare: string) => {
  const store = useOpenLockedBoxStore.getState();

  const hash = await createKeyholderHelloHash({
    encryptedMessage: store.encryptedMessage,
    numberOfKeys:
      store.offLineKeyHolders.length + store.onlineKeyHolders.length,
    threshold: store.keyThreshold,
    allKeyHoldersId: [
      ...store.offLineKeyHolders.map((x) => x.id),
      ...store.onlineKeyHolders.map((x) => x.id),
      store.you.id,
    ],
  });

  return hash === hashToCompare;
};
