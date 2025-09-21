import { Position, Actor } from '../utils/types';

export class Enemy implements Actor {
  public readonly id: string;
  public position: Position;
  public readonly sprite = 'o';
  public readonly name: string;
  public readonly blocks = true;
  public hp: number;
  public maxHp: number;
  public attack: number;
  public defense: number;
  public level: number;

  constructor(position: Position, type: EnemyType = EnemyType.Goblin) {
    this.id = `enemy_${Math.random().toString(36).substr(2, 9)}`;
    this.position = { ...position };

    switch (type) {
      case EnemyType.Goblin:
        this.name = 'Goblin';
        this.hp = 10;
        this.maxHp = 10;
        this.attack = 3;
        this.defense = 0;
        this.level = 1;
        break;
      case EnemyType.Orc:
        this.name = 'Orc';
        this.hp = 16;
        this.maxHp = 16;
        this.attack = 4;
        this.defense = 1;
        this.level = 2;
        break;
    }
  }

  moveTo(newPosition: Position): void {
    this.position = { ...newPosition };
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  isAlive(): boolean {
    return this.hp > 0;
  }

  getPathToTarget(target: Position, isValidMove: (x: number, y: number) => boolean): Position | null {
    // Simple AI: move towards player if adjacent, otherwise random
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    const distance = Math.abs(dx) + Math.abs(dy);

    if (distance === 1) {
      // Adjacent to player - attack (no movement)
      return null;
    }

    // Try to move towards player
    const moveX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
    const moveY = dy > 0 ? 1 : dy < 0 ? -1 : 0;

    const newX = this.position.x + moveX;
    const newY = this.position.y + moveY;

    if (isValidMove(newX, newY)) {
      return { x: newX, y: newY };
    }

    // If direct path blocked, try alternatives
    const alternatives = [
      { x: this.position.x + moveX, y: this.position.y },
      { x: this.position.x, y: this.position.y + moveY },
      { x: this.position.x - 1, y: this.position.y },
      { x: this.position.x + 1, y: this.position.y },
      { x: this.position.x, y: this.position.y - 1 },
      { x: this.position.x, y: this.position.y + 1 }
    ];

    for (const alt of alternatives) {
      if (isValidMove(alt.x, alt.y)) {
        return alt;
      }
    }

    return null; // Can't move
  }
}

export enum EnemyType {
  Goblin = 'goblin',
  Orc = 'orc'
}