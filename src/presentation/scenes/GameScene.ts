import Phaser from 'phaser';
import { balanceConfig } from '../../data/balance';
import { getCardDefinition } from '../../data/cards';
import { getEnemyForRound } from '../../data/enemies';
import { getCurrentTavernUpgradeCost } from '../../core/economy/economy';
import {
  buyCard,
  continueAfterCombat,
  createNewGame,
  freezeShop,
  placeCardOnBoard,
  refreshShop,
  reorderPlayerBoard,
  resolveCurrentCombat,
  sellCard,
  upgradeShop,
  type GameSession,
} from '../../core/state/game-state';
import type { CardClass, CardDefinition, CardInstance, CombatEvent, CombatResult, GamePhase } from '../../core/types';

const WIDTH = 1280;
const HEIGHT = 720;
const MAIN_WIDTH = 920;
const PANEL_X = 944;
const CARD_SIZE = 108;
const CARD_GAP = 12;
const BOARD_X = 36;
const SHOP_Y = 134;
const BOARD_Y = 374;
const HAND_Y = 552;
const BOARD_SLOT_COUNT = 7;
const BOARD_SLOT_STEP = CARD_SIZE + CARD_GAP;
const SHOP_DROP_ZONE = { x: 28, y: SHOP_Y - 8, width: MAIN_WIDTH - 56, height: CARD_SIZE + 24 };
const HAND_DROP_ZONE = { x: 28, y: HAND_Y - 8, width: MAIN_WIDTH - 56, height: CARD_SIZE + 24 };
const BOARD_DROP_ZONE = { x: 28, y: BOARD_Y - 8, width: MAIN_WIDTH - 56, height: CARD_SIZE + 24 };

type DragOrigin =
  | { type: 'shop'; slotId: string }
  | { type: 'hand'; instanceId: string }
  | { type: 'board'; instanceId: string; index: number };

const phaseLabels: Record<GamePhase, string> = {
  Boot: 'Cargando',
  MainMenu: 'Menu principal',
  ShopPhase: 'Fase de compra',
  CombatPreparation: 'Preparacion de combate',
  CombatPhase: 'Combate',
  CombatResolution: 'Resolucion de combate',
  RewardPhase: 'Resultado de ronda',
  GameOver: 'Derrota',
  Victory: 'Victoria',
};

const classBorderColors: Record<CardClass | 'neutral', number> = {
  neutral: 0x94a3b8,
  beast: 0x22c55e,
  mech: 0xeab308,
  arcane: 0x3b82f6,
  undead: 0x334155,
  elemental: 0xef4444,
};

export class GameScene extends Phaser.Scene {
  private session!: GameSession;
  private nodes: Phaser.GameObjects.GameObject[] = [];
  private statusText = 'Arrastra cartas entre tienda, mano y tablero.';
  private combatStepIndex = 0;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.session = createNewGame('mvp-seed');
    this.render();
  }

  private render(): void {
    this.clearNodes();
    this.cameras.main.setBackgroundColor('#111827');
    this.addNode(this.add.rectangle(0, 0, MAIN_WIDTH, HEIGHT, 0x111827).setOrigin(0));
    this.addNode(this.add.rectangle(PANEL_X - 18, 0, WIDTH - PANEL_X + 18, HEIGHT, 0x0f172a).setOrigin(0));

    this.renderHud();
    this.renderShop();
    this.renderBoardSlots();
    this.renderHand();
    this.renderEnemyPreview();
    this.renderResult();
    this.renderControls();
  }

  private renderHud(): void {
    const { player, round, phase } = this.session.state;
    this.addNode(
      this.add
        .text(MAIN_WIDTH / 2, 18, phaseLabels[phase], {
          fontFamily: 'Arial',
          fontSize: '30px',
          color: '#f8fafc',
          fontStyle: 'bold',
        })
        .setOrigin(0.5, 0),
    );
    this.addNode(
      this.add
        .text(MAIN_WIDTH / 2, 54, `Ronda ${round}`, {
          fontFamily: 'Arial',
          fontSize: '17px',
          color: '#cbd5e1',
        })
        .setOrigin(0.5, 0),
    );
    this.addNode(
      this.add.text(36, 682, `Vida ${player.health}/${balanceConfig.progression.playerStartingHealth}`, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#fecaca',
        fontStyle: 'bold',
      }),
    );
    this.addNode(this.add.circle(22, 692, 8, 0xef4444));
    this.addNode(
      this.add
        .text(MAIN_WIDTH / 2, 682, `Tier tienda ${player.shopTier}`, {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#f8fafc',
          fontStyle: 'bold',
        })
        .setOrigin(0.5, 0),
    );
    this.renderGold();
    this.addNode(
      this.add.text(36, 88, this.statusText, {
        fontFamily: 'Arial',
        fontSize: '15px',
        color: '#93c5fd',
        wordWrap: { width: 500 },
      }),
    );
  }

  private renderGold(): void {
    const gold = this.session.state.player.gold;
    const startX = MAIN_WIDTH - 270;
    this.addNode(
      this.add.text(startX, 682, `Oro ${gold}`, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#fde68a',
        fontStyle: 'bold',
      }),
    );

    for (let index = 0; index < 10; index += 1) {
      this.addNode(this.add.circle(startX + 74 + index * 18, 692, 6, index < Math.min(gold, 10) ? 0xfacc15 : 0x475569));
    }
  }

  private renderControls(): void {
    if (this.session.state.phase !== 'ShopPhase') {
      return;
    }

    const y = 94;
    const upgradeLabel = this.getUpgradeLabel();
    this.addButton(516, y, 86, 28, 'Refrescar', () => {
      this.runAction(() => {
        this.session = refreshShop(this.session);
        this.statusText = 'Tienda refrescada.';
      });
    });
    this.addButton(612, y, 86, 28, this.session.state.shop.isFrozen ? 'Descong.' : 'Congelar', () => {
      this.runAction(() => {
        const nextFrozen = !this.session.state.shop.isFrozen;
        this.session = freezeShop(this.session, nextFrozen);
        this.statusText = nextFrozen ? 'Tienda congelada.' : 'Tienda descongelada.';
      });
    });
    this.addButton(708, y, 92, 28, upgradeLabel, () => {
      this.runAction(() => {
        this.session = upgradeShop(this.session);
        this.statusText = 'Nivel de tienda aumentado.';
      });
    });
    this.addButton(810, y, 82, 28, 'Finalizar', () => {
      this.runAction(() => {
        this.session = resolveCurrentCombat(this.session);
        this.combatStepIndex = 0;
        this.statusText = 'Combate resuelto.';
      });
    });
  }

  private renderShop(): void {
    this.addSectionTitle(36, SHOP_Y - 32, 'Tienda');
    this.addDropFrame(SHOP_DROP_ZONE, this.session.state.shop.isFrozen ? 0x1e3a5f : 0x172033);
    this.session.state.shop.slots.forEach((slot, index) => {
      const x = BOARD_X + index * BOARD_SLOT_STEP;
      const card = slot.card;
      if (!card) {
        this.addEmptySlot(x, SHOP_Y, 'Vacio');
        return;
      }

      this.addCardBox({
        x,
        y: SHOP_Y,
        card,
        frozen: this.session.state.shop.isFrozen || slot.isFrozen,
        origin: { type: 'shop', slotId: slot.slotId },
      });
    });
  }

  private renderBoardSlots(): void {
    this.addSectionTitle(36, BOARD_Y - 32, 'Tablero');
    this.addDropFrame(BOARD_DROP_ZONE, 0x172033);

    for (let index = 0; index < BOARD_SLOT_COUNT; index += 1) {
      const x = BOARD_X + index * BOARD_SLOT_STEP;
      this.addEmptySlot(x, BOARD_Y, `${index + 1}`);
    }

    this.session.state.player.board.forEach((card, index) => {
      this.addCardBox({
        x: BOARD_X + index * BOARD_SLOT_STEP,
        y: BOARD_Y,
        card,
        origin: { type: 'board', instanceId: card.instanceId, index },
      });
    });
  }

  private renderHand(): void {
    this.addSectionTitle(36, HAND_Y - 32, 'Mano');
    this.addDropFrame(HAND_DROP_ZONE, 0x172033);
    this.session.state.player.hand.forEach((card, index) => {
      const x = BOARD_X + (index % 7) * BOARD_SLOT_STEP;
      const y = HAND_Y + Math.floor(index / 7) * (CARD_SIZE + 8);
      this.addCardBox({
        x,
        y,
        card,
        origin: { type: 'hand', instanceId: card.instanceId },
      });
    });
  }

  private renderEnemyPreview(): void {
    if (this.session.state.lastCombat) {
      return;
    }

    const enemy = getEnemyForRound(this.session.state.round);
    this.addNode(
      this.add.text(PANEL_X, 28, `Enemigo: ${enemy.name}`, {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#f8fafc',
        fontStyle: 'bold',
      }),
    );
    this.addNode(
      this.add.text(PANEL_X, 58, `Dificultad: ${enemy.difficulty}`, {
        fontFamily: 'Arial',
        fontSize: '15px',
        color: '#cbd5e1',
      }),
    );

    enemy.cards.slice(0, 4).forEach((entry, index) => {
      const definition = getCardDefinition(entry.cardId);
      this.addDefinitionCardBox(PANEL_X + (index % 2) * 138, 98 + Math.floor(index / 2) * 138, definition, entry.upgraded);
    });
  }

  private renderResult(): void {
    const combat = this.session.state.lastCombat;

    if (!combat) {
      return;
    }

    const outcomeLabel = combat.outcome === 'win' ? 'Victoria' : combat.outcome === 'loss' ? 'Derrota' : 'Empate';
    const visibleEvents = combat.events.slice(0, this.combatStepIndex + 1);
    const currentEvent = combat.events[this.combatStepIndex];
    const currentPair = this.getCurrentCombatPair(currentEvent, combat);

    this.addNode(
      this.add.text(PANEL_X, 28, `Resultado: ${outcomeLabel}`, {
        fontFamily: 'Arial',
        fontSize: '23px',
        color: '#f8fafc',
        fontStyle: 'bold',
      }),
    );
    this.addNode(
      this.add.text(PANEL_X, 62, `Paso ${this.combatStepIndex + 1}/${combat.events.length}`, {
        fontFamily: 'Arial',
        fontSize: '15px',
        color: '#cbd5e1',
      }),
    );
    this.addNode(
      this.add.text(PANEL_X, 88, currentEvent ? this.formatCombatEvent(currentEvent, combat) : 'Sin eventos.', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#93c5fd',
        wordWrap: { width: 300 },
      }),
    );

    if (currentPair.attacker) {
      this.addNode(this.add.text(PANEL_X, 150, 'Atacante', cardLabelStyle()));
      this.addCardBox({ x: PANEL_X, y: 176, card: currentPair.attacker, size: 126 });
    }
    if (currentPair.target) {
      this.addNode(this.add.text(PANEL_X + 150, 150, 'Objetivo', cardLabelStyle()));
      this.addCardBox({ x: PANEL_X + 150, y: 176, card: currentPair.target, size: 126 });
    }

    this.renderCombatSurvivors(combat);
    this.renderCombatLog(visibleEvents, combat);

    this.addButton(PANEL_X, 654, 88, 30, 'Anterior', () => {
      this.combatStepIndex = Math.max(0, this.combatStepIndex - 1);
      this.render();
    });
    this.addButton(PANEL_X + 98, 654, 88, 30, 'Siguiente', () => {
      this.combatStepIndex = Math.min(combat.events.length - 1, this.combatStepIndex + 1);
      this.render();
    });

    if (this.session.state.phase === 'RewardPhase') {
      this.addButton(PANEL_X + 196, 654, 88, 30, 'Continuar', () => {
        this.runAction(() => {
          this.session = continueAfterCombat(this.session);
          this.combatStepIndex = 0;
          this.statusText = 'Nueva ronda iniciada.';
        });
      });
    }
  }

  private renderCombatSurvivors(combat: CombatResult): void {
    this.addNode(this.add.text(PANEL_X, 320, 'Supervivientes', cardLabelStyle()));
    this.addNode(
      this.add.text(
        PANEL_X,
        348,
        `Jugador: ${this.formatCardList(combat.remainingPlayerCards)}\nEnemigo: ${this.formatCardList(
          combat.remainingEnemyCards,
        )}`,
        {
          fontFamily: 'Arial',
          fontSize: '13px',
          color: '#cbd5e1',
          wordWrap: { width: 300 },
        },
      ),
    );
  }

  private renderCombatLog(events: CombatEvent[], combat: CombatResult): void {
    this.addNode(this.add.text(PANEL_X, 420, 'Log de combate', cardLabelStyle()));
    this.addNode(
      this.add.text(
        PANEL_X,
        448,
        events
          .slice(-8)
          .map((event, index) => `${Math.max(1, events.length - 7) + index}. ${this.formatCombatEvent(event, combat)}`)
          .join('\n'),
        {
          fontFamily: 'Arial',
          fontSize: '12px',
          color: '#dbeafe',
          lineSpacing: 4,
          wordWrap: { width: 300 },
        },
      ),
    );
  }

  private addCardBox(input: {
    x: number;
    y: number;
    card: CardInstance;
    frozen?: boolean;
    origin?: DragOrigin;
    size?: number;
  }): void {
    const definition = getCardDefinition(input.card.definitionId);
    this.addDefinitionCardBox(input.x, input.y, definition, input.card.isUpgraded, input.card, input.frozen, input.origin, input.size);
  }

  private addDefinitionCardBox(
    x: number,
    y: number,
    definition: CardDefinition,
    upgraded = false,
    instance?: CardInstance,
    frozen = false,
    origin?: DragOrigin,
    size = CARD_SIZE,
  ): void {
    const container = this.add.container(x + size / 2, y + size / 2);
    const fill = this.getCardFill(upgraded, frozen);
    const border = this.getCardBorder(definition);
    const rect = this.add
      .rectangle(-size / 2, -size / 2, size, size, fill)
      .setOrigin(0)
      .setStrokeStyle(4, border);
    const text = this.add.text(-size / 2 + 8, -size / 2 + 7, this.getCardText(definition, instance, upgraded), {
      fontFamily: 'Arial',
      fontSize: `${size >= CARD_SIZE ? 12 : 11}px`,
      color: '#f8fafc',
      lineSpacing: 2,
      wordWrap: { width: size - 16 },
    });

    container.add([rect, text]);
    container.setSize(size, size);
    this.addNode(container);

    if (!origin) {
      return;
    }

    container.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(-size / 2, -size / 2, size, size),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    this.input.setDraggable(container);
    container.setData('origin', origin);
    container.setData('startX', x + size / 2);
    container.setData('startY', y + size / 2);
    container.on('dragstart', () => container.setDepth(20));
    container.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      container.setPosition(dragX, dragY);
    });
    container.on('dragend', (pointer: Phaser.Input.Pointer) => {
      this.handleDrop(origin, pointer.x, pointer.y, container);
    });
  }

  private handleDrop(origin: DragOrigin, x: number, y: number, container: Phaser.GameObjects.Container): void {
    if (origin.type === 'shop' && isInside(x, y, HAND_DROP_ZONE)) {
      this.runAction(() => {
        this.session = buyCard(this.session, origin.slotId);
        this.statusText = 'Carta comprada.';
      });
      return;
    }

    if (origin.type === 'hand' && isInside(x, y, BOARD_DROP_ZONE)) {
      this.runAction(() => {
        this.session = placeCardOnBoard(this.session, origin.instanceId, this.getBoardDropIndex(x));
        this.statusText = 'Carta colocada en tablero.';
      });
      return;
    }

    if (origin.type === 'board' && isInside(x, y, SHOP_DROP_ZONE)) {
      this.runAction(() => {
        this.session = sellCard(this.session, origin.instanceId);
        this.statusText = 'Carta vendida.';
      });
      return;
    }

    if (origin.type === 'board' && isInside(x, y, BOARD_DROP_ZONE)) {
      this.runAction(() => {
        this.session = reorderPlayerBoard(this.session, origin.index, this.getBoardDropIndex(x));
        this.statusText = 'Tablero reordenado.';
      });
      return;
    }

    container.setPosition(container.getData('startX') as number, container.getData('startY') as number);
    container.setDepth(0);
    this.statusText = 'Movimiento invalido.';
    this.render();
  }

  private getBoardDropIndex(x: number): number {
    const rawIndex = Math.floor((x - BOARD_X + BOARD_SLOT_STEP / 2) / BOARD_SLOT_STEP);
    return Phaser.Math.Clamp(rawIndex, 0, this.session.state.player.board.length);
  }

  private addEmptySlot(x: number, y: number, label: string): void {
    this.addNode(
      this.add
        .rectangle(x, y, CARD_SIZE, CARD_SIZE, 0x172033)
        .setOrigin(0)
        .setStrokeStyle(2, 0x334155),
    );
    this.addNode(
      this.add
        .text(x + CARD_SIZE / 2, y + CARD_SIZE / 2, label, {
          fontFamily: 'Arial',
          fontSize: '13px',
          color: '#64748b',
        })
        .setOrigin(0.5),
    );
  }

  private addDropFrame(zone: typeof SHOP_DROP_ZONE, fill: number): void {
    this.addNode(this.add.rectangle(zone.x, zone.y, zone.width, zone.height, fill, 0.28).setOrigin(0));
  }

  private addButton(x: number, y: number, width: number, height: number, label: string, onClick: () => void): void {
    const rectangle = this.add
      .rectangle(x, y, width, height, 0x2563eb)
      .setStrokeStyle(1, 0x60a5fa)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true });
    rectangle.on('pointerdown', onClick);
    this.addNode(rectangle);
    this.addNode(
      this.add
        .text(x + width / 2, y + height / 2, label, {
          fontFamily: 'Arial',
          fontSize: '12px',
          color: '#ffffff',
        })
        .setOrigin(0.5),
    );
  }

  private addSectionTitle(x: number, y: number, label: string): void {
    this.addNode(
      this.add.text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: '21px',
        color: '#f8fafc',
        fontStyle: 'bold',
      }),
    );
  }

  private getCardText(
    definition: CardDefinition,
    instance?: CardInstance,
    upgraded = instance?.isUpgraded ?? false,
  ): string {
    const attack = instance?.attack ?? definition.attack * (upgraded ? 2 : 1);
    const health = instance?.health ?? definition.health * (upgraded ? 2 : 1);
    const tier = upgraded ? `${definition.tier} F` : `${definition.tier}`;
    return `[${tier}]\n${definition.name}\n${definition.playerText}\n${attack} ATQ ${health} VIDA`;
  }

  private getCardFill(upgraded: boolean, frozen: boolean): number {
    if (upgraded && frozen) {
      return 0x6a5f2a;
    }

    if (upgraded) {
      return 0x8a6f1f;
    }

    if (frozen) {
      return 0x234d70;
    }

    return 0x263244;
  }

  private getCardBorder(definition: CardDefinition): number {
    const primaryClass = definition.classes[0] ?? 'neutral';
    return classBorderColors[primaryClass];
  }

  private getUpgradeLabel(): string {
    try {
      return `Subir ${getCurrentTavernUpgradeCost(this.session.state.player)}`;
    } catch {
      return 'Max tier';
    }
  }

  private getCurrentCombatPair(
    event: CombatEvent | undefined,
    combat: CombatResult,
  ): { attacker?: CardInstance; target?: CardInstance } {
    if (!event) {
      return {};
    }

    if (event.type === 'attack') {
      return {
        attacker: this.getCombatCard(event.attackerId, combat),
        target: this.getCombatCard(event.targetId, combat),
      };
    }

    if (event.type === 'damage') {
      return {
        attacker: this.getCombatCard(event.sourceId, combat),
        target: this.getCombatCard(event.targetId, combat),
      };
    }

    return {};
  }

  private formatCombatEvent(event: CombatEvent, combat: CombatResult): string {
    switch (event.type) {
      case 'attack':
        return `${this.getCombatCardName(event.attackerId, combat)} ataca a ${this.getCombatCardName(
          event.targetId,
          combat,
        )}.`;
      case 'damage':
        return `${this.getCombatCardName(event.sourceId, combat)} hace ${event.amount} de dano a ${this.getCombatCardName(
          event.targetId,
          combat,
        )}.`;
      case 'death':
        return `${this.getCombatCardName(event.cardId, combat)} muere.`;
      case 'effect':
        return event.message;
      case 'result':
        return `Resultado final: ${event.outcome}.`;
    }
  }

  private getCombatCard(instanceId: string, combat: CombatResult): CardInstance | undefined {
    return [
      ...combat.initialPlayerCards,
      ...combat.initialEnemyCards,
      ...combat.remainingPlayerCards,
      ...combat.remainingEnemyCards,
    ].find((candidate) => candidate.instanceId === instanceId);
  }

  private getCombatCardName(instanceId: string, combat: CombatResult): string {
    const card = this.getCombatCard(instanceId, combat);
    return card ? getCardDefinition(card.definitionId).name : instanceId;
  }

  private formatCardList(cards: CardInstance[]): string {
    if (cards.length === 0) {
      return 'ninguno';
    }

    return cards.map((card) => `${getCardDefinition(card.definitionId).name} ${card.attack}/${card.health}`).join(', ');
  }

  private runAction(action: () => void): void {
    try {
      action();
    } catch (error) {
      this.statusText = error instanceof Error ? error.message : 'Accion invalida.';
    }

    this.render();
  }

  private clearNodes(): void {
    for (const node of this.nodes) {
      node.destroy();
    }
    this.nodes = [];
  }

  private addNode<T extends Phaser.GameObjects.GameObject>(node: T): T {
    this.nodes.push(node);
    return node;
  }
}

function isInside(x: number, y: number, zone: { x: number; y: number; width: number; height: number }): boolean {
  return x >= zone.x && x <= zone.x + zone.width && y >= zone.y && y <= zone.y + zone.height;
}

function cardLabelStyle(): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: 'Arial',
    fontSize: '16px',
    color: '#f8fafc',
    fontStyle: 'bold',
  };
}

export const gameSceneConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: '#111827',
  scene: [GameScene],
};
