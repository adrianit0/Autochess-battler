import type { BalanceConfig } from '../core/types';

export const balanceConfig: BalanceConfig = {
  economy: {
    buyCost: 3,
    sellValue: 1,
    refreshCost: 1,
    freezeCost: 0,
    goldByRound: {
      1: 3,
      2: 4,
      3: 5,
      4: 6,
      5: 7,
      6: 8,
      7: 9,
    },
    maxRoundGold: 10,
    tavernUpgradeCosts: {
      1: 5,
      2: 7,
      3: 8,
      4: 9,
      5: 10,
    },
  },
  shop: {
    slotCount: 3,
    handLimit: 10,
    boardLimit: 7,
    maxTier: 6,
  },
  combat: {
    maxActions: 200,
    playerStarts: true,
  },
  progression: {
    playerStartingHealth: 20,
    finalRound: 6,
    lossDamageByRoundBand: [
      { fromRound: 1, toRound: 2, damage: 3 },
      { fromRound: 3, toRound: 4, damage: 5 },
      { fromRound: 5, damage: 7 },
    ],
  },
};

export function getGoldForRound(round: number, config: BalanceConfig = balanceConfig): number {
  assertPositiveRound(round);
  return config.economy.goldByRound[round] ?? config.economy.maxRoundGold;
}

export function getTavernUpgradeCost(
  currentTier: number,
  config: BalanceConfig = balanceConfig,
): number | null {
  if (!Number.isInteger(currentTier) || currentTier < 1 || currentTier >= config.shop.maxTier) {
    return null;
  }

  return config.economy.tavernUpgradeCosts[currentTier] ?? null;
}

export function getLossDamageForRound(round: number, config: BalanceConfig = balanceConfig): number {
  assertPositiveRound(round);

  const band = config.progression.lossDamageByRoundBand.find((entry) => {
    const isAfterStart = round >= entry.fromRound;
    const isBeforeEnd = entry.toRound === undefined || round <= entry.toRound;
    return isAfterStart && isBeforeEnd;
  });

  if (!band) {
    throw new Error(`Missing loss damage band for round ${round}`);
  }

  return band.damage;
}

function assertPositiveRound(round: number): void {
  if (!Number.isInteger(round) || round < 1) {
    throw new Error(`Round must be a positive integer, received ${round}`);
  }
}
