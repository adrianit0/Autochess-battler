import type { CardFactory } from './card-factory';
import type { CardDefinition, CardInstance, PlayerState } from '../types';

export type CardDefinitionResolver = (cardId: string) => CardDefinition;

export interface FusionEvent {
  definitionId: string;
  consumedInstanceIds: string[];
  createdInstanceId: string;
  targetZone: 'hand' | 'board';
}

export interface FusionResult {
  player: PlayerState;
  fusions: FusionEvent[];
}

interface ControlledCardRef {
  card: CardInstance;
  zone: 'hand' | 'board';
  index: number;
}

export function applyAutomaticFusions(
  player: PlayerState,
  resolveDefinition: CardDefinitionResolver,
  cardFactory: CardFactory,
): FusionResult {
  let nextPlayer = player;
  const fusions: FusionEvent[] = [];

  while (true) {
    const fusion = findNextFusion(nextPlayer);

    if (!fusion) {
      break;
    }

    const definition = resolveDefinition(fusion.definitionId);
    const upgraded = cardFactory.create(definition, { upgraded: true });
    const consumedIds = new Set(fusion.cards.map((entry) => entry.card.instanceId));
    const firstCard = fusion.cards[0];

    const handWithoutConsumed = nextPlayer.hand.filter((card) => !consumedIds.has(card.instanceId));
    const boardWithoutConsumed = nextPlayer.board.filter((card) => !consumedIds.has(card.instanceId));

    if (firstCard.zone === 'hand') {
      handWithoutConsumed.splice(Math.min(firstCard.index, handWithoutConsumed.length), 0, upgraded);
    } else {
      boardWithoutConsumed.splice(Math.min(firstCard.index, boardWithoutConsumed.length), 0, upgraded);
    }

    nextPlayer = {
      ...nextPlayer,
      hand: handWithoutConsumed,
      board: boardWithoutConsumed,
    };

    fusions.push({
      definitionId: fusion.definitionId,
      consumedInstanceIds: [...consumedIds],
      createdInstanceId: upgraded.instanceId,
      targetZone: firstCard.zone,
    });
  }

  return {
    player: nextPlayer,
    fusions,
  };
}

function findNextFusion(
  player: PlayerState,
): { definitionId: string; cards: [ControlledCardRef, ControlledCardRef, ControlledCardRef] } | null {
  const controlledCards: ControlledCardRef[] = [
    ...player.hand.map((card, index) => ({ card, zone: 'hand' as const, index })),
    ...player.board.map((card, index) => ({ card, zone: 'board' as const, index })),
  ];
  const cardsByDefinition = new Map<string, ControlledCardRef[]>();

  for (const entry of controlledCards) {
    const existing = cardsByDefinition.get(entry.card.definitionId) ?? [];
    existing.push(entry);
    cardsByDefinition.set(entry.card.definitionId, existing);

    if (existing.length >= 3) {
      return {
        definitionId: entry.card.definitionId,
        cards: [existing[0], existing[1], existing[2]],
      };
    }
  }

  return null;
}
