import type { GameStats } from '../types/domain';

const BEST_SCORE_KEY = 'circuit-tiles:best-score';

export function loadBestScore(): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  const value = window.localStorage.getItem(BEST_SCORE_KEY);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function persistBestScore(stats: Pick<GameStats, 'score' | 'bestScore'>): number {
  const nextBest = Math.max(stats.score, stats.bestScore);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(BEST_SCORE_KEY, String(nextBest));
  }

  return nextBest;
}
