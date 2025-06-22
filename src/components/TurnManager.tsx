import React from 'react';
import { ArrowRightLeft, Users, User } from 'lucide-react';
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
    <div className="flex items-center justify-center gap-3 mb-6">
      <button
        onClick={onSwitchTurn}
        disabled={showMultiWordMode && currentTurnWords.length > 0}
        className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
        title="Switch turn"
      >
        <ArrowRightLeft className="w-4 h-4" />
      </button>
      <button
        onClick={onToggleMultiWordMode}
        className={`p-2 rounded-lg transition-colors ${
          showMultiWordMode 
            ? 'bg-orange-600 text-white hover:bg-orange-700' 
            : 'bg-orange-200 text-orange-700 hover:bg-orange-300'
        }`}
        title={showMultiWordMode ? 'Exit multi-word mode' : 'Enable multi-word mode'}
      >
        {showMultiWordMode ? <User className="w-4 h-4" /> : <Users className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default TurnManager;

