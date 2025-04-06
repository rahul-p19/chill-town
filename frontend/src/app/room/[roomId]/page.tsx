"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import io from "socket.io-client";
import Peer, { SignalData } from "simple-peer";
import { useRouter } from "next/router";

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

const Room = ({params}) => {
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
		<div className="h-screen w-full bg-zinc-900 grid grid-cols-3 p-6 gap-6">
			<div className="fixed bottom-5 right-5 flex flex-col gap-y-3">
				<div className="flex flex-col gap-y-2">
					<button
						onClick={toggleMic}
						className="bg-amber-500 rounded-sm text-sm px-4 py-1">
						{toggleMicText}
					</button>
					<button
						onClick={toggleCamera}
						className="bg-amber-500 rounded-sm text-sm px-4 py-1">
						{toggleCameraText}
					</button>
					{sharingScreen ? (
						<button
							className="bg-amber-500 rounded-sm text-sm px-4 py-1"
							onClick={stopSharingScreen}>
							Stop Sharing Screen
						</button>
					) : (
						<button
							className="bg-amber-500 rounded-sm text-sm px-4 py-1"
							onClick={shareScreen}>
							Share Screen
						</button>
					)}
				</div>
				<video
					muted
					ref={userVideo}
					autoPlay
					playsInline
					className="rounded-lg h-[30vh]"
				/>
			</div>
			{remoteVideos}
		</div>
	);
};

export default Room;
