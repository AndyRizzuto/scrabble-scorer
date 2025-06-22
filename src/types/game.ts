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

