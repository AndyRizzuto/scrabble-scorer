import React from 'react';

interface GameHistoryEntry {
  player: number;
  word: string;
  points: number;
  time: string;
  bonuses?: any;
  isTurnSummary?: boolean;
}

interface GameHistoryProps {
  gameHistory: GameHistoryEntry[];
  playerNames: { player1: string; player2: string };
}

export const GameHistory: React.FC<GameHistoryProps> = ({
  gameHistory,
  playerNames
}) => {
  if (gameHistory.length === 0) return null;

  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-4">Recent Plays</h3>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {gameHistory.slice(-10).reverse().map((entry, index) => (
          <div key={index} className={`flex justify-between items-center p-2 rounded text-sm ${
            entry.isTurnSummary ? 'bg-green-100 border border-green-300' : 'bg-gray-50'
          }`}>
            <span className={`font-medium ${
              entry.player === 1 ? 'text-blue-600' : 'text-purple-600'
            }`}>
              {playerNames[`player${entry.player}` as keyof typeof playerNames]}
            </span>
            <span className={`font-mono ${entry.isTurnSummary ? 'text-xs' : ''}`}>
              {entry.word}
            </span>
            <span className="font-semibold">+{entry.points}</span>
            <span className="text-gray-500 text-xs">{entry.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};