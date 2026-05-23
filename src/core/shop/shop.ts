import { balanceConfig } from '../../data/balance';
import { getCardsForShopTier } from '../../data/cards';
import type { CardFactory } from '../cards/card-factory';
import type { BalanceConfig, CardInstance, PlayerState, ShopSlot, ShopState } from '../types';
import type { RngService } from '../rng/rng';

export interface BuyFromShopResult {
  shop: ShopState;
  card: CardInstance;
}

export function createShopOffer(
  shopTier: PlayerState['shopTier'],
  rng: RngService,
  cardFactory: CardFactory,
  config: BalanceConfig = balanceConfig,
): ShopState {
  return {
    slots: createSlots(shopTier, rng, cardFactory, config),
    isFrozen: false,
  };
}

export function refreshShopOffer(
  shop: ShopState,
  shopTier: PlayerState['shopTier'],
  rng: RngService,
  cardFactory: CardFactory,
  config: BalanceConfig = balanceConfig,
): ShopState {
  return {
    ...shop,
    slots: createSlots(shopTier, rng, cardFactory, config),
    isFrozen: false,
  };
}

export function setShopFrozen(shop: ShopState, isFrozen: boolean): ShopState {
  return {
    ...shop,
    isFrozen,
    slots: shop.slots.map((slot) => ({
      ...slot,
      isFrozen,
    })),
  };
}

export function prepareShopForRound(
  previousShop: ShopState | null,
  shopTier: PlayerState['shopTier'],
  rng: RngService,
  cardFactory: CardFactory,
  config: BalanceConfig = balanceConfig,
): ShopState {
  if (previousShop?.isFrozen === true) {
    return {
      ...previousShop,
      slots: previousShop.slots.map((slot) => ({ ...slot })),
    };
  }

  return createShopOffer(shopTier, rng, cardFactory, config);
}

export function buyFromShopSlot(shop: ShopState, slotId: string): BuyFromShopResult {
  const slotIndex = shop.slots.findIndex((slot) => slot.slotId === slotId);

  if (slotIndex < 0) {
    throw new Error(`Unknown shop slot: ${slotId}`);
  }

  const slot = shop.slots[slotIndex];

  if (!slot.card) {
    throw new Error(`Shop slot is empty: ${slotId}`);
  }

  const nextSlots = shop.slots.map((currentSlot, index) =>
    index === slotIndex ? { ...currentSlot, card: null } : { ...currentSlot },
  );

  return {
    shop: {
      ...shop,
      slots: nextSlots,
    },
    card: slot.card,
  };
}

function createSlots(
  shopTier: PlayerState['shopTier'],
  rng: RngService,
  cardFactory: CardFactory,
  config: BalanceConfig,
): ShopSlot[] {
  const availableCards = getCardsForShopTier(shopTier);

  if (availableCards.length === 0) {
    throw new Error(`No cards available for shop tier ${shopTier}`);
  }

  return Array.from({ length: config.shop.slotCount }, (_, index) => {
    const definition = rng.pickOne(availableCards);
    return {
      slotId: `shop_slot_${index + 1}`,
      card: cardFactory.create(definition),
      isFrozen: false,
    };
  });
}
