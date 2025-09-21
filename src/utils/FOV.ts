import { Mrpas } from 'mrpas';
import { Tile } from './types';

export class FOVCalculator {
  private mrpas: Mrpas;

  constructor(width: number, height: number) {
    this.mrpas = new Mrpas(width, height, (x: number, y: number) => {
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

    // Calculate field of view using the correct MRPAS API
    this.mrpas.compute(
      playerX,
      playerY,
      radius,
      (x: number, y: number): boolean => {
        // Transparency function - return true if transparent
        if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) {
          return false;
        }
        return !tiles[y][x].blockSight;
      },
      (x: number, y: number): void => {
        // Visibility callback - mark tiles as visible
        if (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
          tiles[y][x].visible = true;
          tiles[y][x].explored = true;
        }
      }
    );
  }
}