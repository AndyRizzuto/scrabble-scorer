import React from 'react';

interface TileBagButtonProps {
  usedTiles: number;
  tilesRemaining: number;
  onClick: () => void;
}

const TileBagButton: React.FC<TileBagButtonProps> = ({ usedTiles, tilesRemaining, onClick }) => (
  <button
    onClick={onClick}
    className="text-base text-gray-600 bg-white px-6 py-3 rounded-full border hover:bg-gray-50 transition-colors cursor-pointer h-12 flex items-center min-w-[64px] whitespace-nowrap sm:px-4 sm:text-sm md:px-6 md:text-base"
    title="View remaining tiles"
  >
    🎒 {tilesRemaining - usedTiles} in bag
  </button>
);

export default TileBagButton;
