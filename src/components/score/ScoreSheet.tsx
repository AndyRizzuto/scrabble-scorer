import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trophy, Target, Clock, Edit3, Square } from 'lucide-react';

interface ScoreSheetProps {
  players: { player1: { name: string; score: number }; player2: { name: string; score: number } };
  gameHistory: any[];
  getWinStats: (playerKey: 'player1' | 'player2') => { totalWins: number; currentStreak: number; hasFlame: boolean };
  editingScores?: boolean;
  onToggleEditScores?: () => void;
  onEndGame?: () => void;
  gameStatus?: 'active' | 'paused' | 'final';
}

const ScoreSheet: React.FC<ScoreSheetProps> = ({ 
  players, 
  gameHistory, 
  getWinStats, 
  editingScores, 
  onToggleEditScores, 
  onEndGame, 
  gameStatus 
}) => {
  const [showHistory, setShowHistory] = useState(true);
  const [historyLimit, setHistoryLimit] = useState(10);

  // Group history chronologically to show game flow
  const chronologicalHistory = gameHistory
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    .slice(-historyLimit);

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getPlayerStats = (playerKey: 'player1' | 'player2') => {
    const stats = getWinStats(playerKey);
    const playerHistory = gameHistory.filter(entry => entry.player === (playerKey === 'player1' ? 1 : 2));
    const averageScore = playerHistory.length > 0 
      ? Math.round(playerHistory.reduce((sum, entry) => sum + entry.points, 0) / playerHistory.length)
      : 0;
    
    return { ...stats, averageScore, totalPlays: playerHistory.length };
  };

  return (
    <div className="space-y-6">
      {/* Current Scores Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Current Game</h2>
            {/* Game Controls */}
            <div className="flex items-center gap-3">
              {onToggleEditScores && (
                <button
                  onClick={onToggleEditScores}
                  className={`p-2 rounded-lg transition-colors ${
                    editingScores
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  } text-white`}
                  title={editingScores ? 'Save scores' : 'Edit scores'}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
              {gameStatus !== 'final' && onEndGame && (
                <button
                  onClick={onEndGame}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  title="End game"
                >
                  <Square className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Player 1 */}
          <div className="p-6 text-center">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-blue-700">{players.player1.name}</h3>
              <div className="text-3xl sm:text-4xl font-bold text-blue-700" role="status" aria-label={`${players.player1.name} score`}>{players.player1.score}</div>
              <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 flex-wrap">
                {(() => {
                  const stats = getPlayerStats('player1');
                  return (
                    <>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        <span>{stats.totalWins} wins</span>
                      </div>
                      {stats.currentStreak > 0 && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <span>🔥 {stats.currentStreak} streak</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>~{stats.averageScore}/turn</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Player 2 */}
          <div className="p-6 text-center">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-purple-700">{players.player2.name}</h3>
              <div className="text-3xl sm:text-4xl font-bold text-purple-700" role="status" aria-label={`${players.player2.name} score`}>{players.player2.score}</div>
              <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 flex-wrap">
                {(() => {
                  const stats = getPlayerStats('player2');
                  return (
                    <>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        <span>{stats.totalWins} wins</span>
                      </div>
                      {stats.currentStreak > 0 && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <span>🔥 {stats.currentStreak} streak</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>~{stats.averageScore}/turn</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game History */}
      {gameHistory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <h3 className="text-lg font-semibold text-gray-800">Game History</h3>
            <div className="flex items-center gap-3">
              {gameHistory.length > 10 && (
                <select 
                  value={historyLimit} 
                  onChange={(e) => setHistoryLimit(Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Select number of history entries to show"
                >
                  <option value={10}>Last 10</option>
                  <option value={20}>Last 20</option>
                  <option value={gameHistory.length}>All ({gameHistory.length})</option>
                </select>
              )}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-2 py-1"
                aria-label={showHistory ? "Hide game history" : "Show game history"}
              >
                {showHistory ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show
                  </>
                )}
              </button>
            </div>
          </div>

          {showHistory && (
            <div className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {chronologicalHistory.map((entry, index) => (
                  <div 
                    key={`${entry.player}-${index}-${entry.time}`}
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 rounded-lg border transition-colors ${
                      entry.isTurnSummary 
                        ? 'bg-gray-50 border-gray-300 shadow-sm' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        entry.player === 1 ? 'bg-blue-500' : 'bg-purple-500'
                      }`}></div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {entry.isTurnSummary ? (
                            <span className="text-sm italic text-gray-600">{entry.word}</span>
                          ) : (
                            <span className="font-mono">{entry.word.toUpperCase()}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 sm:gap-2 flex-wrap">
                          <span className={entry.player === 1 ? 'text-blue-600' : 'text-purple-600'}>
                            {entry.player === 1 ? players.player1.name : players.player2.name}
                          </span>
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(entry.time)}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-right sm:text-right ${
                      entry.isTurnSummary 
                        ? 'text-base sm:text-lg font-bold text-gray-700'
                        : 'text-sm sm:text-base font-semibold text-gray-800'
                    }`}>
                      <div className={entry.player === 1 ? 'text-blue-600' : 'text-purple-600'}>
                        +{entry.points}
                      </div>
                      {entry.bingoBonus && (
                        <div className="text-xs text-orange-600 font-bold">BINGO!</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {gameHistory.length > historyLimit && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setHistoryLimit(gameHistory.length)}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-2 py-1"
                    aria-label="Show all game history entries"
                  >
                    Show all {gameHistory.length} entries
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScoreSheet;