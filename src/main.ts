import Phaser from 'phaser';
import { GameScene } from './core/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  parent: 'app',
  backgroundColor: '#2c3e50',
  scene: [GameScene],
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }
    }
  }
};

new Phaser.Game(config);
