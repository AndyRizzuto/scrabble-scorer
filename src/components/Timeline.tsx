import React from 'react';
import { BarChart3 } from 'lucide-react';

interface GameHistoryEntry {
  player: number;
  word: string;
  points: number;
  time: string;
  bonuses?: any;
  isTurnSummary?: boolean;
}

interface TimelineProps {
  gameHistory: GameHistoryEntry[];
  playerNames: { player1: string; player2: string };
  scores: { player1: number; player2: number };
}

export const Timeline: React.FC<TimelineProps> = ({
  gameHistory,
  playerNames,
  scores
}) => {
  if (gameHistory.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>No games played yet. Start playing to see the timeline!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Timeline</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-700">{playerNames.player1}</h3>
            <div className="text-2xl font-bold text-blue-600">{scores.player1}</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-700">{playerNames.player2}</h3>
            <div className="text-2xl font-bold text-purple-600">{scores.player2}</div>
          </div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="space-y-4">
        {gameHistory.map((entry, index) => {
          // Calculate running scores
          const entriesUpToThis = gameHistory.slice(0, index + 1);
          const player1RunningScore = entriesUpToThis
            .filter(e => e.player === 1)
            .reduce((sum, e) => sum + e.points, 0);
          const player2RunningScore = entriesUpToThis
            .filter(e => e.player === 2)
            .reduce((sum, e) => sum + e.points, 0);

          return (
            <div key={index} className={`relative ${entry.isTurnSummary ? 'mb-6' : ''}`}>
              {/* Timeline line */}
              {index < gameHistory.length - 1 && (
                <div className="absolute left-8 top-12 w-0.5 h-8 bg-gray-300"></div>
              )}
              
              <div className={`flex items-start gap-4 ${
                entry.isTurnSummary 
                  ? 'bg-green-50 border border-green-200 rounded-lg p-4' 
                  : 'bg-gray-50 rounded-lg p-4'
              }`}>
                {/* Timeline dot */}
                <div className={`w-4 h-4 rounded-full mt-2 flex-shrink-0 ${
                  entry.player === 1 ? 'bg-blue-500' : 'bg-purple-500'
                } ${entry.isTurnSummary ? 'bg-green-500' : ''}`}></div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold ${
                          entry.player === 1 ? 'text-blue-600' : 'text-purple-600'
                        }`}>
                          {playerNames[`player${entry.player}` as keyof typeof playerNames]}
                        </span>
                        <span className="text-xs text-gray-500">{entry.time}</span>
                      </div>
                      <div className={`font-mono text-lg ${entry.isTurnSummary ? 'text-sm' : ''}`}>
                        {entry.word}
                      </div>
                      <div className="text-sm text-gray-600">
                        +{entry.points} points
                      </div>
                    </div>
                    
                    {/* Running score display */}
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">Running Scores</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-blue-600 font-semibold">
                          {playerNames.player1}: {player1RunningScore}
                        </div>
                        <div className="text-purple-600 font-semibold">
                          {playerNames.player2}: {player2RunningScore}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Lead: {player1RunningScore > player2RunningScore 
                          ? `${playerNames.player1} +${player1RunningScore - player2RunningScore}`
                          : player2RunningScore > player1RunningScore
                          ? `${playerNames.player2} +${player2RunningScore - player1RunningScore}`
                          : 'Tied'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};