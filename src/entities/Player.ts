import { Position, Actor } from '../utils/types';

export class Player implements Actor {
  public readonly id = 'player';
  public position: Position;
  public readonly sprite = '@';
  public readonly name = 'Player';
  public readonly blocks = true;
  public hp: number;
  public maxHp: number;
  public attack: number;
  public defense: number;
  public level: number;

  constructor(startPosition: Position) {
    this.position = { ...startPosition };
    this.hp = 30;
    this.maxHp = 30;
    this.attack = 5;
    this.defense = 2;
    this.level = 1;
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
}