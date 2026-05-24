import { balanceConfig, getGoldForRound, getTavernUpgradeCost } from '../../data/balance';
import type { BalanceConfig, PlayerState } from '../types';

export type EconomyAction = 'buy' | 'refresh' | 'freeze' | 'upgradeShop';

export interface EconomyResult {
  player: PlayerState;
  paid: number;
}

export function setGoldForRound(
  player: PlayerState,
  round: number,
  config: BalanceConfig = balanceConfig,
): PlayerState {
  return {
    ...player,
    gold: getGoldForRound(round, config),
    tavernUpgradeCosts: reduceTavernUpgradeCosts(player.tavernUpgradeCosts, config),
  };
}

export function discardRemainingGold(player: PlayerState): PlayerState {
  return {
    ...player,
    gold: 0,
  };
}

export function canAfford(player: PlayerState, cost: number): boolean {
  assertNonNegativeCost(cost);
  return player.gold >= cost;
}

export function payForBuyCard(
  player: PlayerState,
  config: BalanceConfig = balanceConfig,
): EconomyResult {
  return spendGold(player, config.economy.buyCost);
}

export function gainGoldFromSale(
  player: PlayerState,
  config: BalanceConfig = balanceConfig,
): EconomyResult {
  return {
    player: {
      ...player,
      gold: player.gold + config.economy.sellValue,
    },
    paid: -config.economy.sellValue,
  };
}

export function payForRefresh(
  player: PlayerState,
  config: BalanceConfig = balanceConfig,
): EconomyResult {
  return spendGold(player, config.economy.refreshCost);
}

export function payForFreeze(
  player: PlayerState,
  config: BalanceConfig = balanceConfig,
): EconomyResult {
  return spendGold(player, config.economy.freezeCost);
}

export function payForTavernUpgrade(
  player: PlayerState,
  config: BalanceConfig = balanceConfig,
): EconomyResult {
  const cost = getCurrentTavernUpgradeCost(player, config);

  if (cost === null) {
    throw new Error('Shop is already at max tier');
  }

  const result = spendGold(player, cost);

  return {
    player: {
      ...result.player,
      shopTier: (player.shopTier + 1) as PlayerState['shopTier'],
    },
    paid: result.paid,
  };
}

export function getActionCost(
  action: EconomyAction,
  player: PlayerState,
  config: BalanceConfig = balanceConfig,
): number {
  switch (action) {
    case 'buy':
      return config.economy.buyCost;
    case 'refresh':
      return config.economy.refreshCost;
    case 'freeze':
      return config.economy.freezeCost;
    case 'upgradeShop': {
      return getCurrentTavernUpgradeCost(player, config);
    }
  }
}

export function createInitialTavernUpgradeCosts(config: BalanceConfig = balanceConfig): Record<number, number> {
  return Object.fromEntries(
    Object.entries(config.economy.tavernUpgradeCosts).map(([tier, cost]) => [Number(tier), cost]),
  );
}

export function reduceTavernUpgradeCosts(
  costs: Record<number, number> = createInitialTavernUpgradeCosts(),
  config: BalanceConfig = balanceConfig,
): Record<number, number> {
  const nextCosts = createInitialTavernUpgradeCosts(config);

  for (const tier of Object.keys(nextCosts)) {
    const numericTier = Number(tier);
    nextCosts[numericTier] = Math.max(0, (costs[numericTier] ?? nextCosts[numericTier]) - 1);
  }

  return nextCosts;
}

export function getCurrentTavernUpgradeCost(
  player: PlayerState,
  config: BalanceConfig = balanceConfig,
): number {
  const baseCost = getTavernUpgradeCost(player.shopTier, config);

  if (baseCost === null) {
    throw new Error('Shop is already at max tier');
  }

  return player.tavernUpgradeCosts?.[player.shopTier] ?? baseCost;
}

function spendGold(player: PlayerState, cost: number): EconomyResult {
  assertNonNegativeCost(cost);

  if (!canAfford(player, cost)) {
    throw new Error(`Not enough gold: needs ${cost}, has ${player.gold}`);
  }

  return {
    player: {
      ...player,
      gold: player.gold - cost,
    },
    paid: cost,
  };
}

function assertNonNegativeCost(cost: number): void {
  if (!Number.isInteger(cost) || cost < 0) {
    throw new Error(`Cost must be a non-negative integer, received ${cost}`);
  }
}
