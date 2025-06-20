import React from 'react';

interface ScoreDisplayProps {
  playerNames: { player1: string; player2: string };
  scores: { player1: number; player2: number };
  tempScores: { player1: number; player2: number };
  currentPlayer: number;
  editingScores: boolean;
  onTempScoreChange: (player: 'player1' | 'player2', value: number) => void;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  playerNames,
  scores,
  tempScores,
  currentPlayer,
  editingScores,
  onTempScoreChange
}) => {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-6 sm:mb-8">
      <div className={`text-center p-3 sm:p-6 rounded-lg transition-all ${
        currentPlayer === 1 ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gray-50'
      }`}>
        <h2 className="text-sm sm:text-lg font-semibold text-gray-700">{playerNames.player1}</h2>
        {editingScores ? (
          <input
            type="number"
            value={tempScores.player1}
            onChange={(e) => onTempScoreChange('player1', parseInt(e.target.value) || 0)}
            className="text-2xl sm:text-3xl font-bold text-blue-600 bg-transparent border-b-2 border-blue-300 text-center w-20 sm:w-24 mx-auto"
          />
        ) : (
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">{scores.player1}</div>
        )}
      </div>
      <div className={`text-center p-3 sm:p-6 rounded-lg transition-all ${
        currentPlayer === 2 ? 'bg-purple-100 border-2 border-purple-400' : 'bg-gray-50'
      }`}>
        <h2 className="text-sm sm:text-lg font-semibold text-gray-700">{playerNames.player2}</h2>
        {editingScores ? (
          <input
            type="number"
            value={tempScores.player2}
            onChange={(e) => onTempScoreChange('player2', parseInt(e.target.value) || 0)}
            className="text-2xl sm:text-3xl font-bold text-purple-600 bg-transparent border-b-2 border-purple-300 text-center w-20 sm:w-24 mx-auto"
          />
        ) : (
          <div className="text-2xl sm:text-3xl font-bold text-purple-600">{scores.player2}</div>
        )}
      </div>
    </div>
  );
};