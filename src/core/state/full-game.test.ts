import { getCardDefinition } from '../../data/cards';
import type { GameSession } from './game-state';
import { continueAfterCombat, createNewGame, resolveCurrentCombat } from './game-state';

describe('full deterministic game', () => {
  it('replays the same scripted full run with the same seed', () => {
    const first = playScriptedRun('full-game-seed');
    const second = playScriptedRun('full-game-seed');

    expect(first).toEqual(second);
    expect(first.finalPhase).toBe('Victory');
    expect(first.rounds).toHaveLength(6);
  });
});

interface ScriptedRunSummary {
  finalPhase: string;
  finalHealth: number;
  rounds: Array<{
    round: number;
    outcome: string;
    eventTypes: string[];
    remainingPlayerCards: string[];
    remainingEnemyCards: string[];
  }>;
}

function playScriptedRun(seed: string): ScriptedRunSummary {
  let session = createNewGame(seed);
  const rounds: ScriptedRunSummary['rounds'] = [];

  while (session.state.phase === 'ShopPhase') {
    session = withScriptedBoard(session);
    session = resolveCurrentCombat(session);

    const combat = session.state.lastCombat;
    if (!combat) {
      throw new Error('Expected combat result after resolving combat.');
    }

    rounds.push({
      round: session.state.round,
      outcome: combat.outcome,
      eventTypes: combat.events.map((event) => event.type),
      remainingPlayerCards: combat.remainingPlayerCards.map((card) => card.definitionId),
      remainingEnemyCards: combat.remainingEnemyCards.map((card) => card.definitionId),
    });

    if (session.state.phase === 'RewardPhase') {
      session = continueAfterCombat(session);
    }
  }

  return {
    finalPhase: session.state.phase,
    finalHealth: session.state.player.health,
    rounds,
  };
}

function withScriptedBoard(session: GameSession): GameSession {
  const board = Array.from({ length: 7 }, (_, index) =>
    session.cardFactory.create(getCardDefinition('card_undead_revenant'), {
      instanceId: `scripted_r${session.state.round}_${index}`,
      upgraded: true,
    }),
  );

  return {
    ...session,
    state: {
      ...session.state,
      player: {
        ...session.state.player,
        board,
      },
    },
  };
}
