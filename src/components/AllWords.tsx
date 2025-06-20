import React from 'react';

interface GameHistoryEntry {
  word: string;
}

interface AllWordsProps {
  gameHistory: GameHistoryEntry[];
}

export const AllWords: React.FC<AllWordsProps> = ({ gameHistory }) => {
  if (gameHistory.length === 0) return null;

  const uniqueWords = [...new Set(gameHistory.map(entry => entry.word))].sort();

  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-4">All Words ({uniqueWords.length})</h3>
      <div className="max-h-40 overflow-y-auto">
        <div className="flex flex-wrap gap-2">
          {uniqueWords.map((word, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-mono"
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};