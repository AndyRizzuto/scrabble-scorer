import { useMemo } from 'react';
import { Game, Player } from '../types/game';

interface GameSession {
  id: string;
  date: Date;
  player1Score: number;
  player2Score: number;
  winner: 1 | 2 | null;
  duration?: string;
  totalWords: number;
  status?: 'active' | 'paused' | 'final';
}

interface UseGameSessionsProps {
  games: Game[];
  gameWins: {
    player1: number[];
    player2: number[];
  };
  players: {
    player1: Player;
    player2: Player;
  };
  formatDuration: (milliseconds: number) => string;
  getGameDuration: (game: Game) => number;
}

interface UseGameSessionsReturn {
  gameSessions: GameSession[];
  sessionGroups: { [date: string]: GameSession[] };
  totalGames: number;
  player1Wins: number;
  player2Wins: number;
  formatDate: (date: Date) => string;
}

export const useGameSessions = ({
  games,
  gameWins,
  players,
  formatDuration,
  getGameDuration,
}: UseGameSessionsProps): UseGameSessionsReturn => {
  // Convert games to timeline sessions
  const gameSessions = useMemo((): GameSession[] => {
    return games.map(game => ({
      id: game.id,
      date: new Date(game.startTime),
      player1Score: game.players.player1.score,
      player2Score: game.players.player2.score,
      winner: game.winner !== undefined ? game.winner : null,
      duration: formatDuration(getGameDuration(game)),
      totalWords: game.gameHistory.filter(h => !h.isTurnSummary).length,
      status: game.status
    })).sort((a, b) => b.date.getTime() - a.date.getTime()); // Most recent first
  }, [games, formatDuration, getGameDuration]);

  // Group sessions by date
  const sessionGroups = useMemo(() => {
    const groups: { [date: string]: GameSession[] } = {};
    
    gameSessions.forEach(session => {
      const dateKey = session.date.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(session);
    });
    
    return groups;
  }, [gameSessions]);

  // Calculate statistics
  const totalGames = gameSessions.length;
  const player1Wins = gameWins.player1.length;
  const player2Wins = gameWins.player2.length;

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return {
    gameSessions,
    sessionGroups,
    totalGames,
    player1Wins,
    player2Wins,
    formatDate,
  };
};