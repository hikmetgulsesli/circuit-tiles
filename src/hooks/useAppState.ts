import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadBestScore, persistBestScore } from '../utils/storage';
import type { AppActions, AppState, CircuitTile, RuntimeBridge, TileEdge } from '../types/domain';
import { TILE_DIRECTIONS } from '../types/domain';

declare global {
  interface Window {
    app?: RuntimeBridge;
  }

  var app: RuntimeBridge | undefined;
}

const BOARD_SIZE = 4;
const START_TIME = 90;

const oppositeEdge: Record<TileEdge, TileEdge> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
};

const edgeOffsets: Record<TileEdge, { row: number; col: number }> = {
  top: { row: -1, col: 0 },
  right: { row: 0, col: 1 },
  bottom: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
};

function rotateEdge(edge: TileEdge, rotation: number): TileEdge {
  const index = TILE_DIRECTIONS.indexOf(edge);
  return TILE_DIRECTIONS[(index + rotation) % TILE_DIRECTIONS.length];
}

function getRotatedEdges(tile: CircuitTile): TileEdge[] {
  return tile.edges.map((edge) => rotateEdge(edge, tile.rotation));
}

function createBoard(level: number): CircuitTile[] {
  const layouts: TileEdge[][] = [
    ['right', 'bottom'],
    ['left', 'right'],
    ['left', 'bottom'],
    ['bottom'],
    ['top', 'bottom'],
    ['right', 'bottom'],
    ['left', 'top', 'right'],
    ['left', 'bottom'],
    ['top', 'right'],
    ['left', 'top', 'bottom'],
    ['right', 'bottom'],
    ['left', 'top'],
    ['right'],
    ['left', 'right'],
    ['left', 'top', 'right'],
    ['left', 'top'],
  ];

  return layouts.map((edges, index) => {
    const row = Math.floor(index / BOARD_SIZE);
    const col = index % BOARD_SIZE;
    return {
      id: `${row}-${col}`,
      row,
      col,
      rotation: (index + level) % TILE_DIRECTIONS.length,
      powered: false,
      source: index === 0,
      goal: index === layouts.length - 1,
      edges,
    };
  });
}

function updatePower(board: CircuitTile[]): { board: CircuitTile[]; complete: boolean } {
  const byPosition = new Map(board.map((tile) => [`${tile.row}-${tile.col}`, tile]));
  const poweredIds = new Set<string>();
  const queue = board.filter((tile) => tile.source);

  while (queue.length > 0) {
    const tile = queue.shift();
    if (!tile || poweredIds.has(tile.id)) {
      continue;
    }

    poweredIds.add(tile.id);
    for (const edge of getRotatedEdges(tile)) {
      const offset = edgeOffsets[edge];
      const neighbor = byPosition.get(`${tile.row + offset.row}-${tile.col + offset.col}`);
      if (neighbor && getRotatedEdges(neighbor).includes(oppositeEdge[edge])) {
        queue.push(neighbor);
      }
    }
  }

  const poweredBoard = board.map((tile) => ({ ...tile, powered: poweredIds.has(tile.id) }));
  return {
    board: poweredBoard,
    complete: poweredBoard.some((tile) => tile.goal && tile.powered),
  };
}

function createInitialState(): AppState {
  const bestScore = loadBestScore();
  const { board, complete } = updatePower(createBoard(1));

  return {
    screen: 'menu',
    board,
    boardSize: BOARD_SIZE,
    stats: {
      score: 0,
      level: 1,
      moves: 0,
      timeLeft: START_TIME,
      bestScore,
    },
    isPaused: false,
    isComplete: complete,
    selectedTileId: '0-0',
    lastAction: 'Ready',
  };
}

export function useAppState(): RuntimeBridge {
  const [state, setState] = useState<AppState>(() => createInitialState());

  useEffect(() => {
    if (state.screen !== 'playing' || state.isPaused || state.isComplete) {
      return;
    }

    const timer = window.setInterval(() => {
      setState((current) => {
        if (current.screen !== 'playing' || current.isPaused || current.isComplete) {
          return current;
        }

        const timeLeft = Math.max(0, current.stats.timeLeft - 1);
        return {
          ...current,
          screen: timeLeft === 0 ? 'gameOver' : current.screen,
          stats: { ...current.stats, timeLeft },
          lastAction: timeLeft === 0 ? 'Time expired' : current.lastAction,
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [state.screen, state.isPaused, state.isComplete]);

  const startGame = useCallback(() => {
    setState((current) => {
      const { board, complete } = updatePower(createBoard(current.stats.level));
      return {
        ...current,
        screen: 'playing',
        board,
        isPaused: false,
        isComplete: complete,
        selectedTileId: '0-0',
        stats: {
          ...current.stats,
          score: 0,
          moves: 0,
          timeLeft: START_TIME,
        },
        lastAction: 'Game started',
      };
    });
  }, []);

  const pauseGame = useCallback(() => {
    setState((current) => {
      if (current.screen !== 'playing') {
        return current;
      }

      return { ...current, screen: 'paused', isPaused: true, lastAction: 'Paused' };
    });
  }, []);

  const resumeGame = useCallback(() => {
    setState((current) => ({ ...current, screen: 'playing', isPaused: false, lastAction: 'Resumed' }));
  }, []);

  const restartGame = useCallback(() => {
    setState((current) => {
      const { board, complete } = updatePower(createBoard(current.stats.level));
      return {
        ...current,
        screen: 'playing',
        board,
        isPaused: false,
        isComplete: complete,
        selectedTileId: '0-0',
        stats: {
          ...current.stats,
          score: 0,
          moves: 0,
          timeLeft: START_TIME,
        },
        lastAction: 'Restarted',
      };
    });
  }, []);

  const returnToMenu = useCallback(() => {
    setState((current) => ({ ...current, screen: 'menu', isPaused: false, lastAction: 'Main menu' }));
  }, []);

  const openHelp = useCallback(() => {
    setState((current) => ({ ...current, screen: 'help', isPaused: true, lastAction: 'Controls opened' }));
  }, []);

  const selectTile = useCallback((tileId: string) => {
    setState((current) => ({ ...current, selectedTileId: tileId, lastAction: `Selected ${tileId}` }));
  }, []);

  const rotateTile = useCallback((tileId: string) => {
    setState((current) => {
      if (current.screen !== 'playing') {
        return current;
      }

      const rotated = current.board.map((tile) =>
        tile.id === tileId ? { ...tile, rotation: (tile.rotation + 1) % TILE_DIRECTIONS.length } : tile,
      );
      const powered = updatePower(rotated);
      const moves = current.stats.moves + 1;
      const score = powered.complete
        ? current.stats.score + Math.max(100, current.stats.timeLeft * 5) + current.stats.level * 250
        : Math.max(0, current.stats.score + 10);
      const bestScore = powered.complete ? persistBestScore({ score, bestScore: current.stats.bestScore }) : current.stats.bestScore;

      return {
        ...current,
        screen: powered.complete ? 'gameOver' : current.screen,
        board: powered.board,
        isComplete: powered.complete,
        selectedTileId: tileId,
        stats: {
          ...current.stats,
          score,
          moves,
          bestScore,
          level: powered.complete ? current.stats.level + 1 : current.stats.level,
        },
        lastAction: powered.complete ? 'Circuit complete' : `Rotated ${tileId}`,
      };
    });
  }, []);

  const actions = useMemo<AppActions>(
    () => ({
      startGame,
      pauseGame,
      resumeGame,
      restartGame,
      returnToMenu,
      openHelp,
      rotateTile,
      selectTile,
    }),
    [openHelp, pauseGame, restartGame, resumeGame, returnToMenu, rotateTile, selectTile, startGame],
  );

  const bridge = useMemo<RuntimeBridge>(
    () => ({
      state,
      actions,
      getState: () => state,
    }),
    [actions, state],
  );

  useEffect(() => {
    window.app = bridge;
    globalThis.app = bridge;

    return () => {
      if (window.app === bridge) {
        delete window.app;
      }

      if (globalThis.app === bridge) {
        globalThis.app = undefined;
      }
    };
  }, [bridge]);

  return bridge;
}
