export const TILE_SIZE = 32;
export const MAP_WIDTH = 25;
export const MAP_HEIGHT = 19;

export const COLORS = {
  floor: 0x3a3a3a,
  wall: 0x1a1a1a,
  player: 0x00ff00,
  enemy: 0xff0000,
  item: 0xffff00,
  ui: 0x444444,
  text: 0xffffff,
  unexplored: 0x000000,
  explored: 0x222222
} as const;

export const KEYS = {
  UP: 'KeyW',
  DOWN: 'KeyS',
  LEFT: 'KeyA',
  RIGHT: 'KeyD',
  WAIT: 'Space',
  INVENTORY: 'KeyI',
  PICKUP: 'KeyG'
} as const;