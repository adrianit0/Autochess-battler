import type { GameDataSet } from './validate-data';
import { assertValidGameData, getDefaultGameData, validateGameData } from './validate-data';

describe('game data validation', () => {
  it('accepts the default game data', () => {
    expect(validateGameData()).toEqual([]);
    expect(() => assertValidGameData()).not.toThrow();
  });

  it('rejects duplicate card ids', () => {
    const data = cloneData();
    data.cards = [...data.cards, { ...data.cards[0] }];

    expect(validateGameData(data)).toContain(`Duplicate card id: ${data.cards[0].id}.`);
  });

  it('rejects enemy references to unknown cards', () => {
    const data = cloneData();
    data.enemies[0] = {
      ...data.enemies[0],
      cards: [{ cardId: 'card_missing' }],
    };

    expect(validateGameData(data)).toContain(`Enemy ${data.enemies[0].id} references unknown card card_missing.`);
  });

  it('rejects synergies that summon missing cards', () => {
    const data = cloneData();
    data.synergies[0] = {
      ...data.synergies[0],
      effect: {
        id: 'effect_missing_summon',
        type: 'summon',
        trigger: 'onDeath',
        target: 'none',
        cardId: 'card_missing',
        description: 'Invalid summon.',
      },
    };

    expect(validateGameData(data)).toContain(`Synergy ${data.synergies[0].id} summons unknown card card_missing.`);
  });

  it('rejects invalid balance limits', () => {
    const data = cloneData();
    data.balance = {
      ...data.balance,
      shop: {
        ...data.balance.shop,
        boardLimit: 8,
      },
    };

    expect(validateGameData(data)).toContain('Board limit must be 7.');
  });

  it('throws with a readable error summary', () => {
    const data = cloneData();
    data.balance = {
      ...data.balance,
      combat: {
        ...data.balance.combat,
        maxActions: 0,
      },
    };

    expect(() => assertValidGameData(data)).toThrow('Invalid game data');
    expect(() => assertValidGameData(data)).toThrow('Combat max actions must be positive.');
  });
});

function cloneData(): GameDataSet {
  return structuredClone(getDefaultGameData());
}
