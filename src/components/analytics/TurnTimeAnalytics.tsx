import React from 'react';
import { Clock, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { GameHistoryEntry } from '../../types/game';

interface TurnTimeAnalyticsProps {
  gameHistory: GameHistoryEntry[];
  currentPlayer?: 1 | 2;
  className?: string;
}

interface TurnTimeStats {
  averageTime: number;
  fastestTime: number;
  slowestTime: number;
  totalTurns: number;
  player1Stats: {
    averageTime: number;
    fastestTime: number;
    slowestTime: number;
    totalTurns: number;
  };
  player2Stats: {
    averageTime: number;
    fastestTime: number;
    slowestTime: number;
    totalTurns: number;
  };
}

const TurnTimeAnalytics: React.FC<TurnTimeAnalyticsProps> = ({
  gameHistory,
  currentPlayer,
  className = ''
}) => {
  const calculateStats = (): TurnTimeStats => {
    // Filter for non-summary entries with turn duration data
    const turnsWithDuration = gameHistory.filter(
      entry => !entry.isTurnSummary && entry.turnDuration && entry.turnDuration > 0
    );

    if (turnsWithDuration.length === 0) {
      return {
        averageTime: 0,
        fastestTime: 0,
        slowestTime: 0,
        totalTurns: 0,
        player1Stats: { averageTime: 0, fastestTime: 0, slowestTime: 0, totalTurns: 0 },
        player2Stats: { averageTime: 0, fastestTime: 0, slowestTime: 0, totalTurns: 0 }
      };
    }

    const durations = turnsWithDuration.map(entry => entry.turnDuration!);
    const player1Turns = turnsWithDuration.filter(entry => entry.player === 1);
    const player2Turns = turnsWithDuration.filter(entry => entry.player === 2);

    const calculatePlayerStats = (turns: GameHistoryEntry[]) => {
      if (turns.length === 0) {
        return { averageTime: 0, fastestTime: 0, slowestTime: 0, totalTurns: 0 };
      }
      
      const playerDurations = turns.map(turn => turn.turnDuration!);
      return {
        averageTime: playerDurations.reduce((sum, duration) => sum + duration, 0) / playerDurations.length,
        fastestTime: Math.min(...playerDurations),
        slowestTime: Math.max(...playerDurations),
        totalTurns: turns.length
      };
    };

    return {
      averageTime: durations.reduce((sum, duration) => sum + duration, 0) / durations.length,
      fastestTime: Math.min(...durations),
      slowestTime: Math.max(...durations),
      totalTurns: turnsWithDuration.length,
      player1Stats: calculatePlayerStats(player1Turns),
      player2Stats: calculatePlayerStats(player2Turns)
    };
  };

  const formatTime = (milliseconds: number): string => {
    if (milliseconds === 0) return '--:--';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const stats = calculateStats();

  if (stats.totalTurns === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-600">Turn Time Analytics</h3>
        </div>
        <p className="text-sm text-gray-500 text-center py-4">
          No turn time data available yet. Complete some turns to see analytics.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Turn Time Analytics</h3>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-600">Average</span>
          </div>
          <span className="font-mono text-lg font-semibold text-blue-600">
            {formatTime(stats.averageTime)}
          </span>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-600">Fastest</span>
          </div>
          <span className="font-mono text-lg font-semibold text-green-600">
            {formatTime(stats.fastestTime)}
          </span>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span className="text-xs text-gray-600">Slowest</span>
          </div>
          <span className="font-mono text-lg font-semibold text-red-600">
            {formatTime(stats.slowestTime)}
          </span>
        </div>
      </div>

      {/* Player Comparison */}
      {stats.player1Stats.totalTurns > 0 && stats.player2Stats.totalTurns > 0 && (
        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Player Comparison</h4>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Player 1 */}
            <div className={`p-3 rounded-lg border ${
              currentPlayer === 1 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 mb-2">Player 1</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Average:</span>
                    <span className="font-mono">{formatTime(stats.player1Stats.averageTime)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Fastest:</span>
                    <span className="font-mono text-green-600">{formatTime(stats.player1Stats.fastestTime)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Turns:</span>
                    <span className="font-mono">{stats.player1Stats.totalTurns}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Player 2 */}
            <div className={`p-3 rounded-lg border ${
              currentPlayer === 2 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 mb-2">Player 2</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Average:</span>
                    <span className="font-mono">{formatTime(stats.player2Stats.averageTime)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Fastest:</span>
                    <span className="font-mono text-green-600">{formatTime(stats.player2Stats.fastestTime)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Turns:</span>
                    <span className="font-mono">{stats.player2Stats.totalTurns}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Based on {stats.totalTurns} completed turns with timing data
        </p>
      </div>
    </div>
  );
};

export default TurnTimeAnalytics;