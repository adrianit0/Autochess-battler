export type GamePhase =
  | 'Boot'
  | 'MainMenu'
  | 'ShopPhase'
  | 'CombatPreparation'
  | 'CombatPhase'
  | 'CombatResolution'
  | 'RewardPhase'
  | 'GameOver'
  | 'Victory';

export type CardClass = 'beast' | 'mech' | 'arcane' | 'undead' | 'elemental';

export type CardZone = 'shop' | 'hand' | 'board' | 'combatBoard' | 'enemyBoard' | 'discard';

export type EffectTrigger =
  | 'passive'
  | 'onBuy'
  | 'onDeath'
  | 'onCombatStart'
  | 'onShopTurnEnd'
  | 'onAttack';

export type EffectTarget =
  | 'self'
  | 'randomEnemy'
  | 'randomAlly'
  | 'lowestHealthAlly'
  | 'allEnemies'
  | 'none';

export type EffectDefinition =
  | TauntEffectDefinition
  | DoubleAttackEffectDefinition
  | StatBuffEffectDefinition
  | RandomDamageEffectDefinition
  | SummonEffectDefinition;

export interface BaseEffectDefinition {
  id: string;
  trigger: EffectTrigger;
  target: EffectTarget;
  description: string;
  upgradedOverride?: EffectDefinition;
}

export interface TauntEffectDefinition extends BaseEffectDefinition {
  type: 'taunt';
  trigger: 'passive';
  target: 'self';
}

export interface DoubleAttackEffectDefinition extends BaseEffectDefinition {
  type: 'doubleAttack';
  trigger: 'passive';
  target: 'self';
}

export interface StatBuffEffectDefinition extends BaseEffectDefinition {
  type: 'statBuff';
  attack: number;
  health: number;
  permanent: boolean;
}

export interface RandomDamageEffectDefinition extends BaseEffectDefinition {
  type: 'randomDamage';
  damage: number;
}

export interface SummonEffectDefinition extends BaseEffectDefinition {
  type: 'summon';
  cardId: string;
  attack?: number;
  health?: number;
}

export interface CardDefinition {
  id: string;
  name: string;
  description: string;
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  attack: number;
  health: number;
  classes: CardClass[];
  effects: EffectDefinition[];
  artKey: string;
  playerText: string;
}

export interface CardInstance {
  instanceId: string;
  definitionId: string;
  attack: number;
  health: number;
  maxHealth: number;
  isUpgraded: boolean;
  temporaryEffects: EffectDefinition[];
  status: CardStatus;
}

export interface CardStatus {
  isDead: boolean;
  hasAttackedThisCycle: boolean;
}

export interface ShopSlot {
  slotId: string;
  card: CardInstance | null;
  isFrozen: boolean;
}

export interface PlayerState {
  health: number;
  gold: number;
  shopTier: 1 | 2 | 3 | 4 | 5 | 6;
  hand: CardInstance[];
  board: CardInstance[];
}

export interface EnemyCardEntry {
  cardId: string;
  upgraded?: boolean;
}

export interface EnemyDefinition {
  id: string;
  name: string;
  round: number;
  cards: EnemyCardEntry[];
  difficulty: 'easy' | 'medium' | 'hard' | 'boss';
  reward?: RewardDefinition;
  description?: string;
}

export interface RewardDefinition {
  gold?: number;
  cardIds?: string[];
}

export interface ShopState {
  slots: ShopSlot[];
  isFrozen: boolean;
}

export interface GameState {
  phase: GamePhase;
  seed: string;
  round: number;
  player: PlayerState;
  shop: ShopState;
  lastCombat?: CombatResult;
}

export type CombatOutcome = 'win' | 'loss' | 'draw';

export interface CombatResult {
  outcome: CombatOutcome;
  events: CombatEvent[];
  initialPlayerCards: CardInstance[];
  initialEnemyCards: CardInstance[];
  remainingPlayerCards: CardInstance[];
  remainingEnemyCards: CardInstance[];
}

export type CombatEvent =
  | CombatAttackEvent
  | CombatDamageEvent
  | CombatDeathEvent
  | CombatEffectEvent
  | CombatResultEvent;

export interface CombatAttackEvent {
  type: 'attack';
  attackerId: string;
  targetId: string;
}

export interface CombatDamageEvent {
  type: 'damage';
  sourceId: string;
  targetId: string;
  amount: number;
}

export interface CombatDeathEvent {
  type: 'death';
  cardId: string;
}

export interface CombatEffectEvent {
  type: 'effect';
  effectId: string;
  sourceId?: string;
  targetId?: string;
  message: string;
}

export interface CombatResultEvent {
  type: 'result';
  outcome: CombatOutcome;
}

export interface SynergyDefinition {
  id: string;
  cardClass: CardClass;
  requiredCount: number;
  trigger: EffectTrigger;
  effect: EffectDefinition;
  playerText: string;
}

export interface BalanceConfig {
  economy: EconomyConfig;
  shop: ShopConfig;
  combat: CombatConfig;
  progression: ProgressionConfig;
}

export interface EconomyConfig {
  buyCost: number;
  sellValue: number;
  refreshCost: number;
  freezeCost: number;
  goldByRound: Record<number, number>;
  maxRoundGold: number;
  tavernUpgradeCosts: Record<number, number>;
}

export interface ShopConfig {
  slotCount: number;
  handLimit: number;
  boardLimit: number;
  maxTier: 6;
}

export interface CombatConfig {
  maxActions: number;
  playerStarts: boolean;
}

export interface ProgressionConfig {
  playerStartingHealth: number;
  finalRound: number;
  lossDamageByRoundBand: Array<{
    fromRound: number;
    toRound?: number;
    damage: number;
  }>;
}
