import { MRPAS } from 'mrpas';
import { Tile } from './types';

export class FOVCalculator {
  private mrpas: MRPAS;

  constructor(width: number, height: number) {
    this.mrpas = new MRPAS(width, height, (x: number, y: number) => {
      // This function should return true if the tile blocks sight
      return false; // Will be set by the calling code
    });
  }

  calculateFOV(
    tiles: Tile[][],
    playerX: number,
    playerY: number,
    radius: number
  ): void {
    const mapHeight = tiles.length;
    const mapWidth = tiles[0].length;

    // Reset visibility
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        tiles[y][x].visible = false;
      }
    }

    // Set up the transparency function
    this.mrpas.isTransparent = (x: number, y: number): boolean => {
      if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) {
        return false;
      }
      return !tiles[y][x].blockSight;
    };

    // Calculate field of view
    this.mrpas.compute(
      playerX,
      playerY,
      radius,
      (x: number, y: number): void => {
        if (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
          tiles[y][x].visible = true;
          tiles[y][x].explored = true;
        }
      }
    );
  }
}