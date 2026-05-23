import Phaser from 'phaser';
import { getCardDefinition } from '../../data/cards';
import { getEnemyForRound } from '../../data/enemies';
import {
  buyCard,
  continueAfterCombat,
  createNewGame,
  freezeShop,
  placeCardOnBoard,
  refreshShop,
  resolveCurrentCombat,
  sellCard,
  upgradeShop,
  type GameSession,
} from '../../core/state/game-state';
import type { CardInstance, CombatEvent, CombatResult } from '../../core/types';

const WIDTH = 1280;
const HEIGHT = 720;

export class GameScene extends Phaser.Scene {
  private session!: GameSession;
  private nodes: Phaser.GameObjects.GameObject[] = [];
  private statusText = 'Compra cartas, colocalas en el tablero y finaliza la ronda.';
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

    this.addNode(
      this.add
        .text(32, 24, 'Autochess Battler Card Game', {
          fontFamily: 'Arial',
          fontSize: '30px',
          color: '#f8fafc',
          fontStyle: 'bold',
        })
        .setOrigin(0),
    );

    this.renderHud();
    this.renderShop();
    this.renderHand();
    this.renderBoard();
    this.renderEnemyPreview();
    this.renderResult();
    this.renderControls();
  }

  private renderHud(): void {
    const { player, round, phase } = this.session.state;
    this.addNode(
      this.add.text(
        32,
        76,
        `Fase: ${phase}   Ronda: ${round}   Vida: ${player.health}   Oro: ${player.gold}   Tienda: ${player.shopTier}`,
        {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#cbd5e1',
        },
      ),
    );
    this.addNode(
      this.add.text(32, 104, this.statusText, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#93c5fd',
      }),
    );
  }

  private renderShop(): void {
    this.addSectionTitle(32, 150, 'Tienda');
    this.session.state.shop.slots.forEach((slot, index) => {
      const x = 32 + index * 190;
      const y = 188;
      const card = slot.card;
      this.addCardBox(x, y, card, card ? 'Comprar (3)' : 'Vacio', () => {
        if (!card) {
          return;
        }
        this.runAction(() => {
          this.session = buyCard(this.session, slot.slotId);
          this.statusText = `Comprada: ${getCardDefinition(card.definitionId).name}`;
        });
      });
    });
  }

  private renderHand(): void {
    this.addSectionTitle(32, 360, 'Mano');
    this.session.state.player.hand.forEach((card, index) => {
      const x = 32 + index * 128;
      this.addCardBox(x, 398, card, 'Al tablero', () => {
        this.runAction(() => {
          this.session = placeCardOnBoard(this.session, card.instanceId);
          this.statusText = `Colocada: ${getCardDefinition(card.definitionId).name}`;
        });
      }, 112);
    });
  }

  private renderBoard(): void {
    this.addSectionTitle(32, 540, 'Tablero');
    this.session.state.player.board.forEach((card, index) => {
      const x = 32 + index * 128;
      this.addCardBox(x, 578, card, 'Vender (+1)', () => {
        this.runAction(() => {
          this.session = sellCard(this.session, card.instanceId);
          this.statusText = `Vendida: ${getCardDefinition(card.definitionId).name}`;
        });
      }, 112);
    });
  }

  private renderEnemyPreview(): void {
    if (this.session.state.lastCombat) {
      return;
    }

    const enemy = getEnemyForRound(this.session.state.round);
    this.addNode(
      this.add
        .rectangle(880, 150, 360, 210, 0x172033)
        .setStrokeStyle(1, 0x334155)
        .setOrigin(0),
    );
    this.addNode(
      this.add.text(900, 168, `Enemigo: ${enemy.name}`, {
        fontFamily: 'Arial',
        fontSize: '21px',
        color: '#f8fafc',
        fontStyle: 'bold',
      }),
    );
    this.addNode(
      this.add.text(900, 198, `Dificultad: ${enemy.difficulty}`, {
        fontFamily: 'Arial',
        fontSize: '15px',
        color: '#cbd5e1',
      }),
    );
    this.addNode(
      this.add.text(
        900,
        228,
        enemy.cards
          .map((entry, index) => {
            const definition = getCardDefinition(entry.cardId);
            const upgraded = entry.upgraded ? ' mejorada' : '';
            return `${index + 1}. ${definition.name}${upgraded} (${definition.attack}/${definition.health})`;
          })
          .join('\n'),
        {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#dbeafe',
          lineSpacing: 4,
          wordWrap: { width: 320 },
        },
      ),
    );
  }

  private renderResult(): void {
    const combat = this.session.state.lastCombat;

    if (!combat) {
      return;
    }

    const outcomeLabel = combat.outcome === 'win' ? 'Victoria' : combat.outcome === 'loss' ? 'Derrota' : 'Empate';
    const visibleEvents = combat.events.slice(0, this.combatStepIndex + 1);
    const currentEvent = combat.events[this.combatStepIndex];
    this.addNode(
      this.add
        .rectangle(880, 140, 360, 545, 0x1f2937)
        .setStrokeStyle(1, 0x475569)
        .setOrigin(0),
    );
    this.addNode(
      this.add.text(900, 158, `Resultado: ${outcomeLabel}`, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#f8fafc',
        fontStyle: 'bold',
      }),
    );
    this.addNode(
      this.add.text(900, 196, `Paso ${this.combatStepIndex + 1}/${combat.events.length}`, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#cbd5e1',
      }),
    );
    this.addNode(
      this.add.text(900, 224, currentEvent ? this.formatCombatEvent(currentEvent, combat) : 'Sin eventos.', {
        fontFamily: 'Arial',
        fontSize: '15px',
        color: '#93c5fd',
        wordWrap: { width: 320 },
      }),
    );
    this.renderCombatSurvivors(combat);
    this.renderCombatLog(visibleEvents, combat);

    this.addButton(900, 638, 100, 32, 'Anterior', () => {
      this.combatStepIndex = Math.max(0, this.combatStepIndex - 1);
      this.render();
    });
    this.addButton(1010, 638, 100, 32, 'Siguiente', () => {
      this.combatStepIndex = Math.min(combat.events.length - 1, this.combatStepIndex + 1);
      this.render();
    });

    if (this.session.state.phase === 'RewardPhase') {
      this.addButton(1120, 638, 100, 32, 'Continuar', () => {
        this.runAction(() => {
          this.session = continueAfterCombat(this.session);
          this.combatStepIndex = 0;
          this.statusText = 'Nueva ronda iniciada.';
        });
      });
    }
  }

  private renderControls(): void {
    if (this.session.state.phase !== 'ShopPhase') {
      return;
    }

    const y = 150;
    this.addButton(680, y, 150, 38, 'Refrescar (1)', () => {
      this.runAction(() => {
        this.session = refreshShop(this.session);
        this.statusText = 'Tienda refrescada.';
      });
    });
    this.addButton(680, y + 48, 150, 38, this.session.state.shop.isFrozen ? 'Descongelar' : 'Congelar', () => {
      this.runAction(() => {
        const nextFrozen = !this.session.state.shop.isFrozen;
        this.session = freezeShop(this.session, nextFrozen);
        this.statusText = nextFrozen ? 'Tienda congelada.' : 'Tienda descongelada.';
      });
    });
    this.addButton(680, y + 96, 150, 38, 'Subir tienda', () => {
      this.runAction(() => {
        this.session = upgradeShop(this.session);
        this.statusText = 'Nivel de tienda aumentado.';
      });
    });
    this.addButton(680, y + 144, 150, 38, 'Finalizar', () => {
      this.runAction(() => {
        this.session = resolveCurrentCombat(this.session);
        this.combatStepIndex = 0;
        this.statusText = 'Combate resuelto.';
      });
    });
  }

  private renderCombatSurvivors(combat: CombatResult): void {
    this.addNode(
      this.add.text(900, 282, 'Supervivientes', {
        fontFamily: 'Arial',
        fontSize: '17px',
        color: '#f8fafc',
        fontStyle: 'bold',
      }),
    );
    this.addNode(
      this.add.text(
        900,
        310,
        `Jugador: ${this.formatCardList(combat.remainingPlayerCards)}\nEnemigo: ${this.formatCardList(
          combat.remainingEnemyCards,
        )}`,
        {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#cbd5e1',
          wordWrap: { width: 320 },
        },
      ),
    );
  }

  private renderCombatLog(events: CombatEvent[], combat: CombatResult): void {
    this.addNode(
      this.add.text(900, 370, 'Log de combate', {
        fontFamily: 'Arial',
        fontSize: '17px',
        color: '#f8fafc',
        fontStyle: 'bold',
      }),
    );
    this.addNode(
      this.add.text(
        900,
        398,
        events
          .slice(-9)
          .map((event, index) => `${Math.max(1, events.length - 8) + index}. ${this.formatCombatEvent(event, combat)}`)
          .join('\n'),
        {
          fontFamily: 'Arial',
          fontSize: '13px',
          color: '#dbeafe',
          lineSpacing: 4,
          wordWrap: { width: 320 },
        },
      ),
    );
  }

  private addCardBox(
    x: number,
    y: number,
    card: CardInstance | null,
    actionText: string,
    onClick: () => void,
    width = 170,
  ): void {
    const height = 136;
    const rectangle = this.add
      .rectangle(x, y, width, height, card ? 0x263244 : 0x172033)
      .setStrokeStyle(1, card ? 0x64748b : 0x334155)
      .setOrigin(0)
      .setInteractive({ useHandCursor: Boolean(card) });
    rectangle.on('pointerdown', onClick);
    this.addNode(rectangle);

    const text = card ? this.getCardText(card) : 'Slot vacio';
    this.addNode(
      this.add.text(x + 10, y + 10, text, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#f8fafc',
        wordWrap: { width: width - 20 },
      }),
    );
    this.addNode(
      this.add.text(x + 10, y + height - 28, actionText, {
        fontFamily: 'Arial',
        fontSize: '13px',
        color: card ? '#93c5fd' : '#64748b',
      }),
    );
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
          fontSize: '15px',
          color: '#ffffff',
        })
        .setOrigin(0.5),
    );
  }

  private addSectionTitle(x: number, y: number, label: string): void {
    this.addNode(
      this.add.text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#f8fafc',
        fontStyle: 'bold',
      }),
    );
  }

  private getCardText(card: CardInstance): string {
    const definition = getCardDefinition(card.definitionId);
    const upgraded = card.isUpgraded ? 'Mejorada\n' : '';
    return `${upgraded}${definition.name}\n${card.attack}/${card.health}\n${definition.playerText}`;
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

  private getCombatCardName(instanceId: string, combat: CombatResult): string {
    const card = [...combat.initialPlayerCards, ...combat.initialEnemyCards, ...combat.remainingPlayerCards, ...combat.remainingEnemyCards].find(
      (candidate) => candidate.instanceId === instanceId,
    );

    if (!card) {
      return instanceId;
    }

    return getCardDefinition(card.definitionId).name;
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

export const gameSceneConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: '#111827',
  scene: [GameScene],
};
