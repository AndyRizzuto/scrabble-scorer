import React from 'react';

interface WordShelfProps {
  currentTurnWords: Array<{ word: string; points: number; definition?: string }>;
  onWordClick?: (word: string, definition?: string) => void;
  onRemoveWord?: (index: number) => void;
}

const WordShelf: React.FC<WordShelfProps> = ({ currentTurnWords, onWordClick, onRemoveWord }) => {
  if (!currentTurnWords.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {currentTurnWords.map((wordEntry, index) => (
        <div
          key={index}
          className="group flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer text-xs"
          onClick={() => onWordClick?.(wordEntry.word, wordEntry.definition)}
        >
          <span className="font-mono">{wordEntry.word}</span>
          <span className="text-gray-500">+{wordEntry.points}</span>
          {onRemoveWord && (
            <button
              onClick={e => {
                e.stopPropagation();
                onRemoveWord(index);
              }}
              className="ml-1 w-3 h-3 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default WordShelf;
