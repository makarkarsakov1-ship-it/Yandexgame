// src/scenes/BackgroundScene.ts
// Phaser scene: animated city background, moving trucks on road

import Phaser from 'phaser';

interface TruckSprite {
  x: number;
  y: number;
  speed: number;
  color: number;
  width: number;
}

export class BackgroundScene extends Phaser.Scene {
  private trucks: TruckSprite[] = [];
  private graphics!: Phaser.GameObjects.Graphics;
  private time_elapsed = 0;

  constructor() {
    super({ key: 'BackgroundScene' });
  }

  create(): void {
    this.graphics = this.add.graphics();
    this.spawnInitialTrucks();
  }

  private spawnInitialTrucks(): void {
    const colors = [0x4a90d9, 0xf59e0b, 0xef4444, 0x6366f1, 0x10b981];
    for (let i = 0; i < 5; i++) {
      this.trucks.push({
        x: Phaser.Math.Between(0, this.cameras.main.width),
        y: this.cameras.main.height - 40,
        speed: Phaser.Math.FloatBetween(1.5, 3.5),
        color: colors[i % colors.length],
        width: Phaser.Math.Between(30, 60),
      });
    }
  }

  update(time: number, delta: number): void {
    this.time_elapsed += delta;
    const g = this.graphics;
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    g.clear();

    // Sky gradient
    g.fillGradientStyle(0x0d1117, 0x0d1117, 0x1a2744, 0x1a2744, 1);
    g.fillRect(0, 0, w, h);

    // City silhouette
    this.drawCitySilhouette(g, w, h);

    // Road
    g.fillStyle(0x1c2333);
    g.fillRect(0, h - 55, w, 55);
    g.fillStyle(0x30363d);
    g.fillRect(0, h - 58, w, 3);
    // Road markings
    g.fillStyle(0xf59e0b, 0.5);
    const markWidth = 40;
    const markGap = 30;
    const offset = (this.time_elapsed * 0.05) % (markWidth + markGap);
    for (let x = -markWidth + offset; x < w + markWidth; x += markWidth + markGap) {
      g.fillRect(x, h - 33, markWidth, 4);
    }

    // Update & draw trucks
    for (const truck of this.trucks) {
      truck.x += truck.speed;
      if (truck.x > w + 80) {
        truck.x = -80;
        truck.speed = Phaser.Math.FloatBetween(1.5, 3.5);
        truck.color = [0x4a90d9, 0xf59e0b, 0xef4444, 0x6366f1, 0x10b981][Phaser.Math.Between(0, 4)];
        truck.width = Phaser.Math.Between(30, 60);
      }
      this.drawTruck(g, truck, h);
    }

    // Stars in sky
    if (this.time_elapsed < 100) {
      for (let i = 0; i < 30; i++) {
        const sx = (i * 137.5) % w;
        const sy = (i * 73.1) % (h * 0.5);
        const alpha = 0.3 + Math.sin(this.time_elapsed * 0.001 + i) * 0.2;
        g.fillStyle(0xffffff, alpha);
        g.fillRect(sx, sy, 1, 1);
      }
    } else {
      const baseTime = this.time_elapsed * 0.001;
      for (let i = 0; i < 30; i++) {
        const sx = (i * 137.5) % w;
        const sy = (i * 73.1) % (h * 0.5);
        const alpha = 0.3 + Math.sin(baseTime + i) * 0.2;
        g.fillStyle(0xffffff, alpha);
        g.fillRect(sx, sy, 1, 1);
      }
    }
  }

  private drawCitySilhouette(g: Phaser.GameObjects.Graphics, w: number, h: number): void {
    g.fillStyle(0x161b22, 0.9);
    const buildings = [
      { x: 0.05, width: 0.06, height: 0.25 },
      { x: 0.12, width: 0.08, height: 0.35 },
      { x: 0.21, width: 0.05, height: 0.2 },
      { x: 0.27, width: 0.07, height: 0.42 },
      { x: 0.35, width: 0.09, height: 0.3 },
      { x: 0.45, width: 0.06, height: 0.38 },
      { x: 0.52, width: 0.08, height: 0.28 },
      { x: 0.61, width: 0.05, height: 0.45 },
      { x: 0.67, width: 0.07, height: 0.22 },
      { x: 0.75, width: 0.09, height: 0.33 },
      { x: 0.85, width: 0.06, height: 0.28 },
      { x: 0.92, width: 0.08, height: 0.36 },
    ];
    const groundY = h - 58;
    for (const b of buildings) {
      const bx = b.x * w;
      const bw = b.width * w;
      const bh = b.height * h;
      g.fillRect(bx, groundY - bh, bw, bh);
      // Window lights
      g.fillStyle(0xfde68a, 0.4);
      for (let wy = groundY - bh + 6; wy < groundY - 4; wy += 10) {
        for (let wx = bx + 4; wx < bx + bw - 4; wx += 8) {
          if (Math.sin(wx * 13.7 + wy * 7.3) > 0) {
            g.fillRect(wx, wy, 3, 4);
          }
        }
      }
      g.fillStyle(0x161b22, 0.9);
    }
  }

  private drawTruck(g: Phaser.GameObjects.Graphics, truck: TruckSprite, h: number): void {
    const { x, y, color, width } = truck;
    const cabW = width * 0.35;
    const bodyH = 14;
    const cabH = 18;
    const baseY = h - 16;

    // Body
    g.fillStyle(color);
    g.fillRect(x, baseY - bodyH, width - cabW, bodyH);

    // Cab
    g.fillStyle(color);
    g.fillRect(x + width - cabW, baseY - cabH, cabW, cabH);

    // Window
    g.fillStyle(0xbae6fd, 0.6);
    g.fillRect(x + width - cabW + 3, baseY - cabH + 3, cabW - 6, cabH * 0.5);

    // Wheels
    g.fillStyle(0x1e293b);
    g.fillCircle(x + width * 0.18, baseY + 2, 6);
    g.fillCircle(x + width * 0.7, baseY + 2, 6);
    g.fillStyle(0x475569);
    g.fillCircle(x + width * 0.18, baseY + 2, 3);
    g.fillCircle(x + width * 0.7, baseY + 2, 3);

    // Headlight
    g.fillStyle(0xfef3c7, 0.8);
    g.fillRect(x + width - 3, baseY - cabH + 6, 3, 4);
  }
}
