import { getCardDefinition } from '../../data/cards';
import {
  buyCard,
  continueAfterCombat,
  createNewGame,
  freezeShop,
  placeCardOnBoard,
  refreshShop,
  resolveCurrentCombat,
  sellCard,
  upgradeShop,
} from './game-state';

describe('game state', () => {
  it('creates a deterministic initial game state', () => {
    const first = createNewGame('state-seed');
    const second = createNewGame('state-seed');

    expect(first.state.phase).toBe('ShopPhase');
    expect(first.state.round).toBe(1);
    expect(first.state.player.gold).toBe(3);
    expect(first.state.shop.slots.map((slot) => slot.card?.definitionId)).toEqual(
      second.state.shop.slots.map((slot) => slot.card?.definitionId),
    );
  });

  it('runs shop actions through the state API', () => {
    let session = createNewGame('shop-actions');
    const slotId = session.state.shop.slots[0].slotId;

    session = buyCard(session, slotId);
    expect(session.state.player.gold).toBe(0);
    expect(session.state.player.hand).toHaveLength(1);
    expect(session.state.shop.slots[0].card).toBeNull();

    const cardId = session.state.player.hand[0].instanceId;
    session = placeCardOnBoard(session, cardId);
    expect(session.state.player.hand).toHaveLength(0);
    expect(session.state.player.board).toHaveLength(1);

    session = sellCard(session, session.state.player.board[0].instanceId);
    expect(session.state.player.gold).toBe(1);
    expect(session.state.player.board).toHaveLength(0);
  });

  it('supports refresh, freeze and upgrade actions', () => {
    let session = createNewGame('refresh-freeze-upgrade');
    const initialIds = session.state.shop.slots.map((slot) => slot.card?.instanceId);

    session = refreshShop(session);
    expect(session.state.player.gold).toBe(2);
    expect(session.state.shop.slots.map((slot) => slot.card?.instanceId)).not.toEqual(initialIds);

    session = freezeShop(session, true);
    expect(session.state.shop.isFrozen).toBe(true);

    session = {
      ...session,
      state: {
        ...session.state,
        player: {
          ...session.state.player,
          gold: 5,
        },
      },
    };
    session = upgradeShop(session);
    expect(session.state.player.shopTier).toBe(2);
    expect(session.state.player.gold).toBe(0);
  });

  it('resolves a loss and advances to the next round from reward phase', () => {
    let session = createNewGame('combat-loss-state');

    session = resolveCurrentCombat(session);
    expect(session.state.phase).toBe('RewardPhase');
    expect(session.state.lastCombat?.outcome).toBe('loss');
    expect(session.state.player.health).toBe(17);
    expect(session.state.player.gold).toBe(0);

    session = continueAfterCombat(session);
    expect(session.state.phase).toBe('ShopPhase');
    expect(session.state.round).toBe(2);
    expect(session.state.player.gold).toBe(4);
    expect(session.state.lastCombat).toBeUndefined();
  });

  it('reaches victory after winning the final round', () => {
    const session = createNewGame('final-win-state');
    const strongBoard = Array.from({ length: 7 }, (_, index) =>
      session.cardFactory.create(getCardDefinition('card_undead_revenant'), {
        instanceId: `strong_${index}`,
        upgraded: true,
      }),
    );
    const finalSession = resolveCurrentCombat({
      ...session,
      state: {
        ...session.state,
        round: 6,
        player: {
          ...session.state.player,
          board: strongBoard,
        },
      },
    });

    expect(finalSession.state.phase).toBe('Victory');
    expect(finalSession.state.lastCombat?.outcome).toBe('win');
  });

  it('rejects invalid transitions', () => {
    const session = createNewGame('invalid-transition');
    const resolved = resolveCurrentCombat(session);

    expect(() => buyCard(resolved, 'shop_slot_1')).toThrow('Expected phase ShopPhase');
    expect(() => continueAfterCombat(session)).toThrow('Cannot continue from phase ShopPhase');
  });
});
