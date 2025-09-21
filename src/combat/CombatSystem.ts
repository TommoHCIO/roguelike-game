import { Actor } from '../utils/types';

export interface CombatResult {
  attacker: Actor;
  defender: Actor;
  damage: number;
  hit: boolean;
  killed: boolean;
  message: string;
}

export class CombatSystem {
  static attack(attacker: Actor, defender: Actor): CombatResult {
    const baseDamage = attacker.attack;
    const defense = defender.defense;

    // Simple damage calculation: attack - defense with minimum 1
    const damage = Math.max(1, baseDamage - defense);

    // Apply damage
    defender.takeDamage(damage);
    const killed = !defender.isAlive();

    const message = killed
      ? `${attacker.name} kills ${defender.name}!`
      : `${attacker.name} attacks ${defender.name} for ${damage} damage!`;

    return {
      attacker,
      defender,
      damage,
      hit: true,
      killed,
      message
    };
  }

  static calculateExperience(defeatedEnemy: Actor): number {
    return defeatedEnemy.level * 25;
  }
}