import { synergyDefinitions } from '../../data/synergies';
import type { CardDefinitionResolver } from '../cards/fusion';
import { executeEffect } from '../effects/effect-engine';
import type {
  CardClass,
  CardInstance,
  CombatEvent,
  EffectTrigger,
  SynergyDefinition,
} from '../types';
import type { RngService } from '../rng/rng';

export interface SynergyContext {
  allies: CardInstance[];
  enemies: CardInstance[];
  rng: RngService;
  trigger: EffectTrigger;
  resolveDefinition: CardDefinitionResolver;
  synergies?: SynergyDefinition[];
  createCard?: (cardId: string) => CardInstance;
}

export interface SynergyResult {
  allies: CardInstance[];
  enemies: CardInstance[];
  events: CombatEvent[];
  activeSynergyIds: string[];
}

export function applySynergies(context: SynergyContext): SynergyResult {
  let allies = context.allies;
  let enemies = context.enemies;
  const events: CombatEvent[] = [];
  const activeSynergyIds: string[] = [];
  const synergies = context.synergies ?? synergyDefinitions;

  for (const synergy of synergies) {
    if (synergy.trigger !== context.trigger) {
      continue;
    }

    if (!isSynergyActive(synergy, allies, context.resolveDefinition)) {
      continue;
    }

    const source = allies.find((card) => card.definitionId !== undefined);
    const result = executeEffect(synergy.effect, {
      source,
      allies,
      enemies,
      rng: context.rng,
      createCard: context.createCard,
    });

    allies = result.allies;
    enemies = result.enemies;
    events.push({
      type: 'effect',
      effectId: synergy.id,
      message: `Synergy activated: ${synergy.id}`,
    });
    events.push(...result.events);
    activeSynergyIds.push(synergy.id);
  }

  return {
    allies,
    enemies,
    events,
    activeSynergyIds,
  };
}

export function isSynergyActive(
  synergy: SynergyDefinition,
  cards: readonly CardInstance[],
  resolveDefinition: CardDefinitionResolver,
): boolean {
  return countCardsOfClass(cards, synergy.cardClass, resolveDefinition) >= synergy.requiredCount;
}

export function countCardsOfClass(
  cards: readonly CardInstance[],
  cardClass: CardClass,
  resolveDefinition: CardDefinitionResolver,
): number {
  return cards.filter((card) => resolveDefinition(card.definitionId).classes.includes(cardClass)).length;
}
