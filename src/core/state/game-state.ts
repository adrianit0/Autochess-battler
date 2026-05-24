import { balanceConfig, getLossDamageForRound } from '../../data/balance';
import { getCardDefinition } from '../../data/cards';
import { getEnemyForRound } from '../../data/enemies';
import { createCardFactory, type CardFactory } from '../cards/card-factory';
import { applyAutomaticFusions } from '../cards/fusion';
import { simulateCombat } from '../combat/combat';
import { executeEffect } from '../effects/effect-engine';
import {
  discardRemainingGold,
  gainGoldFromSale,
  payForBuyCard,
  payForRefresh,
  payForTavernUpgrade,
  setGoldForRound,
} from '../economy/economy';
import {
  addCardToHand,
  moveCardFromBoardToHand,
  moveCardFromHandToBoard,
  removeCardForSale,
  reorderBoard,
} from '../player/player-board';
import { createRng, type RngService } from '../rng/rng';
import {
  buyFromShopSlot,
  createShopOffer,
  refreshShopOffer,
  setShopFrozen,
} from '../shop/shop';
import { applySynergies } from '../synergies/synergy-engine';
import type { CardInstance, CombatEvent, CombatOutcome, EffectTrigger, GameState, PlayerState } from '../types';

export interface GameSession {
  state: GameState;
  rng: RngService;
  cardFactory: CardFactory;
}

export function createNewGame(seed: string): GameSession {
  const rng = createRng(seed);
  const cardFactory = createCardFactory('game');
  const player = setGoldForRound(
    {
      health: balanceConfig.progression.playerStartingHealth,
      gold: 0,
      shopTier: 1,
      hand: [],
      board: [],
    },
    1,
  );

  return {
    rng,
    cardFactory,
    state: {
      phase: 'ShopPhase',
      seed,
      round: 1,
      player,
      shop: createShopOffer(player.shopTier, rng, cardFactory),
    },
  };
}

export function buyCard(session: GameSession, slotId: string): GameSession {
  assertPhase(session.state, 'ShopPhase');
  const paid = payForBuyCard(session.state.player);
  const bought = buyFromShopSlot(session.state.shop, slotId);
  const playerWithCard = addCardToHand(paid.player, bought.card);
  const triggered = applyCardTrigger(playerWithCard, bought.card, 'onBuy', session);
  const fusion = applyAutomaticFusions(triggered.player, getCardDefinition, session.cardFactory);

  return updateSession(session, {
    player: fusion.player,
    shop: bought.shop,
  });
}

export function sellCard(session: GameSession, instanceId: string): GameSession {
  assertPhase(session.state, 'ShopPhase');
  const removed = removeCardForSale(session.state.player, instanceId);
  const triggered = applyCardTrigger(removed.player, removed.card, 'onSell', session);
  const economy = gainGoldFromSale(triggered.player);

  return updateSession(session, {
    player: economy.player,
  });
}

export function refreshShop(session: GameSession): GameSession {
  assertPhase(session.state, 'ShopPhase');
  const paid = payForRefresh(session.state.player);

  return updateSession(session, {
    player: paid.player,
    shop: refreshShopOffer(session.state.shop, paid.player.shopTier, session.rng, session.cardFactory),
  });
}

export function freezeShop(session: GameSession, isFrozen: boolean): GameSession {
  assertPhase(session.state, 'ShopPhase');

  return updateSession(session, {
    shop: setShopFrozen(session.state.shop, isFrozen),
  });
}

export function upgradeShop(session: GameSession): GameSession {
  assertPhase(session.state, 'ShopPhase');
  const paid = payForTavernUpgrade(session.state.player);

  return updateSession(session, {
    player: paid.player,
  });
}

export function placeCardOnBoard(session: GameSession, instanceId: string, boardIndex?: number): GameSession {
  assertPhase(session.state, 'ShopPhase');
  const player = moveCardFromHandToBoard(session.state.player, instanceId, boardIndex);
  const placedCard = player.board.find((card) => card.instanceId === instanceId);

  return updateSession(session, {
    player: placedCard ? applyCardTrigger(player, placedCard, 'onPlay', session).player : player,
  });
}

export function returnCardToHand(session: GameSession, instanceId: string, handIndex?: number): GameSession {
  assertPhase(session.state, 'ShopPhase');

  return updateSession(session, {
    player: moveCardFromBoardToHand(session.state.player, instanceId, handIndex),
  });
}

export function reorderPlayerBoard(session: GameSession, fromIndex: number, toIndex: number): GameSession {
  assertPhase(session.state, 'ShopPhase');

  return updateSession(session, {
    player: reorderBoard(session.state.player, fromIndex, toIndex),
  });
}

export function resolveCurrentCombat(session: GameSession): GameSession {
  assertPhase(session.state, 'ShopPhase');
  const enemy = getEnemyForRound(session.state.round);
  const enemyBoard = enemy.cards.map((entry) =>
    session.cardFactory.create(getCardDefinition(entry.cardId), { upgraded: entry.upgraded }),
  );
  const shopEnded = applyShopTurnEndEffects(session.state.player, enemyBoard, session);
  const playerAfterShop = discardRemainingGold(shopEnded.player);
  const prepared = applyCombatStartSynergies(playerAfterShop.board, shopEnded.enemyBoard, session);
  const combat = simulateCombat({
    playerBoard: prepared.playerBoard,
    enemyBoard: prepared.enemyBoard,
    rng: session.rng,
    resolveDefinition: getCardDefinition,
  });
  const damagedPlayer =
    combat.outcome === 'loss'
      ? {
          ...playerAfterShop,
          health: Math.max(0, playerAfterShop.health - getLossDamageForRound(session.state.round)),
        }
      : playerAfterShop;
  const phase = getPostCombatPhase(damagedPlayer.health, session.state.round, combat.outcome);

  return updateSession(session, {
    phase,
    player: damagedPlayer,
    lastCombat: {
      ...combat,
      events: [...shopEnded.events, ...prepared.events, ...combat.events],
    },
  });
}

export function continueAfterCombat(session: GameSession): GameSession {
  if (session.state.phase !== 'RewardPhase') {
    throw new Error(`Cannot continue from phase ${session.state.phase}`);
  }

  const nextRound = session.state.round + 1;
  const player = setGoldForRound(
    {
      ...session.state.player,
    },
    nextRound,
  );
  const shop = session.state.shop.isFrozen
    ? setShopFrozen(session.state.shop, false)
    : createShopOffer(player.shopTier, session.rng, session.cardFactory);

  return updateSession(session, {
    phase: 'ShopPhase',
    round: nextRound,
    player,
    shop,
    lastCombat: undefined,
  });
}

function applyShopTurnEndEffects(
  player: PlayerState,
  enemyBoard: CardInstance[],
  session: GameSession,
): { player: PlayerState; enemyBoard: CardInstance[]; events: CombatEvent[] } {
  let nextPlayer = player;
  let nextEnemyBoard = enemyBoard;
  const events: CombatEvent[] = [];

  for (const card of [...player.hand, ...player.board]) {
    const result = applyCardTrigger(nextPlayer, card, 'onShopTurnEnd', session, nextEnemyBoard);
    nextPlayer = result.player;
    nextEnemyBoard = result.enemies;
    events.push(...result.events);
  }

  const synergies = applySynergies({
    allies: nextPlayer.board,
    enemies: nextEnemyBoard,
    rng: session.rng,
    trigger: 'onShopTurnEnd',
    resolveDefinition: getCardDefinition,
    createCard: (cardId) => session.cardFactory.create(getCardDefinition(cardId)),
  });

  return {
    player: {
      ...nextPlayer,
      board: synergies.allies,
    },
    enemyBoard: synergies.enemies,
    events: [...events, ...synergies.events],
  };
}

function applyCardTrigger(
  player: PlayerState,
  source: CardInstance,
  trigger: EffectTrigger,
  session: GameSession,
  enemies: CardInstance[] = [],
): { player: PlayerState; enemies: CardInstance[]; events: CombatEvent[] } {
  let allies = [...player.hand, ...player.board];
  let nextEnemies = enemies;
  const events: CombatEvent[] = [];
  const definition = getCardDefinition(source.definitionId);
  const effects = [...definition.effects, ...source.temporaryEffects].filter((effect) => effect.trigger === trigger);

  for (const effect of effects) {
    const liveSource = allies.find((card) => card.instanceId === source.instanceId) ?? source;
    const result = executeEffect(effect, {
      source: liveSource,
      allies,
      enemies: nextEnemies,
      rng: session.rng,
      createCard: (cardId) => session.cardFactory.create(getCardDefinition(cardId)),
    });

    allies = result.allies;
    nextEnemies = result.enemies;
    events.push(...result.events);
  }

  const handIds = new Set(player.hand.map((card) => card.instanceId));
  const boardIds = new Set(player.board.map((card) => card.instanceId));
  const byId = new Map(allies.map((card) => [card.instanceId, card]));
  const hand = player.hand.flatMap((card) => {
    const updated = byId.get(card.instanceId);
    return updated ? [updated] : [];
  });
  const board = player.board.flatMap((card) => {
    const updated = byId.get(card.instanceId);
    return updated ? [updated] : [];
  });
  const summoned = allies.filter((card) => !handIds.has(card.instanceId) && !boardIds.has(card.instanceId));

  return {
    player: {
      ...player,
      hand,
      board: [...board, ...summoned].slice(0, balanceConfig.shop.boardLimit),
    },
    enemies: nextEnemies,
    events,
  };
}

function applyCombatStartSynergies(
  playerBoard: CardInstance[],
  enemyBoard: CardInstance[],
  session: GameSession,
): { playerBoard: CardInstance[]; enemyBoard: CardInstance[]; events: CombatEvent[] } {
  const result = applySynergies({
    allies: playerBoard,
    enemies: enemyBoard,
    rng: session.rng,
    trigger: 'onCombatStart',
    resolveDefinition: getCardDefinition,
    createCard: (cardId) => session.cardFactory.create(getCardDefinition(cardId)),
  });

  return {
    playerBoard: result.allies,
    enemyBoard: result.enemies,
    events: result.events,
  };
}

function getPostCombatPhase(
  playerHealth: number,
  round: number,
  outcome: CombatOutcome,
): GameState['phase'] {
  if (playerHealth <= 0) {
    return 'GameOver';
  }

  if (outcome === 'win' && round >= balanceConfig.progression.finalRound) {
    return 'Victory';
  }

  return 'RewardPhase';
}

function updateSession(session: GameSession, patch: Partial<GameState>): GameSession {
  return {
    ...session,
    state: {
      ...session.state,
      ...patch,
    },
  };
}

function assertPhase(state: GameState, expected: GameState['phase']): void {
  if (state.phase !== expected) {
    throw new Error(`Expected phase ${expected}, received ${state.phase}`);
  }
}
