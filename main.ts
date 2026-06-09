// src/main.ts

import Phaser from 'phaser';
import { BackgroundScene } from './scenes/BackgroundScene';
import { GameScene } from './scenes/GameScene';
import { gameState } from './systems/gameState';
import { adsSystem } from './systems/adsSystem';
import { uiController } from './ui/uiController';

async function bootstrap(): Promise<void> {
  // 1. Init Yandex SDK (non-blocking)
  await adsSystem.init();

  // 2. Init game state (loads save, calculates offline reward)
  gameState.init();

  // 3. Determine viewport
  const W = window.innerWidth;
  const H = window.innerHeight;

  // 4. Launch Phaser (background visuals + game tick)
  const phaserConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: W,
    height: H,
    backgroundColor: '#0d1117',
    parent: 'game-container',
    transparent: false,
    scene: [BackgroundScene, GameScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      antialias: false,
      pixelArt: false,
    },
    audio: {
      noAudio: true,
    },
  };

  new Phaser.Game(phaserConfig);

  // 5. Mount HTML UI over the canvas
  const overlay = document.getElementById('ui-overlay');
  if (!overlay) throw new Error('ui-overlay element not found');
  uiController.init(overlay);

  // 6. Handle page unload — save on exit
  window.addEventListener('beforeunload', () => {
    gameState.destroy();
  });

  // 7. Handle visibility change — recalc when coming back
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // Already handled by offline system on next save load,
      // but we can add money for the time hidden
      // The game ticker will resume naturally
    }
  });
}

bootstrap().catch(console.error);
