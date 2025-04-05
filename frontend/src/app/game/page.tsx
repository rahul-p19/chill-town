"use client"

import React, { useEffect } from 'react'

const Page = () => {
  useEffect(() => {
    async function initGame() {
      const Phaser = await import("phaser");
      const { GameConfiguration } = await import('@/Game/config');
      const game = new Phaser.Game(GameConfiguration)
    }
    initGame();
  }, []);

  return <div id="game-content" />;
}

export default Page
