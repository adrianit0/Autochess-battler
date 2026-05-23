import { balanceConfig } from '../../data/balance';
import type { CardDefinitionResolver } from '../cards/fusion';
import type { BalanceConfig, CardInstance, CombatEvent, CombatResult, EffectDefinition } from '../types';
import type { RngService } from '../rng/rng';

export interface SimulateCombatInput {
  playerBoard: CardInstance[];
  enemyBoard: CardInstance[];
  rng: RngService;
  resolveDefinition: CardDefinitionResolver;
  config?: BalanceConfig;
}

type CombatSide = 'player' | 'enemy';

interface AttackCursor {
  player: number;
  enemy: number;
}

export function simulateCombat(input: SimulateCombatInput): CombatResult {
  const config = input.config ?? balanceConfig;
  let playerBoard = cloneCards(input.playerBoard);
  let enemyBoard = cloneCards(input.enemyBoard);
  const initialPlayerCards = cloneCards(playerBoard);
  const initialEnemyCards = cloneCards(enemyBoard);
  let side: CombatSide = config.combat.playerStarts ? 'player' : 'enemy';
  let actionCount = 0;
  const cursor: AttackCursor = { player: 0, enemy: 0 };
  const events: CombatEvent[] = [];

  while (actionCount < config.combat.maxActions) {
    const currentOutcome = getOutcome(playerBoard, enemyBoard);

    if (currentOutcome) {
      events.push({ type: 'result', outcome: currentOutcome });
      return buildResult(currentOutcome, playerBoard, enemyBoard, events, initialPlayerCards, initialEnemyCards);
    }

    const activeBoard = side === 'player' ? playerBoard : enemyBoard;
    const attackerRef = getNextAttacker(activeBoard, cursor[side]);

    if (!attackerRef) {
      side = oppositeSide(side);
      continue;
    }

    cursor[side] = attackerRef.nextCursor;
    const attackCount = hasEffect(attackerRef.card, 'doubleAttack', input.resolveDefinition) ? 2 : 1;

    for (let attackIndex = 0; attackIndex < attackCount; attackIndex += 1) {
      const boards = performAttack({
        side,
        playerBoard,
        enemyBoard,
        attackerId: attackerRef.card.instanceId,
        rng: input.rng,
        resolveDefinition: input.resolveDefinition,
        events,
      });

      playerBoard = boards.playerBoard;
      enemyBoard = boards.enemyBoard;
      actionCount += 1;

      if (getOutcome(playerBoard, enemyBoard) || actionCount >= config.combat.maxActions) {
        break;
      }
    }

    side = oppositeSide(side);
  }

  events.push({ type: 'result', outcome: 'draw' });
  return buildResult('draw', playerBoard, enemyBoard, events, initialPlayerCards, initialEnemyCards);
}

interface PerformAttackInput {
  side: CombatSide;
  playerBoard: CardInstance[];
  enemyBoard: CardInstance[];
  attackerId: string;
  rng: RngService;
  resolveDefinition: CardDefinitionResolver;
  events: CombatEvent[];
}

function performAttack(input: PerformAttackInput): { playerBoard: CardInstance[]; enemyBoard: CardInstance[] } {
  const attackerBoard = input.side === 'player' ? input.playerBoard : input.enemyBoard;
  const defenderBoard = input.side === 'player' ? input.enemyBoard : input.playerBoard;
  const attacker = attackerBoard.find((card) => card.instanceId === input.attackerId);

  if (!attacker || attacker.status.isDead || attacker.health <= 0) {
    return {
      playerBoard: input.playerBoard,
      enemyBoard: input.enemyBoard,
    };
  }

  const target = pickAttackTarget(defenderBoard, input.rng, input.resolveDefinition);

  if (!target) {
    return {
      playerBoard: input.playerBoard,
      enemyBoard: input.enemyBoard,
    };
  }

  input.events.push({
    type: 'attack',
    attackerId: attacker.instanceId,
    targetId: target.instanceId,
  });

  const nextAttackerBoard = damageCard(attackerBoard, attacker.instanceId, target.attack);
  const nextDefenderBoard = damageCard(defenderBoard, target.instanceId, attacker.attack);

  input.events.push({
    type: 'damage',
    sourceId: attacker.instanceId,
    targetId: target.instanceId,
    amount: attacker.attack,
  });
  input.events.push({
    type: 'damage',
    sourceId: target.instanceId,
    targetId: attacker.instanceId,
    amount: target.attack,
  });

  const nextPlayerBoard = input.side === 'player' ? nextAttackerBoard : nextDefenderBoard;
  const nextEnemyBoard = input.side === 'player' ? nextDefenderBoard : nextAttackerBoard;

  return removeDeadCards(nextPlayerBoard, nextEnemyBoard, input.events);
}

function damageCard(cards: CardInstance[], targetId: string, damage: number): CardInstance[] {
  return cards.map((card) => {
    if (card.instanceId !== targetId) {
      return card;
    }

    const health = card.health - damage;
    return {
      ...card,
      health,
      status: {
        ...card.status,
        isDead: health <= 0,
      },
    };
  });
}

function removeDeadCards(
  playerBoard: CardInstance[],
  enemyBoard: CardInstance[],
  events: CombatEvent[],
): { playerBoard: CardInstance[]; enemyBoard: CardInstance[] } {
  for (const card of [...playerBoard, ...enemyBoard]) {
    if (card.status.isDead || card.health <= 0) {
      events.push({
        type: 'death',
        cardId: card.instanceId,
      });
    }
  }

  return {
    playerBoard: livingCards(playerBoard),
    enemyBoard: livingCards(enemyBoard),
  };
}

function pickAttackTarget(
  defenderBoard: CardInstance[],
  rng: RngService,
  resolveDefinition: CardDefinitionResolver,
): CardInstance | null {
  const livingDefenders = livingCards(defenderBoard);

  if (livingDefenders.length === 0) {
    return null;
  }

  const tauntDefenders = livingDefenders.filter((card) => hasEffect(card, 'taunt', resolveDefinition));
  return rng.pickOne(tauntDefenders.length > 0 ? tauntDefenders : livingDefenders);
}

function getNextAttacker(
  board: CardInstance[],
  cursor: number,
): { card: CardInstance; nextCursor: number } | null {
  if (board.length === 0) {
    return null;
  }

  for (let offset = 0; offset < board.length; offset += 1) {
    const index = (cursor + offset) % board.length;
    const card = board[index];

    if (!card.status.isDead && card.health > 0) {
      return {
        card,
        nextCursor: index + 1,
      };
    }
  }

  return null;
}

function getOutcome(playerBoard: CardInstance[], enemyBoard: CardInstance[]): CombatResult['outcome'] | null {
  const playerAlive = livingCards(playerBoard).length > 0;
  const enemyAlive = livingCards(enemyBoard).length > 0;

  if (playerAlive && enemyAlive) {
    return null;
  }

  if (playerAlive) {
    return 'win';
  }

  if (enemyAlive) {
    return 'loss';
  }

  return 'draw';
}

function buildResult(
  outcome: CombatResult['outcome'],
  playerBoard: CardInstance[],
  enemyBoard: CardInstance[],
  events: CombatEvent[],
  initialPlayerCards: CardInstance[],
  initialEnemyCards: CardInstance[],
): CombatResult {
  return {
    outcome,
    events,
    initialPlayerCards,
    initialEnemyCards,
    remainingPlayerCards: livingCards(playerBoard),
    remainingEnemyCards: livingCards(enemyBoard),
  };
}

function hasEffect(
  card: CardInstance,
  type: EffectDefinition['type'],
  resolveDefinition: CardDefinitionResolver,
): boolean {
  const definition = resolveDefinition(card.definitionId);
  return [...definition.effects, ...card.temporaryEffects].some((effect) => effect.type === type);
}

function livingCards(cards: readonly CardInstance[]): CardInstance[] {
  return cards.filter((card) => !card.status.isDead && card.health > 0);
}

function cloneCards(cards: readonly CardInstance[]): CardInstance[] {
  return cards.map((card) => ({
    ...card,
    temporaryEffects: card.temporaryEffects.map((effect) => ({ ...effect })),
    status: { ...card.status },
  }));
}

function oppositeSide(side: CombatSide): CombatSide {
  return side === 'player' ? 'enemy' : 'player';
}
