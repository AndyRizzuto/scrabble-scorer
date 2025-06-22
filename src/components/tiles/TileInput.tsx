import React, { useRef, useEffect } from 'react';
import { LETTER_VALUES } from '../../utils/scoring';

interface TileInputProps {
  value: string;
  multiplier: number;
  index: number;
  onLetterChange: (index: number, letter: string) => void;
  onMultiplierChange: (index: number) => void;
  onNext: (index: number) => void;
  onPrevious: (index: number) => void;
  autoFocus?: boolean;
}

const TileInput: React.FC<TileInputProps> = ({
  value,
  multiplier,
  index,
  onLetterChange,
  onMultiplierChange,
  onNext,
  onPrevious,
  autoFocus = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault();
      onNext(index);
    } else if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
      e.preventDefault();
      onPrevious(index);
    } else if (e.key === 'Backspace' && !value) {
      onPrevious(index);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const letter = e.target.value.toUpperCase().slice(-1); // Only take last character
    onLetterChange(index, letter);
    
    // Auto-advance to next tile if letter entered
    if (letter && index < 6) {
      onNext(index);
    }
  };

  const getMultiplierColor = () => {
    switch (multiplier) {
      case 2: return 'bg-red-100 text-red-700 border-red-300';
      case 3: return 'bg-purple-100 text-purple-700 border-purple-300';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getScoreCircleStyle = () => {
    switch (multiplier) {
      case 2: return 'bg-red-600 text-white border-red-700';
      case 3: return 'bg-purple-600 text-white border-purple-700';
      default: return 'bg-gray-600 text-white border-gray-700';
    }
  };

  const getMultiplierText = () => {
    switch (multiplier) {
      case 2: return '2x';
      case 3: return '3x';
      default: return '1x';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      {/* Letter Tile */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-xl sm:text-2xl md:text-3xl font-bold text-center border-2 border-gray-300 rounded-lg bg-yellow-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors touch-manipulation"
          maxLength={1}
          placeholder=""
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
        {value && (
          <div className={`absolute -top-1 -right-1 w-6 h-6 text-xs rounded-full flex items-center justify-center font-bold border ${getScoreCircleStyle()}`}>
            {(LETTER_VALUES[value.toUpperCase() as keyof typeof LETTER_VALUES] || 0) * multiplier}
          </div>
        )}
      </div>
      
      {/* Multiplier Button */}
      <button
        onClick={() => onMultiplierChange(index)}
        className={`px-4 py-2 text-base font-medium rounded-full border transition-colors min-w-[48px] min-h-[40px] touch-manipulation ${getMultiplierColor()}`}
      >
        {getMultiplierText()}
      </button>
    </div>
  );
};

export default TileInput;