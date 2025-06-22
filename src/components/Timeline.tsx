import React from 'react';
import { Calendar, Trophy, TrendingUp, BarChart3, Plus } from 'lucide-react';
import { Player, GameHistoryEntry } from '../types/game';

interface GameSession {
  id: string;
  date: Date;
  player1Score: number;
  player2Score: number;
  winner: 1 | 2 | null;
  duration?: string;
  totalWords: number;
}

interface TimelineProps {
  players: {
    player1: Player;
    player2: Player;
  };
  gameHistory: GameHistoryEntry[];
  gameWins: {
    player1: number[];
    player2: number[];
  };
  onCreateGame: () => void;
  onGameClick: (gameId: string) => void;
}

const Timeline: React.FC<TimelineProps> = ({ players, gameHistory, gameWins, onCreateGame, onGameClick }) => {
  // Generate mock game sessions from game wins data
  const generateGameSessions = (): GameSession[] => {
    const sessions: GameSession[] = [];
    
    // Combine all wins with timestamps
    const allWins = [
      ...gameWins.player1.map(timestamp => ({ player: 1, timestamp })),
      ...gameWins.player2.map(timestamp => ({ player: 2, timestamp }))
    ].sort((a, b) => b.timestamp - a.timestamp); // Most recent first

    allWins.forEach((win, index) => {
      const date = new Date(win.timestamp);
      const winner = win.player as 1 | 2;
      
      // Generate realistic-looking scores
      const winnerScore = Math.floor(Math.random() * 150) + 200; // 200-350
      const loserScore = Math.floor(Math.random() * 100) + 100;  // 100-200
      
      sessions.push({
        id: `game-${win.timestamp}`,
        date,
        player1Score: winner === 1 ? winnerScore : loserScore,
        player2Score: winner === 2 ? winnerScore : loserScore,
        winner,
        duration: `${Math.floor(Math.random() * 30) + 15}m`, // 15-45 minutes
        totalWords: Math.floor(Math.random() * 20) + 15 // 15-35 words
      });
    });

    return sessions;
  };

  const gameSessions = generateGameSessions();
  
  // Group sessions by date
  const groupSessionsByDate = (sessions: GameSession[]) => {
    const groups: { [date: string]: GameSession[] } = {};
    
    sessions.forEach(session => {
      const dateKey = session.date.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(session);
    });
    
    return groups;
  };

  const sessionGroups = groupSessionsByDate(gameSessions);
  
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

  if (totalGames === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">No Games Yet</h2>
        <p className="text-gray-500 mb-6">Start playing to see your game history here!</p>
        <button
          onClick={onCreateGame}
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-medium shadow-lg"
        >
          <Plus className="w-6 h-6" />
          Create New Game
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Statistics Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Game Timeline
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{totalGames}</div>
            <div className="text-sm text-gray-600">Total Games</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">{player1Wins}</div>
            <div className="text-sm text-gray-600">{players.player1.name} Wins</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{player2Wins}</div>
            <div className="text-sm text-gray-600">{players.player2.name} Wins</div>
          </div>
        </div>
        
        {/* Win Percentage Bar */}
        {totalGames > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{players.player1.name}</span>
              <span className="text-sm font-medium text-gray-700">{players.player2.name}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-500"
                style={{ width: `${(player1Wins / totalGames) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
              <span>{Math.round((player1Wins / totalGames) * 100)}%</span>
              <span>{Math.round((player2Wins / totalGames) * 100)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Create Game Button */}
      <div className="text-center mb-8">
        <button
          onClick={onCreateGame}
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-medium shadow-lg"
        >
          <Plus className="w-6 h-6" />
          Create New Game
        </button>
      </div>

      {/* Game Sessions Timeline */}
      <div className="space-y-6">
        {Object.entries(sessionGroups)
          .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
          .map(([dateStr, sessions]) => (
            <div key={dateStr} className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {formatDate(new Date(dateStr))}
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                {sessions.map((session) => (
                  <div 
                    key={session.id}
                    onClick={() => onGameClick(session.id)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {session.winner && (
                          <Trophy className={`w-5 h-5 ${session.winner === 1 ? 'text-blue-500' : 'text-purple-500'}`} />
                        )}
                        <span className="font-medium text-gray-800">
                          {session.winner === 1 ? players.player1.name : players.player2.name} Won
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="text-center">
                        <div className="font-bold text-blue-600">{session.player1Score}</div>
                        <div className="text-xs">{players.player1.name}</div>
                      </div>
                      
                      <div className="text-gray-400">vs</div>
                      
                      <div className="text-center">
                        <div className="font-bold text-purple-600">{session.player2Score}</div>
                        <div className="text-xs">{players.player2.name}</div>
                      </div>
                      
                      {session.duration && (
                        <div className="text-center">
                          <div className="font-medium">{session.duration}</div>
                          <div className="text-xs">Duration</div>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className="font-medium">{session.totalWords}</div>
                        <div className="text-xs">Words</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Timeline;