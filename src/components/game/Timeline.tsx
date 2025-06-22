import React from 'react';
import { Calendar, Trophy, TrendingUp, BarChart3, Plus, Play, Pause, CheckCircle } from 'lucide-react';
import { Player, GameHistoryEntry, Game } from '../../types/game';

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
  games: Game[];
  onCreateGame: () => void;
  onGameClick: (gameId: string) => void;
  formatDuration: (milliseconds: number) => string;
  getGameDuration: (game: Game) => number;
}

const Timeline: React.FC<TimelineProps> = ({ players, gameHistory, gameWins, games, onCreateGame, onGameClick, formatDuration, getGameDuration }) => {
  // Convert games to timeline sessions
  const convertGamesToSessions = (): GameSession[] => {
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
  };

  const gameSessions = convertGamesToSessions();
  
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
                        {session.status === 'final' && session.winner && (
                          <Trophy className={`w-5 h-5 ${session.winner === 1 ? 'text-blue-500' : 'text-purple-500'}`} />
                        )}
                        <span className="font-medium">
                          {session.status === 'final' && session.winner ? (
                            <span className="text-gray-800">
                              {session.winner === 1 ? players.player1.name : players.player2.name} Won
                            </span>
                          ) : (
                            // For active/paused games, show leading player with score difference
                            (() => {
                              const scoreDiff = Math.abs(session.player1Score - session.player2Score);
                              if (session.player1Score > session.player2Score) {
                                return <span className="text-blue-600">{players.player1.name} +{scoreDiff}</span>;
                              } else if (session.player2Score > session.player1Score) {
                                return <span className="text-purple-600">{players.player2.name} +{scoreDiff}</span>;
                              } else {
                                return <span className="text-gray-800">Tied</span>;
                              }
                            })()
                          )}
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
                      
                      {/* Game Status */}
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          {session.status === 'active' && (
                            <><Play className="w-4 h-4 text-green-500" />
                            <span className="font-medium text-green-600">Active</span></>
                          )}
                          {session.status === 'paused' && (
                            <><Pause className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium text-yellow-600">Paused</span></>
                          )}
                          {session.status === 'final' && (
                            <><CheckCircle className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-600">Final</span></>
                          )}
                        </div>
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