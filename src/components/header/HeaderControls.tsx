import React from 'react';
import { ArrowRightLeft, RotateCcw } from 'lucide-react';

interface HeaderControlsProps {
  onSwitchTurn: () => void;
  canSwitchTurn: boolean;
  onShowTileModal: () => void;
  usedTiles: number;
  tilesRemaining: number;
  GameTimer: React.ReactNode;
  onClearTiles: () => void;
}

const HeaderControls: React.FC<HeaderControlsProps> = ({
  onSwitchTurn,
  canSwitchTurn,
  onShowTileModal,
  usedTiles,
  tilesRemaining,
  GameTimer,
  onClearTiles
}) => (
  <div className="flex items-center justify-between gap-4 mb-4">
    <div className="flex items-center gap-4">
      {/* Switch Player Button */}
      <button
        onClick={onSwitchTurn}
        disabled={!canSwitchTurn}
        className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
        title="Switch turn"
      >
        <ArrowRightLeft className="w-5 h-5" />
      </button>
      {/* Clear Tiles Button */}
      <button
        onClick={onClearTiles}
        className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        title="Clear all tiles"
      >
        <RotateCcw className="w-5 h-5" />
      </button>
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
