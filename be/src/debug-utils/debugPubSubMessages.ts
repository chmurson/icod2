import { shortenPeerId } from "@icod2/protocols";
import type { PubSub } from "@libp2p/interface";
import type { Libp2p } from "libp2p";
import type { Logger } from "src/logger.js";

export const debugPubSubMessages = (
  libp2p: Libp2p<{ pubsub: PubSub }>,
  logger: Logger,
) => {
  libp2p.services.pubsub.addEventListener("message", (e) => {
    const msg = e.detail;
    logger.info(
      {
        // @ts-expect-error
        from: shortenPeerId(msg.from?.toString()),
        topic: msg.topic,
        dataLength: msg.data?.length ?? 0,
      },
      "Pubsub message on roomToken (might be discovery or app msg)",
    );
  });
};
