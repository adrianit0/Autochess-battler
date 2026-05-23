import { getCardDefinition } from '../../data/cards';
import { createCardFactory } from '../cards/card-factory';
import { createRng } from '../rng/rng';
import type { CardInstance, EffectDefinition } from '../types';
import { executeEffect } from './effect-engine';

describe('effect engine', () => {
  it('applies stat buffs to selected targets', () => {
    const source = makeCard('card_elemental_pebble', 'source');
    const effect: EffectDefinition = {
      id: 'effect_test_buff_self',
      type: 'statBuff',
      trigger: 'onShopTurnEnd',
      target: 'self',
      attack: 1,
      health: 2,
      permanent: true,
      description: 'Gain +1/+2.',
    };

    const result = executeEffect(effect, {
      source,
      allies: [source],
      enemies: [],
      rng: createRng('buff-seed'),
    });

    expect(result.allies[0].attack).toBe(source.attack + 1);
    expect(result.allies[0].health).toBe(source.health + 2);
    expect(result.allies[0].maxHealth).toBe(source.maxHealth + 2);
    expect(result.events[0]).toMatchObject({ type: 'effect', effectId: effect.id, targetId: source.instanceId });
  });

  it('deals random damage and marks lethal targets dead', () => {
    const source = makeCard('card_arcane_spark', 'source');
    const enemy = makeCard('card_token_skeleton', 'enemy');
    const effect: EffectDefinition = {
      id: 'effect_test_damage',
      type: 'randomDamage',
      trigger: 'onCombatStart',
      target: 'randomEnemy',
      damage: 1,
      description: 'Deal 1 damage.',
    };

    const result = executeEffect(effect, {
      source,
      allies: [source],
      enemies: [enemy],
      rng: createRng('damage-seed'),
    });

    expect(result.enemies[0].health).toBe(0);
    expect(result.enemies[0].status.isDead).toBe(true);
    expect(result.events.some((event) => event.type === 'damage')).toBe(true);
    expect(result.events.some((event) => event.type === 'death')).toBe(true);
  });

  it('keeps boards unchanged when no valid target exists', () => {
    const source = makeCard('card_arcane_spark', 'source');
    const effect: EffectDefinition = {
      id: 'effect_test_no_target',
      type: 'randomDamage',
      trigger: 'onCombatStart',
      target: 'randomEnemy',
      damage: 2,
      description: 'Deal 2 damage.',
    };

    const result = executeEffect(effect, {
      source,
      allies: [source],
      enemies: [],
      rng: createRng('no-target-seed'),
    });

    expect(result.allies).toHaveLength(1);
    expect(result.enemies).toHaveLength(0);
    expect(result.events[0]).toMatchObject({ type: 'effect', message: 'No valid targets.' });
  });

  it('summons cards through the provided callback', () => {
    const source = makeCard('card_undead_bonecaller', 'source');
    const factory = createCardFactory('summon');
    const effect: EffectDefinition = {
      id: 'effect_test_summon',
      type: 'summon',
      trigger: 'onDeath',
      target: 'none',
      cardId: 'card_token_skeleton',
      description: 'Summon a skeleton.',
    };

    const result = executeEffect(effect, {
      source,
      allies: [source],
      enemies: [],
      rng: createRng('summon-seed'),
      createCard: (cardId) => factory.create(getCardDefinition(cardId)),
    });

    expect(result.allies).toHaveLength(2);
    expect(result.allies[1].definitionId).toBe('card_token_skeleton');
    expect(result.events[0]).toMatchObject({ type: 'effect', effectId: effect.id });
  });

  it('does not summon when the board is full', () => {
    const source = makeCard('card_undead_bonecaller', 'source');
    const allies = Array.from({ length: 7 }, (_, index) =>
      makeCard('card_token_skeleton', `ally_${index}`),
    );
    const effect: EffectDefinition = {
      id: 'effect_test_full_summon',
      type: 'summon',
      trigger: 'onDeath',
      target: 'none',
      cardId: 'card_token_skeleton',
      description: 'Summon a skeleton.',
    };

    const result = executeEffect(effect, {
      source,
      allies,
      enemies: [],
      rng: createRng('full-board-seed'),
      createCard: () => makeCard('card_token_skeleton', 'new_token'),
    });

    expect(result.allies).toHaveLength(7);
    expect(result.events[0]).toMatchObject({
      type: 'effect',
      message: 'Summon skipped because board is full.',
    });
  });
});

function makeCard(cardId: string, instanceId: string): CardInstance {
  return createCardFactory('effect').create(getCardDefinition(cardId), { instanceId });
}
