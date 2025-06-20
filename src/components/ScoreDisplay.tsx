import React, { useState } from 'react';
import { Player } from '../types/game';

interface ScoreDisplayProps {
  players: {
    player1: Player;
    player2: Player;
  };
  currentPlayer: 1 | 2;
  onScoresUpdate: (scores: { player1: number; player2: number }) => void;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ 
  players, 
  currentPlayer, 
  onScoresUpdate 
}) => {
  const [editingScores, setEditingScores] = useState(false);
  const [tempScores, setTempScores] = useState({
    player1: players.player1.score,
    player2: players.player2.score
  });

  const startEditingScores = () => {
    setTempScores({
      player1: players.player1.score,
      player2: players.player2.score
    });
    setEditingScores(true);
  };

  const saveScores = () => {
    onScoresUpdate(tempScores);
    setEditingScores(false);
  };

  const cancelEditingScores = () => {
    setTempScores({
      player1: players.player1.score,
      player2: players.player2.score
    });
    setEditingScores(false);
  };

  return (
    <>
      {/* Score Display */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className={`text-center p-6 rounded-lg transition-all ${
          currentPlayer === 1 ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gray-50'
        }`}>
          <h2 className="text-lg font-semibold text-gray-700">{players.player1.name}</h2>
          {editingScores ? (
            <input
              type="number"
              value={tempScores.player1}
              onChange={(e) => setTempScores(prev => ({ ...prev, player1: parseInt(e.target.value) || 0 }))}
              className="text-3xl font-bold text-blue-600 bg-transparent border-b-2 border-blue-300 text-center w-24 mx-auto"
            />
          ) : (
            <div className="text-3xl font-bold text-blue-600">{players.player1.score}</div>
          )}
        </div>
        <div className={`text-center p-6 rounded-lg transition-all ${
          currentPlayer === 2 ? 'bg-purple-100 border-2 border-purple-400' : 'bg-gray-50'
        }`}>
          <h2 className="text-lg font-semibold text-gray-700">{players.player2.name}</h2>
          {editingScores ? (
            <input
              type="number"
              value={tempScores.player2}
              onChange={(e) => setTempScores(prev => ({ ...prev, player2: parseInt(e.target.value) || 0 }))}
              className="text-3xl font-bold text-purple-600 bg-transparent border-b-2 border-purple-300 text-center w-24 mx-auto"
            />
          ) : (
            <div className="text-3xl font-bold text-purple-600">{players.player2.score}</div>
          )}
        </div>
      </div>

      {/* Edit/Save Scores Button */}
      <div className="text-center mb-6">
        {editingScores ? (
          <div className="flex gap-2 justify-center">
            <button
              onClick={saveScores}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              Save
            </button>
            <button
              onClick={cancelEditingScores}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={startEditingScores}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium transition-colors"
          >
            Edit Scores
          </button>
        )}
      </div>
    </>
  );
};

export default ScoreDisplay;

