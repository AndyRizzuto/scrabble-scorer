import React from 'react';

interface WordMultiplierButtonProps {
  wordMultiplier: number;
  setWordMultiplier: (mult: number) => void;
}

const WordMultiplierButton: React.FC<WordMultiplierButtonProps> = ({ wordMultiplier, setWordMultiplier }) => (
  <button
    onClick={() => setWordMultiplier(wordMultiplier === 1 ? 2 : wordMultiplier === 2 ? 3 : 1)}
    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
      wordMultiplier === 1 ? 'bg-gray-200 text-gray-700' :
      wordMultiplier === 2 ? 'bg-red-100 text-red-700 border border-red-300' :
      'bg-purple-100 text-purple-700 border border-purple-300'
    }`}
  >
    {wordMultiplier}x
  </button>
);

export default WordMultiplierButton;
