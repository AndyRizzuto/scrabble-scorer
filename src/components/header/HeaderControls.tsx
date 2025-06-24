import React from 'react';
import { Edit3, ArrowRightLeft, Square } from 'lucide-react';

interface HeaderControlsProps {
  editingScores: boolean;
  onToggleEditScores: () => void;
  onSwitchTurn: () => void;
  canSwitchTurn: boolean;
  onShowTileModal: () => void;
  usedTiles: number;
  tilesRemaining: number;
  GameTimer: React.ReactNode;
  onEndGame?: () => void;
  gameStatus: 'active' | 'paused' | 'final';
}

const HeaderControls: React.FC<HeaderControlsProps> = ({
  editingScores,
  onToggleEditScores,
  onSwitchTurn,
  canSwitchTurn,
  onShowTileModal,
  usedTiles,
  tilesRemaining,
  GameTimer,
  onEndGame,
  gameStatus
}) => (
  <div className="flex items-center justify-between gap-4 mb-4">
    <div className="flex items-center gap-4">
      {/* Edit Score Button */}
      <button
        onClick={onToggleEditScores}
        className={`p-3 rounded-lg transition-colors ${
          editingScores
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-yellow-600 hover:bg-yellow-700'
        } text-white`}
        title={editingScores ? 'Save scores' : 'Edit scores'}
      >
        <Edit3 className="w-5 h-5" />
      </button>
      {/* Switch Player Button */}
      <button
        onClick={onSwitchTurn}
        disabled={!canSwitchTurn}
        className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
        title="Switch turn"
      >
        <ArrowRightLeft className="w-5 h-5" />
      </button>
      {/* End Game Button - Only show for active/paused games */}
      {gameStatus !== 'final' && onEndGame && (
        <button
          onClick={onEndGame}
          className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          title="End game"
        >
          <Square className="w-5 h-5" />
        </button>
      )}
      {/* Tile Distribution Pill - Responsive */}
      <button
        onClick={onShowTileModal}
        className="text-base text-gray-600 bg-white px-6 py-3 rounded-full border hover:bg-gray-50 transition-colors cursor-pointer h-12 flex items-center min-w-[64px] whitespace-nowrap sm:px-4 sm:text-sm md:px-6 md:text-base"
        title="View remaining tiles"
      >
        🎒 {tilesRemaining - usedTiles} in bag
      </button>
    </div>
    {/* Game Timer - Right justified */}
    {GameTimer}
  </div>
);

export default HeaderControls;
