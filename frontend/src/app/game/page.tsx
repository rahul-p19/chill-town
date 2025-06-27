"use client";

import { redirect } from "next/navigation";
import React, { useEffect } from "react";
import toast from "react-hot-toast";

const Page = () => {
	useEffect(() => {

		if(window.innerWidth <= 1000){
			toast("Sorry, we do not support mobile devices yet. Redirecting");
			setTimeout(()=>{
				redirect("/");
			},3000);
			return;
		}

		async function initGame() {
			const Phaser = await import("phaser");
			const { GameConfiguration } = await import("@/Game/config");
			const game = new Phaser.Game(GameConfiguration);
			if(game) console.log("Loading Game");
		}
		initGame();
	}, []);

	return (
		<div className="grid place-items-center bg-black">
			<div id="game-content" />;
		</div>
	);
};

export default Page;
