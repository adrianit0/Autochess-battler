import type {
  CardInstance,
  CombatEffectEvent,
  CombatEvent,
  EffectDefinition,
  EffectTarget,
} from '../types';
import type { RngService } from '../rng/rng';

export interface EffectContext {
  source?: CardInstance;
  allies: CardInstance[];
  enemies: CardInstance[];
  rng: RngService;
  boardLimit?: number;
  createCard?: (cardId: string) => CardInstance;
}

export interface EffectExecutionResult {
  allies: CardInstance[];
  enemies: CardInstance[];
  events: CombatEvent[];
}

const DEFAULT_BOARD_LIMIT = 7;

export function executeEffect(effect: EffectDefinition, context: EffectContext): EffectExecutionResult {
  const allies = cloneCards(context.allies);
  const enemies = cloneCards(context.enemies);
  const baseContext = {
    ...context,
    allies,
    enemies,
  };

  switch (effect.type) {
    case 'taunt':
    case 'doubleAttack':
      return {
        allies,
        enemies,
        events: [createEffectEvent(effect, context.source, undefined, 'Passive effect registered.')],
      };
    case 'statBuff':
      return executeStatBuff(effect, baseContext);
    case 'randomDamage':
      return executeRandomDamage(effect, baseContext);
    case 'summon':
      return executeSummon(effect, baseContext);
  }
}

function executeStatBuff(
  effect: Extract<EffectDefinition, { type: 'statBuff' }>,
  context: RequiredBoardContext,
): EffectExecutionResult {
  const targets = selectEffectTargets(effect.target, context);

  if (targets.length === 0) {
    return noValidTargets(effect, context);
  }

  const targetIds = new Set(targets.map((card) => card.instanceId));
  const buffCard = (card: CardInstance): CardInstance => {
    if (!targetIds.has(card.instanceId)) {
      return card;
    }

    return {
      ...card,
      attack: card.attack + effect.attack,
      health: card.health + effect.health,
      maxHealth: card.maxHealth + effect.health,
    };
  };

  return {
    allies: context.allies.map(buffCard),
    enemies: context.enemies.map(buffCard),
    events: targets.map((target) =>
      createEffectEvent(
        effect,
        context.source,
        target,
        `Buffed ${target.instanceId} by +${effect.attack}/+${effect.health}.`,
      ),
    ),
  };
}

function executeRandomDamage(
  effect: Extract<EffectDefinition, { type: 'randomDamage' }>,
  context: RequiredBoardContext,
): EffectExecutionResult {
  const targets = selectTargets(effect.target, context);

  if (targets.length === 0) {
    return noValidTargets(effect, context);
  }

  const target = context.rng.pickOne(targets);
  const targetId = target.instanceId;
  const applyDamage = (card: CardInstance): CardInstance => {
    if (card.instanceId !== targetId) {
      return card;
    }

    const health = card.health - effect.damage;
    return {
      ...card,
      health,
      status: {
        ...card.status,
        isDead: health <= 0,
      },
    };
  };

  const events: CombatEvent[] = [
    {
      type: 'damage',
      sourceId: context.source?.instanceId ?? effect.id,
      targetId,
      amount: effect.damage,
    },
    createEffectEvent(effect, context.source, target, `Dealt ${effect.damage} damage to ${targetId}.`),
  ];

  if (target.health - effect.damage <= 0) {
    events.push({
      type: 'death',
      cardId: targetId,
    });
  }

  return {
    allies: context.allies.map(applyDamage),
    enemies: context.enemies.map(applyDamage),
    events,
  };
}

function executeSummon(
  effect: Extract<EffectDefinition, { type: 'summon' }>,
  context: RequiredBoardContext,
): EffectExecutionResult {
  const boardLimit = context.boardLimit ?? DEFAULT_BOARD_LIMIT;

  if (context.allies.length >= boardLimit) {
    return {
      allies: context.allies,
      enemies: context.enemies,
      events: [createEffectEvent(effect, context.source, undefined, 'Summon skipped because board is full.')],
    };
  }

  if (!context.createCard) {
    throw new Error(`Effect ${effect.id} requires createCard callback`);
  }

  const summoned = context.createCard(effect.cardId);
  const finalSummoned = {
    ...summoned,
    attack: effect.attack ?? summoned.attack,
    health: effect.health ?? summoned.health,
    maxHealth: effect.health ?? summoned.maxHealth,
  };

  return {
    allies: [...context.allies, finalSummoned],
    enemies: context.enemies,
    events: [
      createEffectEvent(effect, context.source, finalSummoned, `Summoned ${finalSummoned.instanceId}.`),
    ],
  };
}

type RequiredBoardContext = EffectContext & {
  allies: CardInstance[];
  enemies: CardInstance[];
};

function selectTargets(target: EffectTarget, context: RequiredBoardContext): CardInstance[] {
  switch (target) {
    case 'self':
      return context.source ? [context.source] : [];
    case 'randomEnemy':
      return livingCards(context.enemies);
    case 'randomAlly':
      return livingCards(context.allies);
    case 'lowestHealthAlly': {
      const allies = livingCards(context.allies);
      const lowestHealth = Math.min(...allies.map((card) => card.health));
      return allies.filter((card) => card.health === lowestHealth);
    }
    case 'allEnemies':
      return livingCards(context.enemies);
    case 'none':
      return [];
  }
}

function selectEffectTargets(target: EffectTarget, context: RequiredBoardContext): CardInstance[] {
  const candidates = selectTargets(target, context);

  if (candidates.length <= 1) {
    return candidates;
  }

  if (target === 'randomAlly' || target === 'randomEnemy' || target === 'lowestHealthAlly') {
    return [context.rng.pickOne(candidates)];
  }

  return candidates;
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

function noValidTargets(effect: EffectDefinition, context: RequiredBoardContext): EffectExecutionResult {
  return {
    allies: context.allies,
    enemies: context.enemies,
    events: [createEffectEvent(effect, context.source, undefined, 'No valid targets.')],
  };
}

function createEffectEvent(
  effect: EffectDefinition,
  source: CardInstance | undefined,
  target: CardInstance | undefined,
  message: string,
): CombatEffectEvent {
  return {
    type: 'effect',
    effectId: effect.id,
    sourceId: source?.instanceId,
    targetId: target?.instanceId,
    message,
  };
}
