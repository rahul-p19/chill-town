"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const avatars = [
  "https://ipfs.io/ipfs/bafkreihlaw7zoxykg2pbbe332a6pp74fjh7j7hb25ehz6nfeukenntqwgy",
  "https://ipfs.io/ipfs/bafkreidk42gcnifgom4uqc74huhqvxz72yjfdshjqjkwukow3oiwnuku7e",
];

const JoinRoom = () => {
  const router = useRouter();
  const [roomID, setRoomID] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);

  const joinRoom = () => {
    if (!roomID) return alert("Please enter a room ID!");
    // You can store the avatar in localStorage or state mgmt if needed later
    localStorage.setItem("selectedAvatar", selectedAvatar);
    window.location.href = 'game';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white px-4 py-10 font-pixelify">
      <h1 className="text-6xl font-extrabold mb-10 drop-shadow-lg">
        🎮 
        <span className=" bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-red-500">
          Join the Arena
          </span>
      </h1>

      <div className="bg-zinc-800/50 p-8 rounded-2xl shadow-lg w-full max-w-xl text-center font-sans">
        <label className="font-bold mb-3 block text-xl">Choose Your Avatar</label>
        <div className="flex justify-around gap-4 my-6 h-full w-full">
          {avatars.map((avatar) => (
            <img
              key={avatar}
              src={avatar}
              alt="avatar"
              onClick={() => setSelectedAvatar(avatar)}
              className={`w-20 h-20 rounded-full cursor-pointer border-4 transition-all duration-200 ${selectedAvatar === avatar
                ? "border-amber-400 shadow-md"
                : "border-transparent opacity-80 hover:opacity-100"
                }`}
            />
          ))}
        </div>

          <div className="flex flex-col gap-y-2 items-center">
        <input
          type="text"
          placeholder="Enter Room Code..."
          value={roomID}
          onChange={(e) => setRoomID(e.target.value)}
          className="w-fit px-4 py-3 rounded-full mb-6 text-gray-300 focus:outline-none focus:ring-2 border border-white/20 focus:border-transparent focus:ring-amber-500"
          />

        <button
          onClick={joinRoom}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg transition-all duration-300 hover:scale-105"
          >
          🚀 Join Room
        </button>
          </div>
      </div>
    </div>
  );
};

export default JoinRoom;

