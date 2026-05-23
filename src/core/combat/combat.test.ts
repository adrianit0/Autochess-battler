import { getCardDefinition } from '../../data/cards';
import { createCardFactory } from '../cards/card-factory';
import { createRng } from '../rng/rng';
import type { CardInstance } from '../types';
import { simulateCombat } from './combat';

describe('combat', () => {
  it('resolves a player victory', () => {
    const result = simulateCombat({
      playerBoard: [makeCard('card_neutral_sellsword', 'player')],
      enemyBoard: [makeCard('card_token_skeleton', 'enemy')],
      rng: createRng('combat-win'),
      resolveDefinition: getCardDefinition,
    });

    expect(result.outcome).toBe('win');
    expect(result.remainingPlayerCards).toHaveLength(1);
    expect(result.remainingEnemyCards).toHaveLength(0);
  });

  it('resolves a player defeat', () => {
    const result = simulateCombat({
      playerBoard: [makeCard('card_token_skeleton', 'player')],
      enemyBoard: [makeCard('card_neutral_sellsword', 'enemy')],
      rng: createRng('combat-loss'),
      resolveDefinition: getCardDefinition,
    });

    expect(result.outcome).toBe('loss');
    expect(result.remainingPlayerCards).toHaveLength(0);
    expect(result.remainingEnemyCards).toHaveLength(1);
  });

  it('resolves simultaneous lethal damage as a draw', () => {
    const result = simulateCombat({
      playerBoard: [makeCard('card_token_skeleton', 'player')],
      enemyBoard: [makeCard('card_token_skeleton', 'enemy')],
      rng: createRng('combat-draw'),
      resolveDefinition: getCardDefinition,
    });

    expect(result.outcome).toBe('draw');
    expect(result.remainingPlayerCards).toHaveLength(0);
    expect(result.remainingEnemyCards).toHaveLength(0);
  });

  it('prioritizes taunt targets', () => {
    const taunt = makeCard('card_mech_guard', 'taunt');
    const other = makeCard('card_token_skeleton', 'other');
    const result = simulateCombat({
      playerBoard: [makeCard('card_neutral_sellsword', 'player')],
      enemyBoard: [other, taunt],
      rng: createRng('combat-taunt'),
      resolveDefinition: getCardDefinition,
    });
    const firstAttack = result.events.find((event) => event.type === 'attack');

    expect(firstAttack).toMatchObject({
      type: 'attack',
      targetId: taunt.instanceId,
    });
  });

  it('lets double attack cards attack twice if they survive', () => {
    const result = simulateCombat({
      playerBoard: [makeCard('card_arcane_duelist', 'duelist')],
      enemyBoard: [makeCard('card_token_skeleton', 'enemy_1'), makeCard('card_token_skeleton', 'enemy_2')],
      rng: createRng('combat-double-attack'),
      resolveDefinition: getCardDefinition,
    });
    const attackEvents = result.events.filter((event) => event.type === 'attack');

    expect(result.outcome).toBe('win');
    expect(attackEvents).toHaveLength(2);
  });

  it('uses max actions as a technical draw guard', () => {
    const result = simulateCombat({
      playerBoard: [makeCard('card_elemental_pebble', 'player')],
      enemyBoard: [makeCard('card_elemental_pebble', 'enemy')],
      rng: createRng('combat-max-actions'),
      resolveDefinition: getCardDefinition,
      config: {
        economy: {
          buyCost: 3,
          sellValue: 1,
          refreshCost: 1,
          freezeCost: 0,
          goldByRound: { 1: 3 },
          maxRoundGold: 10,
          tavernUpgradeCosts: { 1: 5 },
        },
        shop: {
          slotCount: 3,
          handLimit: 10,
          boardLimit: 7,
          maxTier: 6,
        },
        combat: {
          maxActions: 0,
          playerStarts: true,
        },
        progression: {
          playerStartingHealth: 20,
          finalRound: 6,
          lossDamageByRoundBand: [{ fromRound: 1, damage: 3 }],
        },
      },
    });

    expect(result.outcome).toBe('draw');
  });
});

function makeCard(cardId: string, instanceId: string): CardInstance {
  return createCardFactory('combat').create(getCardDefinition(cardId), { instanceId });
}
