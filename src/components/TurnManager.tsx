import React from 'react';
import { Player, WordEntry } from '../types/game';

interface TurnManagerProps {
  players: {
    player1: Player;
    player2: Player;
  };
  currentPlayer: 1 | 2;
  showMultiWordMode: boolean;
  currentTurnWords: WordEntry[];
  onSwitchTurn: () => void;
  onToggleMultiWordMode: () => void;
}

const TurnManager: React.FC<TurnManagerProps> = ({
  players,
  currentPlayer,
  showMultiWordMode,
  currentTurnWords,
  onSwitchTurn,
  onToggleMultiWordMode
}) => {
  return (
    <div className="text-center mb-6">
      <div className="flex items-center justify-center gap-4">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
          currentPlayer === 1 ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
        }`}>
          {players[`player${currentPlayer}`].name}'s Turn
        </div>
        <button
          onClick={onSwitchTurn}
          disabled={showMultiWordMode && currentTurnWords.length > 0}
          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 text-sm font-medium transition-colors"
        >
          Switch Turn
        </button>
        <button
          onClick={onToggleMultiWordMode}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            showMultiWordMode 
              ? 'bg-orange-600 text-white hover:bg-orange-700' 
              : 'bg-orange-200 text-orange-700 hover:bg-orange-300'
          }`}
        >
          {showMultiWordMode ? 'Exit Multi-Word' : 'Multi-Word Mode'}
        </button>
      </div>
    </div>
  );
};

export default TurnManager;

