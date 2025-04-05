"use client"

import React, { useEffect } from 'react'

const Page = () => {
  useEffect(() => {
    async function initGame() {
      const Phaser = await import("phaser");
      const game = new Phaser.Game({
        type: Phaser.AUTO, // automatically detect browser WebGL support
        parent: 'game-content', // parent DOM element
        height: 200,
        width: 500,
        scene: {
          preload: () => {
          },

          create: () => {
          },
          update: () => {
          }
        }
      })
    }
    initGame();
  }, []);

  return <div id="game-content" />;
}

export default Page
