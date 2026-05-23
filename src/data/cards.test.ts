import { cardDefinitions, cardsById, getCardsForShopTier } from './cards';

describe('card definitions', () => {
  it('uses unique card ids', () => {
    expect(cardsById.size).toBe(cardDefinitions.length);
  });

  it('defines valid card stats and tiers', () => {
    for (const card of cardDefinitions) {
      expect(card.id).toMatch(/^card_[a-z0-9_]+$/);
      expect(card.tier).toBeGreaterThanOrEqual(1);
      expect(card.tier).toBeLessThanOrEqual(6);
      expect(card.attack).toBeGreaterThan(0);
      expect(card.health).toBeGreaterThan(0);
      expect(card.classes.length).toBeLessThanOrEqual(2);
      expect(card.name.length).toBeGreaterThan(0);
      expect(card.playerText.length).toBeGreaterThan(0);
      expect(card.artKey.length).toBeGreaterThan(0);
    }
  });

  it('has at least one non-token MVP card for each class', () => {
    const playableCards = cardDefinitions.filter((card) => !card.id.startsWith('card_token_'));

    expect(playableCards.some((card) => card.classes.includes('beast'))).toBe(true);
    expect(playableCards.some((card) => card.classes.includes('mech'))).toBe(true);
    expect(playableCards.some((card) => card.classes.includes('arcane'))).toBe(true);
    expect(playableCards.some((card) => card.classes.includes('undead'))).toBe(true);
    expect(playableCards.some((card) => card.classes.includes('elemental'))).toBe(true);
    expect(playableCards.some((card) => card.classes.length === 0)).toBe(true);
  });

  it('filters shop cards by tier and excludes tokens', () => {
    const tierOneCards = getCardsForShopTier(1);
    const tierThreeCards = getCardsForShopTier(3);

    expect(tierOneCards.every((card) => card.tier <= 1)).toBe(true);
    expect(tierThreeCards.every((card) => card.tier <= 3)).toBe(true);
    expect(tierThreeCards.length).toBeGreaterThan(tierOneCards.length);
    expect(tierThreeCards.some((card) => card.id === 'card_token_skeleton')).toBe(false);
  });
});
