"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import io from "socket.io-client";
import Peer, { SignalData } from "simple-peer";
import { Camera, CameraOff, Mic, MicOff } from "lucide-react";

const streamMap = new Map();
let videoConstraints: { height: number; width: number };

const iceServers = [
  { urls: "stun:stun.l.google.com:19302" }, // Public STUN server
  { urls: "stun:stun1.l.google.com:19302" }, // Backup STUN server
];

const Video = (props: { peer: Peer.Instance }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.srcObject = streamMap.get(props.peer);

    props.peer.on("stream", (stream: MediaStream) => {
      if (ref.current) ref.current.srcObject = stream;
    });
  }, []);

  return <video playsInline autoPlay ref={ref} className="border rounded-lg" />;
};

// const videoConstraints = {
// 	height: window.innerHeight / 2,
// 	width: (2 * window.innerWidth) / 5,
// };

const Room = ({ params }) => {
  const [peers, setPeers] = useState<Peer.Instance[]>([]);
  const [sharingScreen, setSharingScreen] = useState<boolean>(false);
  const [toggleMicText, setToggleMicText] = useState<string>("Turn off mic");
  // const [roomID, setRoomID] = useState<string>("");
  const [toggleCameraText, setToggleCameraText] =
    useState<string>("Turn off camera");
  const socketRef = useRef<SocketIOClient.Socket>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<{ peerID: string; peer: Peer.Instance }[]>([]);
  const currentStreamRef = useRef<MediaStream>(null);
  // const params = useRouter();
  const roomID = params.roomID;

  useEffect(() => {
    videoConstraints = {
      height: window.innerHeight / 2,
      width: (2 * window.innerWidth) / 5,
    };

    const connectToSignallingServer = async () => {
      socketRef.current = io.connect("http://localhost:2567");
      // socketRef.current = io.connect("https://6znr3gxn-8000.inc1.devtunnels.ms");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: true,
      });

      currentStreamRef.current = stream;

      if (userVideo.current)
        userVideo.current.srcObject = currentStreamRef.current;

      if (socketRef.current) {
        socketRef.current.emit("joinRoom", roomID);

        socketRef.current.on("allUsers", (users: string[]) => {
          const peers: Peer.Instance[] = [];
          users.forEach((userID: string) => {
            if (socketRef.current?.id) {
              const peer = createPeer(
                userID,
                socketRef.current?.id,
                currentStreamRef.current ?? stream
              );
              peersRef.current.push({
                peerID: userID,
                peer,
              });
              peers.push(peer);
            }
          });
          setPeers(peers);
        });
      }

      socketRef.current?.on(
        "userJoined",
        async (payload: { signal: SignalData; callerID: string }) => {
          const peer = addPeer(
            payload.signal,
            payload.callerID,
            currentStreamRef.current ?? stream
          );
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });

          setPeers((users) => {
            return [...users, peer];
          });
        }
      );

      socketRef.current?.on(
        "receiveReturnSignal",
        (payload: { id: string; signal: SignalData }) => {
          const item = peersRef.current.find(
            (p: { peerID: string; peer: Peer.Instance }) =>
              p.peerID === payload.id
          );
          if (item) item.peer.signal(payload.signal);
        }
      );

      socketRef.current?.on("userDisconnected", (id: string) => {
        const leavingPeer = peersRef.current.find((p) => p.peerID === id);
        if (leavingPeer) leavingPeer.peer.destroy();
        const peers = peersRef.current.filter((p) => p.peerID !== id);
        peersRef.current = peers;
        setPeers(peers.map((p) => p.peer));
      });
    };
    connectToSignallingServer();
  }, []);

  function createPeer(
    userToSignal: string,
    callerID: string,
    stream: MediaStream
  ) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: {
        iceServers: iceServers,
      },
    });

    peer.on("signal", (signal) => {
      console.log("Client: sending initiator signal.");
      socketRef.current?.emit("sendSignal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    peer.on("close", () => {
      console.log("peer closed");
    });

    peer.on("error", (err) => {
      console.log("create peer error: ", err);
    });

    return peer;
  }

  function addPeer(
    incomingSignal: string | SignalData,
    callerID: string,
    stream: MediaStream
  ) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: {
        iceServers: iceServers,
      },
    });

    peer.on("signal", (signal) => {
      console.log("Client: sending return signal.");
      socketRef.current?.emit("returnSignal", { signal, callerID });
    });

    peer.on("stream", (incomingStream) => {
      streamMap.set(peer, incomingStream);
    });

    try {
      peer.signal(incomingSignal);
    } catch (err) {
      console.log("Signalling error: ", err);
    }

    peer.on("error", (err) => {
      console.log("Add Peer Error: ", err);
    });

    peer.on("close", () => {
      console.log("peer closed");
      socketRef.current?.off("callAccepted");
    });

    return peer;
  }

  function shareScreen() {
    navigator.mediaDevices
      .getDisplayMedia({ video: true, audio: true })
      .then((stream) => {
        currentStreamRef.current = stream;

        if (userVideo.current) userVideo.current.srcObject = stream;

        const updatedPeers: Peer.Instance[] = [];

        peersRef.current.forEach(({ peer }) => {
          peer.replaceTrack(
            peer.streams[0].getVideoTracks()[0],
            stream.getVideoTracks()[0],
            peer.streams[0]
          );
          peer.replaceTrack(
            peer.streams[0].getAudioTracks()[0],
            stream.getAudioTracks()[0],
            peer.streams[0]
          );

          updatedPeers.push(peer);
        });

        setPeers(updatedPeers);

        setSharingScreen(true);
      });
  }

  function stopSharingScreen() {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        currentStreamRef.current = stream;

        if (userVideo.current) userVideo.current.srcObject = stream;

        const updatedPeers: Peer.Instance[] = [];

        peersRef.current.forEach(({ peer }) => {
          peer.replaceTrack(
            peer.streams[0].getVideoTracks()[0],
            stream.getVideoTracks()[0],
            peer.streams[0]
          );
          peer.replaceTrack(
            peer.streams[0].getAudioTracks()[0],
            stream.getAudioTracks()[0],
            peer.streams[0]
          );

          updatedPeers.push(peer);
        });

        setPeers(updatedPeers);

        setSharingScreen(false);
      });
  }

  function toggleMic() {
    const audioTrack = currentStreamRef.current
      ?.getTracks()
      .find((track) => track.kind === "audio");
    if (!audioTrack) return;
    if (audioTrack.enabled) {
      audioTrack.enabled = false;
      setToggleMicText("Turn on mic");
    } else {
      audioTrack.enabled = true;
      setToggleMicText("Turn off mic");
    }
  }

  function toggleCamera() {
    const videoTrack = currentStreamRef.current
      ?.getTracks()
      .find((track) => track.kind === "video");
    if (!videoTrack) return;
    if (videoTrack.enabled) {
      videoTrack.enabled = false;
      setToggleCameraText("Turn on camera");
    } else {
      videoTrack.enabled = true;
      setToggleCameraText("Turn off camera");
    }
  }

  const remoteVideos = useMemo(
    () =>
      peers.map((peer, index) => {
        const peerRef = peersRef.current.find((p) => p.peer === peer);
        const key = peerRef ? peerRef.peerID : index;
        return <Video key={key} peer={peer} />;
      }),
    [peers]
  );

  return (
    <div className="h-screen w-full bg-gradient-to-br from-zinc-800 to-zinc-950 text-white p-6 font-sans">
      <h1 className="text-6xl font-bold text-center mb-8 text-amber-400 drop-shadow-lg">
		<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 font-pixelify">
			Welcome to Room
		</span>	
      </h1>

      <div className="grid grid-cols-3 gap-6">
        {remoteVideos}
      </div>

      <div className="fixed bottom-5 right-5 flex flex-col items-end gap-y-3 z-50">
        <div className="flex flex-col gap-y-3 font-sans">
          <button
            onClick={toggleMic}
            className={`${toggleMicText === "Turn on mic" ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500" : "bg-red-500"}  text-white flex justify-center font-semibold px-6 py-2 rounded-full shadow-md hover:scale-105 transition-transform duration-200`}
          >
			{toggleMicText === "Turn off mic" ? <MicOff /> : <Mic />}
          </button>
          <button
            onClick={toggleCamera}
            className={`${toggleCameraText === "Turn off mic" ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500" : "bg-red-500"} flex justify-center text-white font-semibold px-6 py-2 rounded-full shadow-md hover:scale-105 transition-transform duration-200`}
          >
			{toggleCameraText === "Turn on camera" ? <Camera /> : <CameraOff />}
            {/* {toggleCameraText} */}
          </button>
          {sharingScreen ? (
            <button
              onClick={stopSharingScreen}
              className="bg-gradient-to-r from-red-500 to-yellow-500 hover:from-yellow-500 hover:to-red-500 text-white font-semibold px-6 py-2 rounded-full shadow-md hover:scale-105 transition-transform duration-200"
            >
              🛑 Stop Sharing Screen
            </button>
          ) : (
            <button
              onClick={shareScreen}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-blue-500 hover:to-green-500 text-white font-semibold px-6 py-2 rounded-full shadow-md hover:scale-105 transition-transform duration-200"
            >
              🎥 Share Screen
            </button>
          )}
        </div>

        <video
          muted
          ref={userVideo}
          autoPlay
          playsInline
          className="rounded-xl mt-4 h-[30vh] border-4 border-amber-500 shadow-xl"
        />
      </div>
    </div>
  );
};

export default Room;
