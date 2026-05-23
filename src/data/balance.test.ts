import { balanceConfig, getGoldForRound, getLossDamageForRound, getTavernUpgradeCost } from './balance';

describe('balance config', () => {
  it('matches the MVP economy constants', () => {
    expect(balanceConfig.economy.buyCost).toBe(3);
    expect(balanceConfig.economy.sellValue).toBe(1);
    expect(balanceConfig.economy.refreshCost).toBe(1);
    expect(balanceConfig.economy.freezeCost).toBe(0);
  });

  it('returns configured gold by round and caps later rounds', () => {
    expect(getGoldForRound(1)).toBe(3);
    expect(getGoldForRound(7)).toBe(9);
    expect(getGoldForRound(8)).toBe(10);
    expect(getGoldForRound(20)).toBe(10);
  });

  it('returns tavern upgrade costs until max tier', () => {
    expect(getTavernUpgradeCost(1)).toBe(5);
    expect(getTavernUpgradeCost(5)).toBe(10);
    expect(getTavernUpgradeCost(6)).toBeNull();
  });

  it('returns loss damage by round band', () => {
    expect(getLossDamageForRound(1)).toBe(3);
    expect(getLossDamageForRound(3)).toBe(5);
    expect(getLossDamageForRound(6)).toBe(7);
  });

  it('rejects invalid rounds', () => {
    expect(() => getGoldForRound(0)).toThrow('Round must be a positive integer');
    expect(() => getLossDamageForRound(1.5)).toThrow('Round must be a positive integer');
  });
});
