import { balanceConfig } from '../../data/balance';
import type { BalanceConfig, CardInstance, PlayerState } from '../types';

export type PlayerZone = 'hand' | 'board';

export interface RemovedCardResult {
  player: PlayerState;
  card: CardInstance;
  zone: PlayerZone;
}

export function addCardToHand(
  player: PlayerState,
  card: CardInstance,
  config: BalanceConfig = balanceConfig,
): PlayerState {
  if (player.hand.length >= config.shop.handLimit) {
    throw new Error('Player hand is full');
  }

  return {
    ...player,
    hand: [...player.hand, card],
  };
}

export function moveCardFromHandToBoard(
  player: PlayerState,
  instanceId: string,
  boardIndex = player.board.length,
  config: BalanceConfig = balanceConfig,
): PlayerState {
  if (player.board.length >= config.shop.boardLimit) {
    throw new Error('Player board is full');
  }

  const handIndex = findCardIndex(player.hand, instanceId, 'hand');
  const nextHand = player.hand.filter((card) => card.instanceId !== instanceId);
  const nextBoard = insertAt(player.board, player.hand[handIndex], boardIndex, 'board');

  return {
    ...player,
    hand: nextHand,
    board: nextBoard,
  };
}

export function moveCardFromBoardToHand(
  player: PlayerState,
  instanceId: string,
  handIndex = player.hand.length,
  config: BalanceConfig = balanceConfig,
): PlayerState {
  if (player.hand.length >= config.shop.handLimit) {
    throw new Error('Player hand is full');
  }

  const boardIndex = findCardIndex(player.board, instanceId, 'board');
  const nextBoard = player.board.filter((card) => card.instanceId !== instanceId);
  const nextHand = insertAt(player.hand, player.board[boardIndex], handIndex, 'hand');

  return {
    ...player,
    hand: nextHand,
    board: nextBoard,
  };
}

export function reorderBoard(player: PlayerState, fromIndex: number, toIndex: number): PlayerState {
  assertIndex(player.board, fromIndex, 'board');
  assertInsertionIndex(player.board, toIndex, 'board');

  const nextBoard = [...player.board];
  const [card] = nextBoard.splice(fromIndex, 1);
  nextBoard.splice(toIndex, 0, card);

  return {
    ...player,
    board: nextBoard,
  };
}

export function removeCardForSale(player: PlayerState, instanceId: string): RemovedCardResult {
  const handIndex = player.hand.findIndex((card) => card.instanceId === instanceId);

  if (handIndex >= 0) {
    const card = player.hand[handIndex];
    return {
      player: {
        ...player,
        hand: player.hand.filter((item) => item.instanceId !== instanceId),
      },
      card,
      zone: 'hand',
    };
  }

  const boardIndex = player.board.findIndex((card) => card.instanceId === instanceId);

  if (boardIndex >= 0) {
    const card = player.board[boardIndex];
    return {
      player: {
        ...player,
        board: player.board.filter((item) => item.instanceId !== instanceId),
      },
      card,
      zone: 'board',
    };
  }

  throw new Error(`Card is not controlled by player: ${instanceId}`);
}

function findCardIndex(cards: readonly CardInstance[], instanceId: string, zone: PlayerZone): number {
  const index = cards.findIndex((card) => card.instanceId === instanceId);

  if (index < 0) {
    throw new Error(`Card not found in ${zone}: ${instanceId}`);
  }

  return index;
}

function insertAt(
  cards: readonly CardInstance[],
  card: CardInstance,
  index: number,
  zone: PlayerZone,
): CardInstance[] {
  assertInsertionIndex(cards, index, zone);
  const nextCards = [...cards];
  nextCards.splice(index, 0, card);
  return nextCards;
}

function assertIndex(cards: readonly CardInstance[], index: number, zone: PlayerZone): void {
  if (!Number.isInteger(index) || index < 0 || index >= cards.length) {
    throw new Error(`Invalid ${zone} index: ${index}`);
  }
}

function assertInsertionIndex(cards: readonly CardInstance[], index: number, zone: PlayerZone): void {
  if (!Number.isInteger(index) || index < 0 || index > cards.length) {
    throw new Error(`Invalid ${zone} insertion index: ${index}`);
  }
}
