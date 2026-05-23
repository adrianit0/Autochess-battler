import type { EnemyDefinition } from '../core/types';

export const enemyDefinitions: EnemyDefinition[] = [
  {
    id: 'enemy_r01_scrap_pack',
    name: 'Manada de chatarra',
    round: 1,
    difficulty: 'easy',
    description: 'Primer enemigo con cuerpos pequenos y sin sinergia completa.',
    cards: [
      { cardId: 'card_token_skeleton' },
      { cardId: 'card_neutral_sellsword' },
    ],
  },
  {
    id: 'enemy_r02_wild_den',
    name: 'Guarida salvaje',
    round: 2,
    difficulty: 'easy',
    description: 'Introduccion a Bestias agresivas.',
    cards: [
      { cardId: 'card_beast_rat' },
      { cardId: 'card_beast_rat' },
      { cardId: 'card_neutral_sellsword' },
    ],
  },
  {
    id: 'enemy_r03_iron_line',
    name: 'Linea de hierro',
    round: 3,
    difficulty: 'medium',
    description: 'Primer muro defensivo con Provocar.',
    cards: [
      { cardId: 'card_mech_guard' },
      { cardId: 'card_mech_guard' },
      { cardId: 'card_mech_bulwark' },
    ],
  },
  {
    id: 'enemy_r04_arcane_wake',
    name: 'Estela arcana',
    round: 4,
    difficulty: 'medium',
    description: 'Amenaza de dano magico y ataque doble.',
    cards: [
      { cardId: 'card_arcane_spark' },
      { cardId: 'card_arcane_duelist' },
      { cardId: 'card_arcane_elemental_orb' },
    ],
  },
  {
    id: 'enemy_r05_grave_surge',
    name: 'Oleada sepulcral',
    round: 5,
    difficulty: 'hard',
    description: 'No-muertos con ultimo aliento y cuerpos resistentes.',
    cards: [
      { cardId: 'card_undead_bonecaller' },
      { cardId: 'card_undead_gravedigger' },
      { cardId: 'card_undead_revenant' },
      { cardId: 'card_token_skeleton' },
    ],
  },
  {
    id: 'enemy_r06_forge_heart',
    name: 'Corazon de la forja',
    round: 6,
    difficulty: 'boss',
    description: 'Jefe MVP con mezcla de Provocar, doble clase y dano arcano.',
    cards: [
      { cardId: 'card_mech_bulwark', upgraded: true },
      { cardId: 'card_beast_mech_hybrid' },
      { cardId: 'card_arcane_elemental_orb' },
      { cardId: 'card_undead_revenant' },
      { cardId: 'card_elemental_kindler' },
    ],
    reward: {
      gold: 0,
    },
  },
];

export const enemiesByRound = new Map(enemyDefinitions.map((enemy) => [enemy.round, enemy]));
export const enemiesById = new Map(enemyDefinitions.map((enemy) => [enemy.id, enemy]));

export function getEnemyForRound(round: number): EnemyDefinition {
  const enemy = enemiesByRound.get(round);

  if (!enemy) {
    throw new Error(`No enemy configured for round ${round}`);
  }

  return enemy;
}
