import type { CardDefinition, CardInstance } from '../types';

export interface CardFactory {
  create(definition: CardDefinition, options?: CreateCardOptions): CardInstance;
  clone(instance: CardInstance, options?: CloneCardOptions): CardInstance;
}

export interface CreateCardOptions {
  upgraded?: boolean;
  instanceId?: string;
}

export interface CloneCardOptions {
  preserveInstanceId?: boolean;
  instanceId?: string;
}

export function createCardFactory(namespace = 'card'): CardFactory {
  let nextId = 1;

  function createInstanceId(): string {
    const id = `${namespace}_${nextId.toString().padStart(4, '0')}`;
    nextId += 1;
    return id;
  }

  return {
    create(definition, options = {}) {
      const isUpgraded = options.upgraded ?? false;
      const multiplier = isUpgraded ? 2 : 1;
      const attack = definition.attack * multiplier;
      const health = definition.health * multiplier;

      return {
        instanceId: options.instanceId ?? createInstanceId(),
        definitionId: definition.id,
        attack,
        health,
        maxHealth: health,
        isUpgraded,
        temporaryEffects: [],
        status: {
          isDead: false,
          hasAttackedThisCycle: false,
        },
      };
    },

    clone(instance, options = {}) {
      return {
        ...instance,
        instanceId:
          options.instanceId ?? (options.preserveInstanceId === true ? instance.instanceId : createInstanceId()),
        temporaryEffects: instance.temporaryEffects.map((effect) => ({ ...effect })),
        status: { ...instance.status },
      };
    },
  };
}
