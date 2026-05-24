import type { BalanceConfig, CardDefinition, EnemyDefinition, SynergyDefinition } from '../core/types';
import { balanceConfig } from './balance';
import { cardDefinitions } from './cards';
import { enemyDefinitions } from './enemies';
import { synergyDefinitions } from './synergies';

const visibleTriggerLabels: Record<string, string> = {
  onBuy: '[Compra]',
  onSell: '[Venta]',
  onPlay: '[Jugar]',
  onDeath: '[Muerte]',
  onCombatStart: '[Inicio Combate]',
  onShopTurnEnd: '[Fin Tienda]',
};

const retiredMechanicNames = [
  'Grito de compra',
  'Venta',
  'Jugar carta',
  'Ultimo aliento',
  'Inicio de combate',
  'Fin de Tienda',
];

export interface GameDataSet {
  balance: BalanceConfig;
  cards: CardDefinition[];
  enemies: EnemyDefinition[];
  synergies: SynergyDefinition[];
}

export function validateGameData(data: GameDataSet = getDefaultGameData()): string[] {
  return [
    ...validateBalance(data.balance),
    ...validateCards(data.cards),
    ...validateEnemies(data.enemies, data.cards, data.balance),
    ...validateSynergies(data.synergies, data.cards),
  ];
}

export function assertValidGameData(data: GameDataSet = getDefaultGameData()): void {
  const errors = validateGameData(data);

  if (errors.length > 0) {
    throw new Error(`Invalid game data:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  }
}

export function getDefaultGameData(): GameDataSet {
  return {
    balance: balanceConfig,
    cards: cardDefinitions,
    enemies: enemyDefinitions,
    synergies: synergyDefinitions,
  };
}

function validateBalance(balance: BalanceConfig): string[] {
  const errors: string[] = [];

  if (balance.shop.maxTier !== 6) {
    errors.push('Shop max tier must be 6.');
  }

  if (balance.shop.boardLimit !== 7) {
    errors.push('Board limit must be 7.');
  }

  if (balance.shop.handLimit < balance.shop.boardLimit) {
    errors.push('Hand limit must be greater than or equal to board limit.');
  }

  if (balance.shop.slotCount <= 0) {
    errors.push('Shop slot count must be positive.');
  }

  if (balance.economy.buyCost <= 0) {
    errors.push('Buy cost must be positive.');
  }

  if (balance.economy.sellValue < 0 || balance.economy.refreshCost < 0 || balance.economy.freezeCost < 0) {
    errors.push('Economy costs and sell value cannot be negative.');
  }

  if (balance.economy.maxRoundGold <= 0) {
    errors.push('Max round gold must be positive.');
  }

  for (let tier = 1; tier < balance.shop.maxTier; tier += 1) {
    if (balance.economy.tavernUpgradeCosts[tier] === undefined) {
      errors.push(`Missing tavern upgrade cost for tier ${tier}.`);
    }
  }

  if (balance.combat.maxActions <= 0) {
    errors.push('Combat max actions must be positive.');
  }

  if (balance.progression.playerStartingHealth <= 0) {
    errors.push('Player starting health must be positive.');
  }

  if (balance.progression.finalRound <= 0) {
    errors.push('Final round must be positive.');
  }

  return errors;
}

function validateCards(cards: CardDefinition[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const card of cards) {
    if (ids.has(card.id)) {
      errors.push(`Duplicate card id: ${card.id}.`);
    }
    ids.add(card.id);

    if (!/^card_[a-z0-9_]+$/.test(card.id)) {
      errors.push(`Invalid card id format: ${card.id}.`);
    }

    if (card.tier < 1 || card.tier > 6) {
      errors.push(`Card ${card.id} has invalid tier ${card.tier}.`);
    }

    if (card.attack <= 0 || card.health <= 0) {
      errors.push(`Card ${card.id} must have positive attack and health.`);
    }

    if (card.classes.length > 2) {
      errors.push(`Card ${card.id} has more than 2 classes.`);
    }

    if (new Set(card.classes).size !== card.classes.length) {
      errors.push(`Card ${card.id} has duplicate classes.`);
    }

    if (card.name.trim().length === 0 || card.playerText.trim().length === 0 || card.artKey.trim().length === 0) {
      errors.push(`Card ${card.id} is missing visible metadata.`);
    }

    for (const retiredName of retiredMechanicNames) {
      if (usesRetiredMechanicName(card.playerText, retiredName)) {
        errors.push(`Card ${card.id} uses retired visible mechanic name: ${retiredName}.`);
      }
    }

    for (const effect of card.effects) {
      if (!effect.id.startsWith('effect_')) {
        errors.push(`Card ${card.id} has invalid effect id: ${effect.id}.`);
      }

      if (effect.type === 'summon' && !cards.some((candidate) => candidate.id === effect.cardId)) {
        errors.push(`Card ${card.id} summons unknown card ${effect.cardId}.`);
      }

      const expectedLabel = visibleTriggerLabels[effect.trigger];
      if (expectedLabel && !card.playerText.includes(expectedLabel)) {
        errors.push(`Card ${card.id} with trigger ${effect.trigger} must include ${expectedLabel}.`);
      }
    }
  }

  return errors;
}

function usesRetiredMechanicName(text: string, retiredName: string): boolean {
  if (retiredName === 'Venta') {
    return /(^|[^\[])Venta(?!\])/.test(text);
  }

  return text.includes(retiredName);
}

function validateEnemies(
  enemies: EnemyDefinition[],
  cards: CardDefinition[],
  balance: BalanceConfig,
): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const rounds = new Set<number>();
  const cardIds = new Set(cards.map((card) => card.id));

  for (const enemy of enemies) {
    if (ids.has(enemy.id)) {
      errors.push(`Duplicate enemy id: ${enemy.id}.`);
    }
    ids.add(enemy.id);

    if (rounds.has(enemy.round)) {
      errors.push(`Duplicate enemy round: ${enemy.round}.`);
    }
    rounds.add(enemy.round);

    if (!/^enemy_r\d{2}_[a-z0-9_]+$/.test(enemy.id)) {
      errors.push(`Invalid enemy id format: ${enemy.id}.`);
    }

    if (enemy.round < 1) {
      errors.push(`Enemy ${enemy.id} has invalid round ${enemy.round}.`);
    }

    if (enemy.cards.length === 0 || enemy.cards.length > balance.shop.boardLimit) {
      errors.push(`Enemy ${enemy.id} must have 1..${balance.shop.boardLimit} cards.`);
    }

    for (const card of enemy.cards) {
      if (!cardIds.has(card.cardId)) {
        errors.push(`Enemy ${enemy.id} references unknown card ${card.cardId}.`);
      }
    }
  }

  for (let round = 1; round <= balance.progression.finalRound; round += 1) {
    if (!rounds.has(round)) {
      errors.push(`Missing enemy for round ${round}.`);
    }
  }

  return errors;
}

function validateSynergies(synergies: SynergyDefinition[], cards: CardDefinition[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const cardIds = new Set(cards.map((card) => card.id));

  for (const synergy of synergies) {
    if (ids.has(synergy.id)) {
      errors.push(`Duplicate synergy id: ${synergy.id}.`);
    }
    ids.add(synergy.id);

    if (!synergy.id.startsWith('synergy_')) {
      errors.push(`Invalid synergy id format: ${synergy.id}.`);
    }

    if (synergy.requiredCount <= 0) {
      errors.push(`Synergy ${synergy.id} must require at least 1 card.`);
    }

    if (!synergy.effect.id.startsWith('effect_')) {
      errors.push(`Synergy ${synergy.id} has invalid effect id ${synergy.effect.id}.`);
    }

    if (synergy.effect.type === 'summon' && !cardIds.has(synergy.effect.cardId)) {
      errors.push(`Synergy ${synergy.id} summons unknown card ${synergy.effect.cardId}.`);
    }

    const expectedLabel = visibleTriggerLabels[synergy.trigger];
    if (expectedLabel && !synergy.playerText.includes(expectedLabel)) {
      errors.push(`Synergy ${synergy.id} with trigger ${synergy.trigger} must include ${expectedLabel}.`);
    }
  }

  return errors;
}
