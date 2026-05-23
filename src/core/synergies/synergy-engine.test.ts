import { getCardDefinition } from '../../data/cards';
import { synergyDefinitions } from '../../data/synergies';
import { createCardFactory } from '../cards/card-factory';
import { createRng } from '../rng/rng';
import type { CardInstance } from '../types';
import { applySynergies, countCardsOfClass, isSynergyActive } from './synergy-engine';

describe('synergy engine', () => {
  it('counts classes from card definitions, including dual-class cards', () => {
    const cards = [
      makeCard('card_beast_rat', 'beast_1'),
      makeCard('card_beast_alpha', 'beast_2'),
      makeCard('card_beast_mech_hybrid', 'hybrid'),
      makeCard('card_neutral_sellsword', 'neutral'),
    ];

    expect(countCardsOfClass(cards, 'beast', getCardDefinition)).toBe(3);
    expect(countCardsOfClass(cards, 'mech', getCardDefinition)).toBe(1);
  });

  it('does not count neutral cards toward synergies', () => {
    const synergy = synergyDefinitions.find((entry) => entry.id === 'synergy_beasts');

    expect(synergy).toBeDefined();
    expect(
      isSynergyActive(
        synergy!,
        [
          makeCard('card_beast_rat', 'beast_1'),
          makeCard('card_beast_alpha', 'beast_2'),
          makeCard('card_neutral_sellsword', 'neutral'),
        ],
        getCardDefinition,
      ),
    ).toBe(false);
  });

  it('activates the Beast combat-start synergy', () => {
    const allies = [
      makeCard('card_beast_rat', 'beast_1'),
      makeCard('card_beast_alpha', 'beast_2'),
      makeCard('card_beast_mech_hybrid', 'beast_3'),
    ];
    const result = applySynergies({
      allies,
      enemies: [],
      rng: createRng('beast-synergy'),
      trigger: 'onCombatStart',
      resolveDefinition: getCardDefinition,
    });

    expect(result.activeSynergyIds).toContain('synergy_beasts');
    expect(result.allies.reduce((sum, card) => sum + card.attack, 0)).toBe(
      allies.reduce((sum, card) => sum + card.attack, 0) + 2,
    );
  });

  it('activates the Mech combat-start synergy', () => {
    const lowHealthMech = makeCard('card_mech_guard', 'mech_1');
    const result = applySynergies({
      allies: [
        lowHealthMech,
        makeCard('card_mech_bulwark', 'mech_2'),
        makeCard('card_beast_mech_hybrid', 'mech_3'),
      ],
      enemies: [],
      rng: createRng('mech-synergy'),
      trigger: 'onCombatStart',
      resolveDefinition: getCardDefinition,
    });

    expect(result.activeSynergyIds).toContain('synergy_mechs');
    expect(result.allies.find((card) => card.instanceId === lowHealthMech.instanceId)?.health).toBe(
      lowHealthMech.health + 3,
    );
  });

  it('activates the Arcane combat-start synergy against enemies', () => {
    const enemy = makeCard('card_mech_guard', 'enemy');
    const result = applySynergies({
      allies: [
        makeCard('card_arcane_spark', 'arcane_1'),
        makeCard('card_arcane_duelist', 'arcane_2'),
        makeCard('card_arcane_elemental_orb', 'arcane_3'),
      ],
      enemies: [enemy],
      rng: createRng('arcane-synergy'),
      trigger: 'onCombatStart',
      resolveDefinition: getCardDefinition,
    });

    expect(result.activeSynergyIds).toContain('synergy_arcanes');
    expect(result.enemies[0].health).toBe(enemy.health - 2);
  });

  it('activates the Undead death synergy by summoning a skeleton', () => {
    const factory = createCardFactory('summoned');
    const result = applySynergies({
      allies: [
        makeCard('card_undead_bonecaller', 'undead_1'),
        makeCard('card_undead_gravedigger', 'undead_2'),
        makeCard('card_undead_revenant', 'undead_3'),
      ],
      enemies: [],
      rng: createRng('undead-synergy'),
      trigger: 'onDeath',
      resolveDefinition: getCardDefinition,
      createCard: (cardId) => factory.create(getCardDefinition(cardId)),
    });

    expect(result.activeSynergyIds).toContain('synergy_undead');
    expect(result.allies.some((card) => card.definitionId === 'card_token_skeleton')).toBe(true);
  });

  it('activates the Elemental shop-end synergy', () => {
    const allies = [
      makeCard('card_elemental_pebble', 'elemental_1'),
      makeCard('card_elemental_kindler', 'elemental_2'),
      makeCard('card_arcane_elemental_orb', 'elemental_3'),
    ];
    const result = applySynergies({
      allies,
      enemies: [],
      rng: createRng('elemental-synergy'),
      trigger: 'onShopTurnEnd',
      resolveDefinition: getCardDefinition,
    });

    expect(result.activeSynergyIds).toContain('synergy_elementals');
    expect(result.allies.reduce((sum, card) => sum + card.attack + card.health, 0)).toBe(
      allies.reduce((sum, card) => sum + card.attack + card.health, 0) + 2,
    );
  });
});

function makeCard(cardId: string, instanceId: string): CardInstance {
  return createCardFactory('synergy').create(getCardDefinition(cardId), { instanceId });
}
