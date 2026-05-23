import { getCardDefinition } from '../../data/cards';
import { createCardFactory } from './card-factory';

describe('card factory', () => {
  it('creates a card instance from a definition', () => {
    const factory = createCardFactory('test');
    const definition = getCardDefinition('card_neutral_sellsword');
    const instance = factory.create(definition);

    expect(instance.instanceId).toBe('test_0001');
    expect(instance.definitionId).toBe(definition.id);
    expect(instance.attack).toBe(definition.attack);
    expect(instance.health).toBe(definition.health);
    expect(instance.maxHealth).toBe(definition.health);
    expect(instance.isUpgraded).toBe(false);
    expect(instance.status.isDead).toBe(false);
  });

  it('creates upgraded instances with doubled base stats', () => {
    const factory = createCardFactory('test');
    const definition = getCardDefinition('card_beast_rat');
    const instance = factory.create(definition, { upgraded: true });

    expect(instance.attack).toBe(definition.attack * 2);
    expect(instance.health).toBe(definition.health * 2);
    expect(instance.maxHealth).toBe(definition.health * 2);
    expect(instance.isUpgraded).toBe(true);
  });

  it('creates independent instances', () => {
    const factory = createCardFactory('test');
    const definition = getCardDefinition('card_mech_guard');
    const first = factory.create(definition);
    const second = factory.create(definition);

    first.health = 1;
    first.status.isDead = true;

    expect(first.instanceId).toBe('test_0001');
    expect(second.instanceId).toBe('test_0002');
    expect(second.health).toBe(definition.health);
    expect(second.status.isDead).toBe(false);
  });

  it('clones instances without sharing mutable state', () => {
    const factory = createCardFactory('test');
    const definition = getCardDefinition('card_arcane_duelist');
    const original = factory.create(definition);
    original.temporaryEffects.push(...definition.effects);
    const clone = factory.clone(original);

    clone.temporaryEffects[0].description = 'Changed in clone';
    clone.status.isDead = true;

    expect(clone.instanceId).toBe('test_0002');
    expect(original.instanceId).toBe('test_0001');
    expect(original.temporaryEffects[0].description).toBe('Ataque doble.');
    expect(original.status.isDead).toBe(false);
  });

  it('can preserve an instance id when cloning for snapshots', () => {
    const factory = createCardFactory('test');
    const definition = getCardDefinition('card_elemental_pebble');
    const original = factory.create(definition);
    const clone = factory.clone(original, { preserveInstanceId: true });

    expect(clone.instanceId).toBe(original.instanceId);
    expect(clone).not.toBe(original);
  });
});
