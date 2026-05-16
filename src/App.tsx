import { useEffect } from 'react';
import { ControlsHelp, GameBoard, GameOver, MainMenu, PauseOverlay } from './screens';
import { AppContext } from './contexts/AppContext';
import { useAppState } from './hooks/useAppState';
import type { CircuitTile } from './types/domain';

function tileLabel(tile: CircuitTile): string {
  const roles = [tile.source ? 'source' : '', tile.goal ? 'goal' : '', tile.powered ? 'powered' : ''].filter(Boolean);
  return `Tile ${tile.row + 1}, ${tile.col + 1}${roles.length ? `, ${roles.join(', ')}` : ''}`;
}

export default function App() {
  const app = useAppState();
  const { state, actions } = app;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const selectedIndex = state.board.findIndex((tile) => tile.id === state.selectedTileId);
      const selected = state.board[selectedIndex];

      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        actions.rotateTile(state.selectedTileId);
      }

      if (event.key.toLowerCase() === 'p') {
        event.preventDefault();
        state.screen === 'paused' ? actions.resumeGame() : actions.pauseGame();
      }

      if (!selected) {
        return;
      }

      const movement: Record<string, number> = {
        ArrowUp: -state.boardSize,
        ArrowRight: 1,
        ArrowDown: state.boardSize,
        ArrowLeft: -1,
      };
      const offset = movement[event.key];
      if (offset) {
        event.preventDefault();
        const next = state.board[selectedIndex + offset];
        const isHorizontalMove = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
        const remainsInRow = !isHorizontalMove || next?.row === selected.row;
        if (next && remainsInRow) {
          actions.selectTile(next.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions, state.board, state.boardSize, state.screen, state.selectedTileId]);

  const visibleScreen = (() => {
    if (state.screen === 'playing') {
      return <GameBoard actions={{ 'pause-1': actions.pauseGame, 'restart-2': actions.restartGame }} />;
    }

    if (state.screen === 'paused') {
      return <PauseOverlay actions={{ 'restart-1': actions.restartGame, 'main-menu-2': actions.returnToMenu }} />;
    }

    if (state.screen === 'gameOver') {
      return <GameOver actions={{ 'restart-1': actions.restartGame, 'main-menu-2': actions.returnToMenu }} />;
    }

    if (state.screen === 'help') {
      return (
        <ControlsHelp
          actions={{
            'start-game-1': actions.startGame,
            'resume-2': actions.resumeGame,
            'open-settings-3': actions.openHelp,
          }}
        />
      );
    }

    return (
      <MainMenu
        actions={{
          'start-game-1': actions.startGame,
          'resume-2': actions.resumeGame,
          'open-settings-3': actions.openHelp,
        }}
      />
    );
  })();

  return (
    <AppContext.Provider value={app}>
      <div data-setfarm-root="circuit-tiles" className="min-h-screen bg-slate-950 text-white">
        <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="overflow-hidden rounded-lg border border-cyan-300/20 bg-slate-900 shadow-2xl shadow-cyan-950/30">
              {visibleScreen}
            </div>

            <aside className="rounded-lg border border-white/10 bg-slate-900/90 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Circuit Tiles</p>
                  <h1 className="mt-1 text-3xl font-bold">Power the grid</h1>
                </div>
                <span className="rounded-full bg-cyan-300 px-3 py-1 text-sm font-bold text-slate-950">L{state.stats.level}</span>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-white/10 p-3">
                  <dt className="text-slate-300">Score</dt>
                  <dd className="text-2xl font-bold">{state.stats.score}</dd>
                </div>
                <div className="rounded-md bg-white/10 p-3">
                  <dt className="text-slate-300">Best</dt>
                  <dd className="text-2xl font-bold">{state.stats.bestScore}</dd>
                </div>
                <div className="rounded-md bg-white/10 p-3">
                  <dt className="text-slate-300">Moves</dt>
                  <dd className="text-2xl font-bold">{state.stats.moves}</dd>
                </div>
                <div className="rounded-md bg-white/10 p-3">
                  <dt className="text-slate-300">Timer</dt>
                  <dd className="text-2xl font-bold">{state.stats.timeLeft}s</dd>
                </div>
              </dl>

              <p className="mt-4 rounded-md border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-50">{state.lastAction}</p>

              <div
                className="mt-6 grid gap-2"
                style={{ gridTemplateColumns: `repeat(${state.boardSize}, minmax(0, 1fr))` }}
                aria-label="Circuit tile board"
              >
                {state.board.map((tile) => (
                  <button
                    key={tile.id}
                    type="button"
                    aria-label={tileLabel(tile)}
                    aria-pressed={tile.id === state.selectedTileId}
                    onClick={() => actions.rotateTile(tile.id)}
                    onFocus={() => actions.selectTile(tile.id)}
                    className={[
                      'aspect-square rounded-md border text-sm font-bold transition',
                      tile.powered ? 'border-cyan-200 bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/30' : 'border-white/10 bg-slate-800 text-slate-200',
                      tile.id === state.selectedTileId ? 'ring-2 ring-amber-300 ring-offset-2 ring-offset-slate-900' : '',
                    ].join(' ')}
                  >
                    <span className="block" style={{ transform: `rotate(${tile.rotation * 90}deg)` }}>
                      {tile.source ? 'S' : tile.goal ? 'G' : 'T'}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button type="button" onClick={actions.startGame} className="rounded-md bg-cyan-300 px-4 py-3 font-bold text-slate-950">
                  Start
                </button>
                <button type="button" onClick={actions.pauseGame} className="rounded-md bg-white/10 px-4 py-3 font-bold text-white">
                  Pause
                </button>
                <button type="button" onClick={actions.restartGame} className="rounded-md bg-white/10 px-4 py-3 font-bold text-white">
                  Restart
                </button>
                <button type="button" onClick={actions.openHelp} className="rounded-md bg-white/10 px-4 py-3 font-bold text-white">
                  Controls
                </button>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </AppContext.Provider>
  );
}
