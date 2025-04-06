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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white px-4 py-10">
      <h1 className="text-5xl font-extrabold text-amber-400 mb-10 drop-shadow-lg animate-pulse">
        🎮 Join the Arena
      </h1>

      <div className="bg-zinc-800 p-8 rounded-2xl shadow-lg w-full max-w-xl text-center">
        <label className="text-lg font-bold mb-3 block">Choose Your Avatar</label>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {avatars.map((avatar) => (
            <img
              key={avatar}
              src={avatar}
              alt="avatar"
              onClick={() => setSelectedAvatar(avatar)}
              className={`w-20 h-20 rounded-full cursor-pointer border-4 transition-all duration-200 ${selectedAvatar === avatar
                ? "border-amber-400 scale-110 shadow-md"
                : "border-transparent opacity-80 hover:opacity-100"
                }`}
            />
          ))}
        </div>

        <input
          type="text"
          placeholder="Enter Room Code..."
          value={roomID}
          onChange={(e) => setRoomID(e.target.value)}
          className="w-full px-4 py-2 rounded-lg mb-6 text-black focus:outline-none focus:ring-2 focus:ring-amber-500"
        />

        <button
          onClick={joinRoom}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg transition-all duration-300 hover:scale-105"
        >
          🚀 Join Room
        </button>
      </div>
    </div>
  );
};

export default JoinRoom;

