import { getCardDefinition } from '../../data/cards';
import { createCardFactory } from './card-factory';
import { applyAutomaticFusions } from './fusion';
import type { CardInstance, PlayerState } from '../types';

describe('fusion', () => {
  it('fuses three copies in hand into an upgraded card', () => {
    const factory = createCardFactory('card');
    const copies = makeCopies(factory, 'card_beast_rat', 3);
    const player = makePlayer({ hand: copies });
    const result = applyAutomaticFusions(player, getCardDefinition, factory);

    expect(result.fusions).toHaveLength(1);
    expect(result.player.hand).toHaveLength(1);
    expect(result.player.board).toHaveLength(0);
    expect(result.player.hand[0].definitionId).toBe('card_beast_rat');
    expect(result.player.hand[0].isUpgraded).toBe(true);
    expect(result.player.hand[0].attack).toBe(getCardDefinition('card_beast_rat').attack * 2);
    expect(result.fusions[0].targetZone).toBe('hand');
  });

  it('fuses three copies on board and replaces the first consumed board slot', () => {
    const factory = createCardFactory('card');
    const copies = makeCopies(factory, 'card_mech_guard', 3);
    const player = makePlayer({ board: copies });
    const result = applyAutomaticFusions(player, getCardDefinition, factory);

    expect(result.player.hand).toHaveLength(0);
    expect(result.player.board).toHaveLength(1);
    expect(result.player.board[0].definitionId).toBe('card_mech_guard');
    expect(result.player.board[0].isUpgraded).toBe(true);
    expect(result.fusions[0].targetZone).toBe('board');
  });

  it('fuses mixed hand and board copies into the first detected zone', () => {
    const factory = createCardFactory('card');
    const copies = makeCopies(factory, 'card_neutral_sellsword', 3);
    const player = makePlayer({ hand: [copies[0]], board: [copies[1], copies[2]] });
    const result = applyAutomaticFusions(player, getCardDefinition, factory);

    expect(result.player.hand).toHaveLength(1);
    expect(result.player.board).toHaveLength(0);
    expect(result.player.hand[0].isUpgraded).toBe(true);
    expect(result.fusions[0].targetZone).toBe('hand');
  });

  it('does not fuse two copies', () => {
    const factory = createCardFactory('card');
    const copies = makeCopies(factory, 'card_elemental_pebble', 2);
    const player = makePlayer({ hand: copies });
    const result = applyAutomaticFusions(player, getCardDefinition, factory);

    expect(result.fusions).toEqual([]);
    expect(result.player.hand).toEqual(copies);
  });

  it('can resolve multiple fusions in one pass', () => {
    const factory = createCardFactory('card');
    const beastCopies = makeCopies(factory, 'card_beast_rat', 3);
    const mechCopies = makeCopies(factory, 'card_mech_guard', 3);
    const result = applyAutomaticFusions(
      makePlayer({ hand: [...beastCopies, ...mechCopies] }),
      getCardDefinition,
      factory,
    );

    expect(result.fusions).toHaveLength(2);
    expect(result.player.hand).toHaveLength(2);
    expect(result.player.hand.every((card) => card.isUpgraded)).toBe(true);
  });
});

function makePlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    health: 20,
    gold: 0,
    shopTier: 1,
    hand: [],
    board: [],
    ...overrides,
  };
}

function makeCopies(factory: ReturnType<typeof createCardFactory>, cardId: string, count: number): CardInstance[] {
  return Array.from({ length: count }, () => factory.create(getCardDefinition(cardId)));
}
