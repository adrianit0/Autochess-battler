import { getCardDefinition } from '../../data/cards';
import { createCardFactory } from '../cards/card-factory';
import type { CardInstance, PlayerState } from '../types';
import {
  addCardToHand,
  moveCardFromBoardToHand,
  moveCardFromHandToBoard,
  removeCardForSale,
  reorderBoard,
} from './player-board';

describe('player board zones', () => {
  it('adds bought cards to hand', () => {
    const card = makeCard('card_neutral_sellsword');
    const player = addCardToHand(makePlayer(), card);

    expect(player.hand).toEqual([card]);
  });

  it('moves a card from hand to board at a target index', () => {
    const first = makeCard('card_neutral_sellsword', 'card_0001');
    const second = makeCard('card_beast_rat', 'card_0002');
    const player = makePlayer({ hand: [first, second] });
    const nextPlayer = moveCardFromHandToBoard(player, second.instanceId, 0);

    expect(nextPlayer.hand).toEqual([first]);
    expect(nextPlayer.board).toEqual([second]);
    expect(player.hand).toEqual([first, second]);
  });

  it('moves a card from board back to hand', () => {
    const card = makeCard('card_mech_guard');
    const player = makePlayer({ board: [card] });
    const nextPlayer = moveCardFromBoardToHand(player, card.instanceId);

    expect(nextPlayer.hand).toEqual([card]);
    expect(nextPlayer.board).toEqual([]);
  });

  it('reorders board cards without changing the cards', () => {
    const first = makeCard('card_neutral_sellsword', 'card_0001');
    const second = makeCard('card_beast_rat', 'card_0002');
    const third = makeCard('card_mech_guard', 'card_0003');
    const player = makePlayer({ board: [first, second, third] });
    const nextPlayer = reorderBoard(player, 0, 2);

    expect(nextPlayer.board).toEqual([second, third, first]);
  });

  it('removes cards from hand or board for sale', () => {
    const handCard = makeCard('card_neutral_sellsword', 'card_0001');
    const boardCard = makeCard('card_beast_rat', 'card_0002');
    const player = makePlayer({ hand: [handCard], board: [boardCard] });
    const afterHandSale = removeCardForSale(player, handCard.instanceId);
    const afterBoardSale = removeCardForSale(afterHandSale.player, boardCard.instanceId);

    expect(afterHandSale.card).toBe(handCard);
    expect(afterHandSale.zone).toBe('hand');
    expect(afterBoardSale.card).toBe(boardCard);
    expect(afterBoardSale.zone).toBe('board');
    expect(afterBoardSale.player.hand).toEqual([]);
    expect(afterBoardSale.player.board).toEqual([]);
  });

  it('enforces hand and board limits', () => {
    const fullHand = Array.from({ length: 10 }, (_, index) =>
      makeCard('card_neutral_sellsword', `hand_${index}`),
    );
    const fullBoard = Array.from({ length: 7 }, (_, index) =>
      makeCard('card_beast_rat', `board_${index}`),
    );

    expect(() => addCardToHand(makePlayer({ hand: fullHand }), makeCard('card_mech_guard'))).toThrow(
      'Player hand is full',
    );
    expect(() =>
      moveCardFromHandToBoard(
        makePlayer({ hand: [makeCard('card_mech_guard', 'extra')], board: fullBoard }),
        'extra',
      ),
    ).toThrow('Player board is full');
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

function makeCard(cardId: string, instanceId?: string): CardInstance {
  return createCardFactory('card').create(getCardDefinition(cardId), { instanceId });
}
