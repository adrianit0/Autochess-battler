import { createCardFactory } from '../cards/card-factory';
import { createRng } from '../rng/rng';
import {
  buyFromShopSlot,
  createShopOffer,
  prepareShopForRound,
  refreshShopOffer,
  setShopFrozen,
} from './shop';

describe('shop', () => {
  it('creates deterministic shop offers for the same seed', () => {
    const first = createShopOffer(1, createRng('shop-seed'), createCardFactory('first'));
    const second = createShopOffer(1, createRng('shop-seed'), createCardFactory('second'));

    expect(getDefinitionIds(first)).toEqual(getDefinitionIds(second));
  });

  it('only offers cards up to the current shop tier', () => {
    const shop = createShopOffer(1, createRng('tier-seed'), createCardFactory('card'));

    for (const slot of shop.slots) {
      expect(slot.card).not.toBeNull();
      expect(slot.card?.definitionId).not.toMatch(/alpha|bulwark|duelist|gravedigger|kindler|hybrid|orb|revenant/);
    }
  });

  it('refreshes the offer and unfreezes the shop', () => {
    const factory = createCardFactory('card');
    const rng = createRng('refresh-seed');
    const shop = setShopFrozen(createShopOffer(2, rng, factory), true);
    const refreshed = refreshShopOffer(shop, 2, rng, factory);

    expect(refreshed.isFrozen).toBe(false);
    expect(refreshed.slots.every((slot) => slot.isFrozen === false)).toBe(true);
    expect(getInstanceIds(refreshed)).not.toEqual(getInstanceIds(shop));
  });

  it('freezes and preserves the offer for the next round', () => {
    const factory = createCardFactory('card');
    const rng = createRng('freeze-seed');
    const shop = setShopFrozen(createShopOffer(2, rng, factory), true);
    const nextRoundShop = prepareShopForRound(shop, 2, rng, factory);

    expect(nextRoundShop.isFrozen).toBe(true);
    expect(getInstanceIds(nextRoundShop)).toEqual(getInstanceIds(shop));
  });

  it('buys a card from a slot and clears that slot', () => {
    const shop = createShopOffer(1, createRng('buy-seed'), createCardFactory('card'));
    const slotId = shop.slots[0].slotId;
    const result = buyFromShopSlot(shop, slotId);

    expect(result.card).toBe(shop.slots[0].card);
    expect(result.shop.slots[0].card).toBeNull();
    expect(shop.slots[0].card).not.toBeNull();
  });

  it('rejects buying from an empty slot', () => {
    const shop = createShopOffer(1, createRng('empty-seed'), createCardFactory('card'));
    const firstBuy = buyFromShopSlot(shop, shop.slots[0].slotId);

    expect(() => buyFromShopSlot(firstBuy.shop, shop.slots[0].slotId)).toThrow('Shop slot is empty');
  });
});

function getDefinitionIds(shop: ReturnType<typeof createShopOffer>): Array<string | undefined> {
  return shop.slots.map((slot) => slot.card?.definitionId);
}

function getInstanceIds(shop: ReturnType<typeof createShopOffer>): Array<string | undefined> {
  return shop.slots.map((slot) => slot.card?.instanceId);
}
