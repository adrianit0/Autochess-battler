import type { PlayerState } from '../types';
import {
  canAfford,
  createInitialTavernUpgradeCosts,
  discardRemainingGold,
  gainGoldFromSale,
  getActionCost,
  getCurrentTavernUpgradeCost,
  payForBuyCard,
  payForRefresh,
  payForTavernUpgrade,
  reduceTavernUpgradeCosts,
  setGoldForRound,
} from './economy';

describe('economy', () => {
  it('sets round gold from balance and discards leftovers', () => {
    const player = makePlayer({ gold: 99 });

    expect(setGoldForRound(player, 1).gold).toBe(3);
    expect(setGoldForRound(player, 8).gold).toBe(10);
    expect(discardRemainingGold(player).gold).toBe(0);
  });

  it('pays buy and refresh costs without mutating the source player', () => {
    const player = makePlayer({ gold: 5 });
    const afterBuy = payForBuyCard(player);
    const afterRefresh = payForRefresh(afterBuy.player);

    expect(afterBuy.player.gold).toBe(2);
    expect(afterBuy.paid).toBe(3);
    expect(afterRefresh.player.gold).toBe(1);
    expect(player.gold).toBe(5);
  });

  it('rejects actions that would make gold negative', () => {
    const player = makePlayer({ gold: 2 });

    expect(canAfford(player, 3)).toBe(false);
    expect(() => payForBuyCard(player)).toThrow('Not enough gold');
  });

  it('adds gold from selling a card', () => {
    const player = makePlayer({ gold: 0 });
    const result = gainGoldFromSale(player);

    expect(result.player.gold).toBe(1);
    expect(result.paid).toBe(-1);
  });

  it('pays tavern upgrade costs and increases shop tier', () => {
    const player = makePlayer({ gold: 8, shopTier: 2 });
    const result = payForTavernUpgrade(player);

    expect(result.paid).toBe(7);
    expect(result.player.gold).toBe(1);
    expect(result.player.shopTier).toBe(3);
  });

  it('rejects tavern upgrades at max tier', () => {
    const player = makePlayer({ gold: 20, shopTier: 6 });

    expect(() => getActionCost('upgradeShop', player)).toThrow('Shop is already at max tier');
    expect(() => payForTavernUpgrade(player)).toThrow('Shop is already at max tier');
  });

  it('reduces tavern upgrade costs by one each shop turn down to zero', () => {
    const initialCosts = createInitialTavernUpgradeCosts();
    const reducedOnce = reduceTavernUpgradeCosts(initialCosts);
    const reducedMany = Array.from({ length: 12 }).reduce<Record<number, number>>(
      (costs) => reduceTavernUpgradeCosts(costs),
      initialCosts,
    );

    expect(reducedOnce[1]).toBe(4);
    expect(reducedOnce[2]).toBe(6);
    expect(reducedMany[1]).toBe(0);
    expect(reducedMany[5]).toBe(0);
  });

  it('uses the reduced tavern upgrade cost when paying', () => {
    const player = makePlayer({
      gold: 5,
      shopTier: 1,
      tavernUpgradeCosts: reduceTavernUpgradeCosts(createInitialTavernUpgradeCosts()),
    });
    const result = payForTavernUpgrade(player);

    expect(getCurrentTavernUpgradeCost(player)).toBe(4);
    expect(result.paid).toBe(4);
    expect(result.player.gold).toBe(1);
    expect(result.player.shopTier).toBe(2);
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
