export type ScreenName = 'menu' | 'playing' | 'paused' | 'gameOver' | 'help';

export type TileEdge = 'top' | 'right' | 'bottom' | 'left';

export interface CircuitTile {
  id: string;
  row: number;
  col: number;
  rotation: number;
  powered: boolean;
  source: boolean;
  goal: boolean;
  edges: TileEdge[];
}

export interface GameStats {
  score: number;
  level: number;
  moves: number;
  timeLeft: number;
  bestScore: number;
}

export interface AppState {
  screen: ScreenName;
  board: CircuitTile[];
  boardSize: number;
  stats: GameStats;
  isPaused: boolean;
  isComplete: boolean;
  selectedTileId: string;
  lastAction: string;
}

export interface AppActions {
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void;
  returnToMenu: () => void;
  openHelp: () => void;
  rotateTile: (tileId: string) => void;
  selectTile: (tileId: string) => void;
}

export interface RuntimeBridge {
  state: AppState;
  actions: AppActions;
  getState: () => AppState;
}

export const TILE_DIRECTIONS: TileEdge[] = ['top', 'right', 'bottom', 'left'];
