import type { CardDefinition } from '../core/types';

export const cardDefinitions: CardDefinition[] = [
  {
    id: 'card_neutral_sellsword',
    name: 'Mercenario',
    description: 'Carta neutral simple con estadisticas equilibradas.',
    tier: 1,
    attack: 2,
    health: 2,
    classes: [],
    effects: [],
    artKey: 'placeholder_neutral_sellsword',
    playerText: '2/2 neutral.',
  },
  {
    id: 'card_beast_rat',
    name: 'Rata feroz',
    description: 'Bestia agresiva de bajo coste.',
    tier: 1,
    attack: 3,
    health: 1,
    classes: ['beast'],
    effects: [],
    artKey: 'placeholder_beast_rat',
    playerText: 'Bestia 3/1.',
  },
  {
    id: 'card_mech_guard',
    name: 'Guardia mecanico',
    description: 'Maquina defensiva con Provocar.',
    tier: 1,
    attack: 1,
    health: 3,
    classes: ['mech'],
    effects: [
      {
        id: 'effect_taunt_mech_guard',
        type: 'taunt',
        trigger: 'passive',
        target: 'self',
        description: 'Provocar.',
      },
    ],
    artKey: 'placeholder_mech_guard',
    playerText: 'Provocar.',
  },
  {
    id: 'card_arcane_spark',
    name: 'Chispa arcana',
    description: 'Arcano que hace dano al comprarlo.',
    tier: 1,
    attack: 1,
    health: 2,
    classes: ['arcane'],
    effects: [
      {
        id: 'effect_buy_arcane_spark_damage',
        type: 'randomDamage',
        trigger: 'onBuy',
        target: 'randomEnemy',
        damage: 1,
        description: 'Grito de compra: inflige 1 de dano a un enemigo aleatorio si existe.',
      },
    ],
    artKey: 'placeholder_arcane_spark',
    playerText: 'Grito de compra: inflige 1 de dano aleatorio.',
  },
  {
    id: 'card_undead_bonecaller',
    name: 'Llamahuesos',
    description: 'No-muerto que invoca un esqueleto al morir.',
    tier: 1,
    attack: 1,
    health: 1,
    classes: ['undead'],
    effects: [
      {
        id: 'effect_deathrattle_bonecaller_skeleton',
        type: 'summon',
        trigger: 'onDeath',
        target: 'none',
        cardId: 'card_token_skeleton',
        description: 'Ultimo aliento: invoca un Esqueleto 1/1.',
      },
    ],
    artKey: 'placeholder_undead_bonecaller',
    playerText: 'Ultimo aliento: invoca un Esqueleto 1/1.',
  },
  {
    id: 'card_elemental_pebble',
    name: 'Guijarro viviente',
    description: 'Elemental basico resistente.',
    tier: 1,
    attack: 1,
    health: 3,
    classes: ['elemental'],
    effects: [],
    artKey: 'placeholder_elemental_pebble',
    playerText: 'Elemental 1/3.',
  },
  {
    id: 'card_token_skeleton',
    name: 'Esqueleto',
    description: 'Ficha invocada por efectos de No-muertos.',
    tier: 1,
    attack: 1,
    health: 1,
    classes: ['undead'],
    effects: [],
    artKey: 'placeholder_token_skeleton',
    playerText: 'Ficha 1/1.',
  },
  {
    id: 'card_beast_alpha',
    name: 'Alfa de manada',
    description: 'Bestia que mejora el ataque de un aliado al inicio del combate.',
    tier: 2,
    attack: 3,
    health: 3,
    classes: ['beast'],
    effects: [
      {
        id: 'effect_combat_start_alpha_attack',
        type: 'statBuff',
        trigger: 'onCombatStart',
        target: 'randomAlly',
        attack: 1,
        health: 0,
        permanent: false,
        description: 'Inicio de combate: un aliado aleatorio gana +1 ataque.',
      },
    ],
    artKey: 'placeholder_beast_alpha',
    playerText: 'Inicio de combate: un aliado aleatorio gana +1 ataque.',
  },
  {
    id: 'card_mech_bulwark',
    name: 'Baluarte mecanico',
    description: 'Maquina defensiva de nivel 2.',
    tier: 2,
    attack: 2,
    health: 5,
    classes: ['mech'],
    effects: [
      {
        id: 'effect_taunt_mech_bulwark',
        type: 'taunt',
        trigger: 'passive',
        target: 'self',
        description: 'Provocar.',
      },
    ],
    artKey: 'placeholder_mech_bulwark',
    playerText: 'Provocar.',
  },
  {
    id: 'card_arcane_duelist',
    name: 'Duelista arcano',
    description: 'Atacante arcano con ataque doble.',
    tier: 2,
    attack: 2,
    health: 3,
    classes: ['arcane'],
    effects: [
      {
        id: 'effect_double_attack_arcane_duelist',
        type: 'doubleAttack',
        trigger: 'passive',
        target: 'self',
        description: 'Ataque doble.',
      },
    ],
    artKey: 'placeholder_arcane_duelist',
    playerText: 'Ataque doble.',
  },
  {
    id: 'card_undead_gravedigger',
    name: 'Sepulturero',
    description: 'No-muerto que crece cuando termina la tienda.',
    tier: 2,
    attack: 2,
    health: 4,
    classes: ['undead'],
    effects: [
      {
        id: 'effect_shop_end_gravedigger_buff',
        type: 'statBuff',
        trigger: 'onShopTurnEnd',
        target: 'self',
        attack: 1,
        health: 0,
        permanent: true,
        description: 'Fin de tienda: gana +1 ataque permanente.',
      },
    ],
    artKey: 'placeholder_undead_gravedigger',
    playerText: 'Fin de tienda: gana +1 ataque permanente.',
  },
  {
    id: 'card_elemental_kindler',
    name: 'Avivador elemental',
    description: 'Elemental que mejora a otro elemental.',
    tier: 2,
    attack: 2,
    health: 3,
    classes: ['elemental'],
    effects: [
      {
        id: 'effect_buy_kindler_buff',
        type: 'statBuff',
        trigger: 'onBuy',
        target: 'randomAlly',
        attack: 1,
        health: 1,
        permanent: true,
        description: 'Grito de compra: un aliado aleatorio gana +1/+1 permanente.',
      },
    ],
    artKey: 'placeholder_elemental_kindler',
    playerText: 'Grito de compra: un aliado aleatorio gana +1/+1.',
  },
  {
    id: 'card_beast_mech_hybrid',
    name: 'Quimera ensamblada',
    description: 'Carta de doble clase para validar sinergias mixtas.',
    tier: 3,
    attack: 4,
    health: 4,
    classes: ['beast', 'mech'],
    effects: [],
    artKey: 'placeholder_beast_mech_hybrid',
    playerText: 'Bestia/Maquina 4/4.',
  },
  {
    id: 'card_arcane_elemental_orb',
    name: 'Orbe vivo',
    description: 'Arcano y Elemental con dano aleatorio al inicio del combate.',
    tier: 3,
    attack: 3,
    health: 5,
    classes: ['arcane', 'elemental'],
    effects: [
      {
        id: 'effect_combat_start_orb_damage',
        type: 'randomDamage',
        trigger: 'onCombatStart',
        target: 'randomEnemy',
        damage: 2,
        description: 'Inicio de combate: inflige 2 de dano a un enemigo aleatorio.',
      },
    ],
    artKey: 'placeholder_arcane_elemental_orb',
    playerText: 'Inicio de combate: inflige 2 de dano aleatorio.',
  },
  {
    id: 'card_undead_revenant',
    name: 'Retornado',
    description: 'No-muerto resistente con ultimo aliento ofensivo.',
    tier: 3,
    attack: 4,
    health: 5,
    classes: ['undead'],
    effects: [
      {
        id: 'effect_deathrattle_revenant_damage',
        type: 'randomDamage',
        trigger: 'onDeath',
        target: 'randomEnemy',
        damage: 2,
        description: 'Ultimo aliento: inflige 2 de dano a un enemigo aleatorio.',
      },
    ],
    artKey: 'placeholder_undead_revenant',
    playerText: 'Ultimo aliento: inflige 2 de dano aleatorio.',
  },
];

export const cardsById = new Map(cardDefinitions.map((card) => [card.id, card]));

export function getCardDefinition(cardId: string): CardDefinition {
  const card = cardsById.get(cardId);

  if (!card) {
    throw new Error(`Unknown card definition: ${cardId}`);
  }

  return card;
}

export function getCardsForShopTier(shopTier: number): CardDefinition[] {
  if (!Number.isInteger(shopTier) || shopTier < 1 || shopTier > 6) {
    throw new Error(`Invalid shop tier: ${shopTier}`);
  }

  return cardDefinitions.filter((card) => card.tier <= shopTier && !card.id.startsWith('card_token_'));
}
