import { detect } from "detect-browser";
import { useEffect, useRef, useState } from "react";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";

const SIGNALING_SERVER_URL = "ws://localhost:8080";

const getDeviceIcon = (browserInfo: ReturnType<typeof detect>) => {
  if (!browserInfo) {
    return <QuestionMarkIcon />;
  }

  if (browserInfo.type === "react-native") {
    return <SmartphoneIcon />;
  }

  if (browserInfo.type === "browser") {
    return <LaptopMacIcon />;
  }

  return <QuestionMarkIcon />;
};

function WebRTCPlayground() {
  const [messages, setMessages] = useState<{ id: string; text: React.ReactNode }[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const dataChannelsRef = useRef<Map<string, RTCDataChannel>>(new Map());
  const [dataChannelStates, setDataChannelStates] = useState<
    Record<string, string>
  >({});
  const [myId, setMyId] = useState<string | null>(null);
  const [peers, setPeers] = useState<Record<string, string>>({}); // peerId: userAgent

  const myIdRef = useRef<string | null>(null);
  const peersRef = useRef<Record<string, string>>({});

  useEffect(() => {
    peersRef.current = peers;
  }, [peers]);

  useEffect(() => {
    const ws = new WebSocket(SIGNALING_SERVER_URL);
    wsRef.current = ws;

    const setupPeerConnection = (peerId: string, isInitiator: boolean) => {
      const peer = new RTCPeerConnection();
      peerConnectionsRef.current.set(peerId, peer);

      peer.onicecandidate = (event) => {
        if (event.candidate && wsRef.current) {
          wsRef.current.send(
            JSON.stringify({
              type: "candidate",
              targetId: peerId,
              candidate: event.candidate,
            })
          );
        }
      };

      const handleDataChannel = (dc: RTCDataChannel) => {
        dataChannelsRef.current.set(peerId, dc);
        dc.onopen = () => {
          setDataChannelStates((prev) => ({ ...prev, [peerId]: "open" }));
        };
        dc.onclose = () => {
          setDataChannelStates((prev) => ({ ...prev, [peerId]: "closed" }));
        };
        dc.onmessage = (ev) => {
          const msg = JSON.parse(ev.data);
          const peerUserAgent = peersRef.current[peerId] || peerId;
          const browserInfo = detect(peerUserAgent);
          const displayName = browserInfo ? browserInfo.name : peerUserAgent;
          setMessages((msgs) => [
            ...msgs,
            {
              id: `${Date.now()}-${Math.random()}`,
              text: (
                <>
                  {getDeviceIcon(browserInfo)} {displayName}: {msg.message}
                </>
              ),
            },
          ]);
        };
      };

      if (isInitiator) {
        const dataChannel = peer.createDataChannel("chat");
        handleDataChannel(dataChannel);
      } else {
        peer.ondatachannel = (event) => {
          handleDataChannel(event.channel);
        };
      }

      return peer;
    };

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "greeting", id: navigator.userAgent }));
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "id") {
        setMyId(data.id);
        myIdRef.current = data.id;
      } else if (data.type === "peerConnected") {
        setPeers((prev) => ({ ...prev, [data.peerId]: data.userAgent }));
        if (myIdRef.current && myIdRef.current < data.peerId) {
          const peer = setupPeerConnection(data.peerId, true);
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          wsRef.current?.send(
            JSON.stringify({ type: "offer", targetId: data.peerId, offer })
          );
        }
      } else if (data.type === "peerDisconnected") {
        setPeers((prev) => {
          const newPeers = { ...prev };
          delete newPeers[data.peerId];
          return newPeers;
        });
        peerConnectionsRef.current.get(data.peerId)?.close();
        peerConnectionsRef.current.delete(data.peerId);
        dataChannelsRef.current.delete(data.peerId);
        setDataChannelStates((prev) => {
          const newState = { ...prev };
          delete newState[data.peerId];
          return newState;
        });
      } else if (data.type === "offer") {
        let peer = peerConnectionsRef.current.get(data.senderId);
        if (!peer) {
          peer = setupPeerConnection(data.senderId, false);
        }
        await peer.setRemoteDescription(data.offer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        wsRef.current?.send(
          JSON.stringify({ type: "answer", targetId: data.senderId, answer })
        );
      } else if (data.type === "answer") {
        const peer = peerConnectionsRef.current.get(data.senderId);
        if (peer) {
          await peer.setRemoteDescription(data.answer);
        }
      } else if (data.type === "candidate") {
        const peer = peerConnectionsRef.current.get(data.senderId);
        if (peer?.remoteDescription) {
          try {
            await peer.addIceCandidate(data.candidate);
          } catch (e) {
            console.error("Error adding received ice candidate", e);
          }
        }
      } else if (data.type === "greeting") {
        setMessages((msgs) => [
          ...msgs,
          { id: `${Date.now()}-${Math.random()}`, text: data.message },
        ]);
      }
    };

    return () => {
      ws.close();
      peerConnectionsRef.current.forEach((peer) => peer.close());
    };
  }, []);

  const [messageInput, setMessageInput] = useState("");

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!myId) return;

    const messageToSend = JSON.stringify({ message: messageInput });

    let sentToAtLeastOne = false;
    dataChannelsRef.current.forEach((dataChannel) => {
      if (dataChannel.readyState === "open") {
        dataChannel.send(messageToSend);
        sentToAtLeastOne = true;
      }
    });

    if (sentToAtLeastOne) {
      const browserInfo = detect(navigator.userAgent);
      const displayName = browserInfo ? browserInfo.name : "You";
      setMessages((msgs) => [
        ...msgs,
        {
          id: `${Date.now()}-${Math.random()}`,
          text: (
            <>
              {getDeviceIcon(browserInfo)} {displayName}: {messageInput}
            </>
          ),
        },
      ]);
      setMessageInput(""); // Clear input after sending
    } else {
      alert("No active data channels to send message.");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>WebRTC Playground</h2>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          style={{ marginRight: 8, padding: "8px 12px", fontSize: "16px" }}
        />
        <button type="submit" style={{ padding: "8px 12px", fontSize: "16px" }}>
          Send
        </button>
      </form>
      <p>My ID: {myId}</p>
      <h3>Connected Peers:</h3>
      <ul>
        {Object.entries(peers).map(([peerId, userAgent]) => {
          const browserInfo = detect(userAgent);

          return (
            <li key={peerId}>
              {getDeviceIcon(browserInfo)} {browserInfo?.name} - Data Channel:{" "}
              {dataChannelStates[peerId] || "connecting"}
            </li>
          );
        })}
      </ul>
      <h3>Messages:</h3>
      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>{msg.text}</li>
        ))}
      </ul>
    </div>
  );
}

export default WebRTCPlayground;
