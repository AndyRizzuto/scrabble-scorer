export interface Player {
  id: 1 | 2;
  name: string;
  score: number;
}

export interface BonusMultipliers {
  letterMultiplier: number;
  wordMultiplier: number;
}

export interface WordEntry {
  word: string;
  basePoints: number;
  bonusPoints: number;
  finalPoints: number;
  bonuses: BonusMultipliers;
  letterMultipliers: number[];
  bingoBonus: boolean;
  tilesUsed: number;
}

export interface GameHistoryEntry {
  player: 1 | 2;
  word: string;
  points: number;
  time: string;
  bonuses?: BonusMultipliers;
  letterMultipliers?: number[];
  bingoBonus?: boolean;
  basePoints?: number;
  isTurnSummary?: boolean;
}

export interface GameState {
  players: {
    player1: Player;
    player2: Player;
  };
  currentPlayer: 1 | 2;
  gameHistory: GameHistoryEntry[];
  currentTurnWords: WordEntry[];
  showMultiWordMode: boolean;
}

export interface ValidationResult {
  valid: boolean;
  word: string;
  definition?: string;
  pronunciation?: string;
  partOfSpeech?: string;
  origin?: string;
}

export interface SetupData {
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
}

export type GameStatus = 'active' | 'paused' | 'final';

export interface Game {
  id: string;
  status: GameStatus;
  startTime: number;
  endTime?: number;
  pausedTime: number; // Total time spent paused (milliseconds)
  lastPauseStart?: number; // When current pause started
  currentTurnStartTime?: number; // When current turn started
  players: {
    player1: Player;
    player2: Player;
  };
  currentPlayer: 1 | 2;
  gameHistory: GameHistoryEntry[];
  currentTurnWords: WordEntry[];
  winner?: 1 | 2 | null;
  tilesRemaining: number;
}

