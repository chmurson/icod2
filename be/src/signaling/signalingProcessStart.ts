import type { WebsocketHandler } from "./WebSocketHandler";

export function signalingProcessStart(
	wsCaller: WebsocketHandler,
	wsCallee: WebsocketHandler,
) {
	// await message with offer + ice canidates from Caller
	// sends the offer + ice candidate to Callee
	// await message with answer from Callee
	// sends the answer to Caller
}

class WebSocketSingleMessageHandler<T> {
	constructor(
		private websocketHandler: WebsocketHandler,
		messageHandler: () => Promise<T>,
		mesageResolver: (message: object) => boolean,
	) {}

	webSocketHandler.onMessage((msg) => this.handleLegacyMessage(msg, ws));
	resolve(): Promise<void> {
	  return new Promise((resolve,reject)=>{
			this.websocketHandler.onMessage((data) => {
			  if (data)
			});
		})
	}
}
