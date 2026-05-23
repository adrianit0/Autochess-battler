import { cardsById } from './cards';
import { enemiesById, enemiesByRound, enemyDefinitions, getEnemyForRound } from './enemies';

describe('enemy definitions', () => {
  it('defines unique enemy ids and rounds', () => {
    expect(enemiesById.size).toBe(enemyDefinitions.length);
    expect(enemiesByRound.size).toBe(enemyDefinitions.length);
  });

  it('defines one enemy for each MVP round', () => {
    expect(enemyDefinitions.map((enemy) => enemy.round).sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('keeps enemy boards within the board limit', () => {
    for (const enemy of enemyDefinitions) {
      expect(enemy.cards.length).toBeGreaterThan(0);
      expect(enemy.cards.length).toBeLessThanOrEqual(7);
    }
  });

  it('only references existing cards', () => {
    for (const enemy of enemyDefinitions) {
      for (const card of enemy.cards) {
        expect(cardsById.has(card.cardId)).toBe(true);
      }
    }
  });

  it('gets enemies by round', () => {
    expect(getEnemyForRound(1).id).toBe('enemy_r01_scrap_pack');
    expect(() => getEnemyForRound(99)).toThrow('No enemy configured for round 99');
  });
});
