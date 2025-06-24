import React, { useState, useEffect } from 'react';
import { X, Plus, Trophy } from 'lucide-react';

interface WordEntry {
  word: string;
  points: number;
  definition?: string;
}

interface WordShelfProps {
  currentTurnWords: WordEntry[];
  onRemoveWord?: (index: number, currentWordInfo?: {word: string, points: number, isValid: boolean}) => void;
  onWordClick?: (word: string, definition?: string) => void;
  currentWordInfo?: {word: string, points: number, isValid: boolean};
  className?: string;
}

const WordShelf: React.FC<WordShelfProps> = ({
  currentTurnWords,
  onRemoveWord,
  onWordClick,
  currentWordInfo,
  className = ''
}) => {
  const [animatingWords, setAnimatingWords] = useState<Set<number>>(new Set());
  const [recentlyAdded, setRecentlyAdded] = useState<number | null>(null);

  // Track when words are added for success animation
  useEffect(() => {
    if (currentTurnWords.length > 0) {
      const lastIndex = currentTurnWords.length - 1;
      setRecentlyAdded(lastIndex);
      
      // Remove success animation after 2 seconds
      const timer = setTimeout(() => {
        setRecentlyAdded(null);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [currentTurnWords.length]);

  const handleRemoveWord = (index: number) => {
    if (!onRemoveWord) return;
    
    // Add remove animation
    setAnimatingWords(prev => new Set(prev).add(index));
    
    // Trigger removal after animation delay
    setTimeout(() => {
      onRemoveWord(index, currentWordInfo);
      setAnimatingWords(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }, 200);
  };

  const getTotalPoints = () => {
    return currentTurnWords.reduce((sum, word) => sum + word.points, 0);
  };

  if (currentTurnWords.length === 0) {
    return (
      <div className={`bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Plus className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-600 mb-1">Word Shelf</h3>
            <p className="text-sm text-gray-500">Add words to build your turn</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Turn Words</h3>
          <span className="text-sm text-gray-500">({currentTurnWords.length})</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">+{getTotalPoints()}</div>
          <div className="text-xs text-gray-500">Total Points</div>
        </div>
      </div>

      {/* Word Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {currentTurnWords.map((wordEntry, index) => (
          <div
            key={`${wordEntry.word}-${index}`}
            className={`group relative overflow-hidden transition-all duration-300 ${
              animatingWords.has(index) 
                ? 'scale-95 opacity-50 transform translate-x-4' 
                : 'scale-100 opacity-100 transform translate-x-0'
            } ${
              recentlyAdded === index
                ? 'animate-pulse bg-gradient-to-r from-green-50 to-blue-50 border-green-300 shadow-md'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div
              onClick={() => onWordClick?.(wordEntry.word, wordEntry.definition)}
              className="flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="font-mono font-semibold text-gray-900 text-lg">
                  {wordEntry.word.toUpperCase()}
                </div>
                {wordEntry.definition && (
                  <div className="text-xs text-gray-500 truncate mt-1">
                    {wordEntry.definition}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-3">
                <div className="text-right">
                  <div className="font-bold text-blue-600 text-lg">+{wordEntry.points}</div>
                  <div className="text-xs text-gray-500">pts</div>
                </div>
                
                {onRemoveWord && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveWord(index);
                    }}
                    className="w-8 h-8 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:bg-red-600 hover:scale-110 focus:opacity-100 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                    title="Remove word"
                    disabled={animatingWords.has(index)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Success animation overlay */}
            {recentlyAdded === index && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-2 right-2 animate-bounce">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Turn Summary */}
      {currentTurnWords.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {currentTurnWords.length} words in this turn
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold text-lg text-blue-600">+{getTotalPoints()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordShelf;