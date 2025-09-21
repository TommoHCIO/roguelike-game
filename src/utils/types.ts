export interface Position {
  x: number;
  y: number;
}

export interface Tile {
  type: TileType;
  visible: boolean;
  explored: boolean;
  blocked: boolean;
  blockSight: boolean;
}

export enum TileType {
  Floor = 'floor',
  Wall = 'wall',
  Door = 'door'
}

export interface GameEntity {
  id: string;
  position: Position;
  sprite: string;
  name: string;
  blocks: boolean;
}

export interface Actor extends GameEntity {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  level: number;
  takeDamage(amount: number): void;
  heal(amount: number): void;
  isAlive(): boolean;
  moveTo(newPosition: Position): void;
}

export interface Item extends GameEntity {
  stackable: boolean;
  usable: boolean;
  equipable: boolean;
}