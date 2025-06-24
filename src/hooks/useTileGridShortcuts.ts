import { useEffect } from 'react';
import { ValidationResult } from '../types/game';

interface UseTileGridShortcutsProps {
  letters: string[];
  multipliers: number[];
  wordMultiplier: number;
  validationResult: ValidationResult | null;
  currentTurnWords: Array<{word: string; points: number; definition?: string}>;
  calculateCurrentPoints: () => number;
  handleAddWord: () => void;
  onCompleteTurn?: () => void;
}

export const useTileGridShortcuts = ({
  letters,
  multipliers,
  wordMultiplier,
  validationResult,
  currentTurnWords,
  calculateCurrentPoints,
  handleAddWord,
  onCompleteTurn,
}: UseTileGridShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in inputs
      if (e.target instanceof HTMLInputElement) return;
      
      if (e.key === 'Enter') {
        if (e.metaKey || e.ctrlKey) {
          // Command+Return (Mac) or Ctrl+Return (Windows/Linux) = Complete Turn
          e.preventDefault();
          if (onCompleteTurn && currentTurnWords.length > 0) {
            onCompleteTurn();
          }
        } else {
          // Return = Add Word
          e.preventDefault();
          const word = letters.join('').trim();
          const points = calculateCurrentPoints();
          if (word && points > 0 && validationResult?.valid) {
            handleAddWord();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [letters, multipliers, wordMultiplier, validationResult?.valid, currentTurnWords, calculateCurrentPoints, handleAddWord, onCompleteTurn]);
};