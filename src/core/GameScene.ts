import Phaser from 'phaser';
import { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE, COLORS, KEYS } from '../utils/constants';
import { Position, Tile, TileType } from '../utils/types';
import { Player } from '../entities/Player';
import { Enemy, EnemyType } from '../entities/Enemy';
import { FOVCalculator } from '../utils/FOV';
import { CombatSystem } from '../combat/CombatSystem';
import * as ROT from 'rot-js';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies: Enemy[] = [];
  private tiles: Tile[][] = [];
  private graphics!: Phaser.GameObjects.Graphics;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private turnInProgress = false;
  private fovCalculator!: FOVCalculator;
  private messageLog: string[] = [];
  private uiTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.graphics = this.add.graphics();

    // Create input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = {
      W: this.input.keyboard!.addKey(KEYS.UP),
      S: this.input.keyboard!.addKey(KEYS.DOWN),
      A: this.input.keyboard!.addKey(KEYS.LEFT),
      D: this.input.keyboard!.addKey(KEYS.RIGHT),
      SPACE: this.input.keyboard!.addKey(KEYS.WAIT)
    };

    // Generate initial dungeon
    this.generateDungeon();

    // Create FOV calculator
    this.fovCalculator = new FOVCalculator(MAP_WIDTH, MAP_HEIGHT);

    // Create player
    this.player = new Player(this.findStartPosition());

    // Spawn enemies
    this.spawnEnemies();

    // Initial render
    this.updateVisibility();
    this.render();
  }

  update(): void {
    if (this.turnInProgress) return;

    // Handle input
    if (Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.cursors.up!)) {
      this.tryMovePlayer(0, -1);
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.S) || Phaser.Input.Keyboard.JustDown(this.cursors.down!)) {
      this.tryMovePlayer(0, 1);
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.A) || Phaser.Input.Keyboard.JustDown(this.cursors.left!)) {
      this.tryMovePlayer(-1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.D) || Phaser.Input.Keyboard.JustDown(this.cursors.right!)) {
      this.tryMovePlayer(1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
      this.processTurn();
    }
  }

  private generateDungeon(): void {
    // Initialize tiles as walls
    this.tiles = Array(MAP_HEIGHT).fill(null).map(() =>
      Array(MAP_WIDTH).fill(null).map(() => ({
        type: TileType.Wall,
        visible: false,
        explored: false,
        blocked: true,
        blockSight: true
      }))
    );

    // Use ROT.js to generate a simple dungeon
    const digger = new ROT.Map.Digger(MAP_WIDTH, MAP_HEIGHT);
    digger.create((x, y, value) => {
      if (value === 0) { // 0 = floor, 1 = wall in ROT.js
        this.tiles[y][x] = {
          type: TileType.Floor,
          visible: false,
          explored: false,
          blocked: false,
          blockSight: false
        };
      }
    });
  }

  private findStartPosition(): Position {
    // Find first floor tile for player start
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (this.tiles[y][x].type === TileType.Floor) {
          return { x, y };
        }
      }
    }
    return { x: 1, y: 1 }; // fallback
  }

  private spawnEnemies(): void {
    const maxEnemies = 8;
    let attempts = 0;

    while (this.enemies.length < maxEnemies && attempts < 100) {
      const x = Math.floor(Math.random() * MAP_WIDTH);
      const y = Math.floor(Math.random() * MAP_HEIGHT);

      if (this.tiles[y][x].type === TileType.Floor &&
          !this.getEntityAt(x, y) &&
          (x !== this.player.position.x || y !== this.player.position.y)) {

        const enemyType = Math.random() < 0.7 ? EnemyType.Goblin : EnemyType.Orc;
        this.enemies.push(new Enemy({ x, y }, enemyType));
      }
      attempts++;
    }
  }

  private tryMovePlayer(dx: number, dy: number): void {
    const newX = this.player.position.x + dx;
    const newY = this.player.position.y + dy;

    if (!this.isValidPosition(newX, newY) || this.tiles[newY][newX].blocked) {
      return;
    }

    // Check for enemy at target position
    const enemy = this.getEnemyAt(newX, newY);
    if (enemy) {
      // Attack enemy
      const result = CombatSystem.attack(this.player, enemy);
      this.addMessage(result.message);

      if (result.killed) {
        this.removeEnemy(enemy);
      }
      this.processTurn();
    } else {
      // Move player
      this.player.moveTo({ x: newX, y: newY });
      this.processTurn();
    }
  }

  private isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT;
  }

  private processTurn(): void {
    this.turnInProgress = true;

    // Process enemy turns
    this.processEnemyTurns();

    this.updateVisibility();
    this.render();

    // Add slight delay for turn processing feel
    this.time.delayedCall(100, () => {
      this.turnInProgress = false;
    });
  }

  private processEnemyTurns(): void {
    for (const enemy of this.enemies) {
      // Check if enemy is adjacent to player
      const dx = Math.abs(enemy.position.x - this.player.position.x);
      const dy = Math.abs(enemy.position.y - this.player.position.y);

      if (dx <= 1 && dy <= 1 && (dx + dy) === 1) {
        // Adjacent - attack player
        const result = CombatSystem.attack(enemy, this.player);
        this.addMessage(result.message);

        if (result.killed) {
          this.addMessage("Game Over! Press R to restart.");
          // Could implement game over logic here
        }
      } else {
        // Try to move towards player
        const newPos = enemy.getPathToTarget(
          this.player.position,
          (x, y) => this.isValidMoveForEnemy(x, y)
        );

        if (newPos) {
          enemy.moveTo(newPos);
        }
      }
    }
  }

  private isValidMoveForEnemy(x: number, y: number): boolean {
    if (!this.isValidPosition(x, y) || this.tiles[y][x].blocked) {
      return false;
    }

    // Check if position is occupied by player or another enemy
    if (x === this.player.position.x && y === this.player.position.y) {
      return false;
    }

    return !this.getEnemyAt(x, y);
  }

  private getEntityAt(x: number, y: number): boolean {
    if (x === this.player.position.x && y === this.player.position.y) {
      return true;
    }
    return !!this.getEnemyAt(x, y);
  }

  private getEnemyAt(x: number, y: number): Enemy | null {
    return this.enemies.find(enemy =>
      enemy.position.x === x && enemy.position.y === y
    ) || null;
  }

  private removeEnemy(enemy: Enemy): void {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
    }
  }

  private addMessage(message: string): void {
    this.messageLog.push(message);
    if (this.messageLog.length > 5) {
      this.messageLog.shift();
    }
  }

  private updateVisibility(): void {
    this.fovCalculator.calculateFOV(
      this.tiles,
      this.player.position.x,
      this.player.position.y,
      8 // Vision radius
    );
  }

  private render(): void {
    this.graphics.clear();

    // Render tiles
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = this.tiles[y][x];
        let color: number = COLORS.unexplored;

        if (tile.explored) {
          color = tile.type === TileType.Floor ? COLORS.floor : COLORS.wall;
          if (!tile.visible) {
            color = COLORS.explored; // Darker for explored but not visible
          }
        }

        this.graphics.fillStyle(color);
        this.graphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }

    // Render visible enemies
    for (const enemy of this.enemies) {
      if (this.tiles[enemy.position.y][enemy.position.x].visible) {
        this.graphics.fillStyle(COLORS.enemy);
        this.graphics.fillRect(
          enemy.position.x * TILE_SIZE + 6,
          enemy.position.y * TILE_SIZE + 6,
          TILE_SIZE - 12,
          TILE_SIZE - 12
        );
      }
    }

    // Render player
    this.graphics.fillStyle(COLORS.player);
    this.graphics.fillRect(
      this.player.position.x * TILE_SIZE + 4,
      this.player.position.y * TILE_SIZE + 4,
      TILE_SIZE - 8,
      TILE_SIZE - 8
    );

    // Render UI
    this.renderUI();
  }

  private renderUI(): void {
    // Clear previous UI texts
    this.uiTexts.forEach(text => text.destroy());
    this.uiTexts = [];

    const uiY = MAP_HEIGHT * TILE_SIZE + 10;

    // Player stats
    this.uiTexts.push(this.add.text(10, uiY, `HP: ${this.player.hp}/${this.player.maxHp}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0, 0));

    this.uiTexts.push(this.add.text(150, uiY, `Level: ${this.player.level}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0, 0));

    this.uiTexts.push(this.add.text(250, uiY, `Enemies: ${this.enemies.length}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0, 0));

    // Message log
    for (let i = 0; i < this.messageLog.length; i++) {
      this.uiTexts.push(this.add.text(10, uiY + 30 + (i * 20), this.messageLog[i], {
        fontSize: '14px',
        color: '#cccccc'
      }).setOrigin(0, 0));
    }

    // Controls
    this.uiTexts.push(this.add.text(10, uiY + 160, 'Controls: WASD/Arrow Keys to move, Space to wait', {
      fontSize: '12px',
      color: '#888888'
    }).setOrigin(0, 0));
  }
}