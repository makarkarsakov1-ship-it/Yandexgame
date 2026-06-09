// src/scenes/GameScene.ts
// Main game loop scene — drives economy ticks

import Phaser from 'phaser';
import { gameState } from '../systems/gameState';

export class GameScene extends Phaser.Scene {
  private lastTickTime = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.lastTickTime = this.time.now;
  }

  update(time: number): void {
    const deltaSec = (time - this.lastTickTime) / 1000;
    this.lastTickTime = time;

    // Clamp delta to prevent huge jumps if tab was hidden
    const clampedDelta = Math.min(deltaSec, 1.0);
    if (clampedDelta > 0) {
      gameState.tick(clampedDelta);
    }
  }
}
