import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, PlusCircle, CheckCircle2, Undo2 } from 'lucide-react';
import TileInput from './TileInput';
import { calculateWordValue, calculateBonusPoints, validateWord, LETTER_VALUES } from '../utils/scoring';
import { ValidationResult, GameHistoryEntry } from '../types/game';

interface TileGridProps {
  onAddWord: (word: string, points: number, wordData?: Partial<{
    basePoints: number;
    bonusPoints: number;
    bonuses: {letterMultiplier: number; wordMultiplier: number};
    letterMultipliers: number[];
    bingoBonus: boolean;
  }>) => void;
  onClear: () => void;
  onWordChange?: (word: string, points: number, tiles?: number) => void;
  onValidationChange?: (result: ValidationResult | null) => void;
  recentPlays?: GameHistoryEntry[];
  players?: {
    player1: { name: string };
    player2: { name: string };
  };
  onResetGame?: () => void;
  currentTurnWords?: Array<{word: string; points: number; definition?: string}>;
  onRemoveWord?: (index: number, currentWordInfo?: {word: string, points: number, isValid: boolean}) => void;
  onWordClick?: (word: string, definition?: string) => void;
  restoreToTiles?: string;
  restoreMultipliers?: {
    letterMultipliers: number[];
    wordMultiplier: number;
  };
  onCompleteTurn?: () => void;
  onUndoTurn?: (turnIndex: number) => void;
}

const TileGrid: React.FC<TileGridProps> = ({ 
  onAddWord, 
  onClear, 
  onWordChange, 
  onValidationChange,
  recentPlays = [],
  players,
  onResetGame,
  currentTurnWords = [],
  onRemoveWord,
  onWordClick,
  restoreToTiles,
  restoreMultipliers,
  onCompleteTurn,
  onUndoTurn
}) => {
  const [letters, setLetters] = useState<string[]>(new Array(7).fill(''));
  const [multipliers, setMultipliers] = useState<number[]>(new Array(7).fill(1));
  const [wordMultiplier, setWordMultiplier] = useState(1);
  // Bingo bonus is auto-detected when all 7 tiles are used
  const [currentFocus, setCurrentFocus] = useState(0);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const tileRefs = useRef<HTMLInputElement[]>([]);

  // Trigger confetti when bingo is achieved
  useEffect(() => {
    const usedTiles = letters.filter(l => l !== '').length;
    const currentWord = letters.join('').trim();
    if (usedTiles === 7 && currentWord.length >= 7) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [letters]);

  // Update parent with current word/points whenever they change
  useEffect(() => {
    const word = getCurrentWord();
    const points = calculateCurrentPoints();
    const usedTiles = letters.filter(l => l !== '').length;
    if (onWordChange) {
      onWordChange(word, points, usedTiles);
    }
  }, [letters, multipliers, wordMultiplier, onWordChange]);

  // Restore word to tiles when restoreToTiles prop changes
  useEffect(() => {
    if (restoreToTiles && restoreToTiles.length > 0) {
      const newLetters = new Array(7).fill('');
      const wordLetters = restoreToTiles.split('');
      
      // Place letters starting from index 0
      wordLetters.forEach((letter, index) => {
        if (index < 7) {
          newLetters[index] = letter;
        }
      });
      
      setLetters(newLetters);
      setCurrentFocus(wordLetters.length < 7 ? wordLetters.length : 0);
      
      // Restore multipliers if provided, otherwise reset
      if (restoreMultipliers) {
        setMultipliers(restoreMultipliers.letterMultipliers.slice(0, 7).concat(new Array(Math.max(0, 7 - restoreMultipliers.letterMultipliers.length)).fill(1)));
        setWordMultiplier(restoreMultipliers.wordMultiplier);
      } else {
        setMultipliers(new Array(7).fill(1));
        setWordMultiplier(1);
      }
      
      setValidationResult(null);
      
      // Trigger validation for the restored word
      if (restoreToTiles.length >= 2) {
        validateWordAsync(restoreToTiles);
      }
    }
  }, [restoreToTiles, restoreMultipliers]);

  // Keyboard shortcuts
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
  }, [letters, multipliers, wordMultiplier, validationResult?.valid, currentTurnWords, onCompleteTurn, onAddWord]);

  const handleLetterChange = (index: number, letter: string) => {
    const newLetters = [...letters];
    newLetters[index] = letter;
    setLetters(newLetters);
    setValidationResult(null); // Clear validation when typing
    
    // Auto-validate if we have a complete word
    const newWord = newLetters.join('').trim();
    if (newWord.length >= 2) {
      validateWordAsync(newWord);
    }
  };

  const validateWordAsync = async (word: string) => {
    if (!word || word.length < 2) return;
    
    setIsValidating(true);
    try {
      const result = await validateWord(word);
      setValidationResult(result);
      if (onValidationChange) {
        onValidationChange(result);
      }
    } catch (error) {
      console.error('Validation error:', error);
    }
    setIsValidating(false);
  };

  const handleMultiplierChange = (index: number) => {
    const newMultipliers = [...multipliers];
    newMultipliers[index] = newMultipliers[index] === 1 ? 2 : newMultipliers[index] === 2 ? 3 : 1;
    setMultipliers(newMultipliers);
  };

  const handleNext = (index: number) => {
    if (index < 6) {
      setCurrentFocus(index + 1);
    }
  };

  const handlePrevious = (index: number) => {
    if (index > 0) {
      setCurrentFocus(index - 1);
    }
  };

  const getCurrentWord = () => {
    return letters.join('').trim();
  };

  const calculateCurrentPoints = () => {
    const word = getCurrentWord();
    if (!word) return 0;

    const usedTiles = letters.filter(l => l !== '').length;
    const isBingo = usedTiles === 7; // Auto-detect bingo when all 7 tiles are used
    
    return calculateBonusPoints(word, multipliers, wordMultiplier, isBingo);
  };

  const handleClear = () => {
    setLetters(new Array(7).fill(''));
    setMultipliers(new Array(7).fill(1));
    setWordMultiplier(1);
    setCurrentFocus(0);
    setValidationResult(null);
    if (onValidationChange) {
      onValidationChange(null);
    }
    onClear();
  };

  const handleAddWord = () => {
    const word = getCurrentWord();
    const points = calculateCurrentPoints();
    const basePoints = calculateWordValue(word);
    const usedTiles = letters.filter(l => l !== '').length;
    const isBingo = usedTiles === 7;
    
    // Only allow adding valid words
    if (word && points > 0 && validationResult?.valid) {
      onAddWord(word, points, {
        basePoints,
        bonusPoints: points - basePoints,
        bonuses: { letterMultiplier: 1, wordMultiplier },
        letterMultipliers: multipliers.slice(0, usedTiles),
        bingoBonus: isBingo
      });
      handleClear();
    }
  };

  const currentWord = getCurrentWord();
  const currentPoints = calculateCurrentPoints();
  const usedTiles = letters.filter(l => l !== '').length;

  return (
    <div className="space-y-6 relative">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className="text-4xl animate-bounce">🎉🎊✨</div>
        </div>
      )}
      {/* Compact Controls Row */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Word:</span>
            <button
              onClick={() => setWordMultiplier(wordMultiplier === 1 ? 2 : wordMultiplier === 2 ? 3 : 1)}
              className={`px-4 py-2 rounded-full text-base font-medium transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center touch-manipulation ${
                wordMultiplier === 1 ? 'bg-gray-200 text-gray-700' :
                wordMultiplier === 2 ? 'bg-red-100 text-red-700 border border-red-300' :
                'bg-purple-100 text-purple-700 border border-purple-300'
              }`}
            >
              {wordMultiplier}x
            </button>
          </div>
          
          {/* Word Shelf - Current Turn Words */}
          {currentTurnWords.length > 0 && (
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveWord(index, {
                          word: currentWord,
                          points: currentPoints,
                          isValid: validationResult?.valid || false
                        });
                      }}
                      className="ml-1 w-3 h-3 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {usedTiles === 7 && (
            <div className={`px-3 py-1 rounded-full text-sm font-bold border transition-all duration-300 ${
              showConfetti 
                ? 'bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-800 border-orange-300 animate-pulse' 
                : 'bg-yellow-100 text-yellow-800 border-yellow-300'
            }`}>
              🎉 BINGO! +50
            </div>
          )}
        </div>

        {/* Clear Button */}
        <button
          onClick={handleClear}
          className="ml-2 flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          title="Clear tiles"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Clear</span>
        </button>
      </div>

      {/* Tile Grid */}
      <div className="flex justify-center">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-4">
          {letters.map((letter, index) => (
            <TileInput
              key={index}
              value={letter}
              multiplier={multipliers[index]}
              index={index}
              onLetterChange={handleLetterChange}
              onMultiplierChange={handleMultiplierChange}
              onNext={handleNext}
              onPrevious={handlePrevious}
              autoFocus={index === currentFocus}
            />
          ))}
        </div>
      </div>


      {/* Loading indicator for validation */}
      {isValidating && currentWord.length >= 2 && (
        <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-50 text-blue-700">
          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-sm">Checking word...</span>
        </div>
      )}


      {/* Split Layout: Action Buttons (35%) | Recent Plays (65%) */}
      <div className="grid grid-cols-5 gap-4">
        {/* Action Buttons - Left Side */}
        <div className="col-span-2 space-y-2">
          <button
            type="button"
            onClick={handleAddWord}
            disabled={!currentWord || isValidating || !validationResult?.valid}
            className="w-full flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 transition-colors font-medium touch-manipulation text-sm"
          >
            Add Word
          </button>
          
          <button
            type="button"
            onClick={() => {
              // If there's a current word, add it first, then complete turn
              const word = getCurrentWord();
              const points = calculateCurrentPoints();
              if (word && points > 0 && validationResult?.valid) {
                const basePoints = calculateWordValue(word);
                const usedTiles = letters.filter(l => l !== '').length;
                const isBingo = usedTiles === 7;
                
                // Add word to shelf
                onAddWord(word, points, {
                  basePoints,
                  bonusPoints: points - basePoints,
                  bonuses: { letterMultiplier: 1, wordMultiplier },
                  letterMultipliers: multipliers.slice(0, usedTiles),
                  bingoBonus: isBingo
                });
                
                // Always complete turn immediately after adding word
                setTimeout(() => {
                  onCompleteTurn?.();
                  handleClear(); // Clear tiles after completing
                }, 100);
              } else if (currentTurnWords.length > 0) {
                // No current word but words on shelf - complete with shelf words only
                onCompleteTurn?.();
              }
            }}
            disabled={(!currentWord || isValidating || !validationResult?.valid) && currentTurnWords.length === 0}
            className="w-full flex flex-col items-center justify-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 disabled:bg-gray-400 transition-colors font-medium touch-manipulation text-sm"
          >
            <span>Complete Turn</span>
            <span className="text-xs">({(currentWord && validationResult?.valid ? calculateCurrentPoints() : 0) + currentTurnWords.reduce((sum, word) => sum + word.points, 0)} points)</span>
          </button>
        </div>

        {/* Recent Plays - Right Side with 3 Columns (65% width) */}
        <div className="col-span-3 bg-gray-50 rounded-lg p-3 border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700">Recent Plays</h4>
            {onResetGame && (
              <button
                onClick={onResetGame}
                className="text-xs text-red-600 hover:text-red-800 underline transition-colors"
                title="Reset game"
              >
                reset
              </button>
            )}
          </div>
          
          {recentPlays.length === 0 ? (
            <div className="text-xs text-gray-500 italic text-center py-4">No plays yet</div>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {/* Group plays by turn */}
              {(() => {
                // Group consecutive plays by the same player as turns
                const turns: Array<{player: number, time: string, words: Array<{word: string, points: number}>}> = [];
                let currentTurn: {player: number, time: string, words: Array<{word: string, points: number}>} | null = null;
                
                recentPlays.slice(-6).reverse().forEach(play => {
                  if (play.isTurnSummary) return; // Skip turn summary entries
                  
                  if (!currentTurn || currentTurn.player !== play.player) {
                    // Start new turn
                    if (currentTurn) turns.push(currentTurn);
                    currentTurn = {
                      player: play.player,
                      time: play.time,
                      words: [{word: play.word, points: play.points}]
                    };
                  } else {
                    // Add to current turn
                    currentTurn.words.push({word: play.word, points: play.points});
                  }
                });
                
                if (currentTurn) turns.push(currentTurn);
                
                return turns.map((turn, turnIndex) => {
                  const totalPoints = turn.words.reduce((sum, word) => sum + word.points, 0);
                  const playerColor = turn.player === 1 ? 'blue' : 'purple';
                  const bgColor = turn.player === 1 ? 'bg-blue-50' : 'bg-purple-50';
                  const borderColor = turn.player === 1 ? 'border-blue-200' : 'border-purple-200';
                  const textColor = turn.player === 1 ? 'text-blue-700' : 'text-purple-700';
                  const bonusColor = turn.player === 1 ? 'text-blue-600' : 'text-purple-600';
                  
                  // Calculate time ago
                  const getTimeAgo = (timeString: string) => {
                    try {
                      const playTime = new Date(timeString).getTime();
                      if (isNaN(playTime)) {
                        return "just now";
                      }
                      
                      const now = Date.now();
                      const diffMs = now - playTime;
                      const diffSec = Math.floor(diffMs / 1000);
                      const diffMin = Math.floor(diffSec / 60);
                      const diffHour = Math.floor(diffMin / 60);
                      const diffDays = Math.floor(diffHour / 24);
                      
                      if (diffDays > 0) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
                      if (diffHour > 0) return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
                      if (diffMin > 0) return `${diffMin} ${diffMin === 1 ? 'min' : 'mins'} ago`;
                      if (diffSec > 0) return `${diffSec} ${diffSec === 1 ? 'sec' : 'secs'} ago`;
                      return "just now";
                    } catch {
                      return "just now";
                    }
                  };
                  
                  return (
                    <div key={turnIndex} className={`${bgColor} ${borderColor} border rounded-lg p-2 relative group`}>
                      {/* Undo Button */}
                      <button
                        onClick={() => onUndoTurn?.(turnIndex)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-white shadow-sm border border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                        title="Undo turn"
                      >
                        <Undo2 className="w-3 h-3 text-gray-600" />
                      </button>
                      
                      {/* Player & Time Header */}
                      <div className={`flex justify-between items-center mb-1 ${textColor} text-xs font-semibold pr-6`}>
                        <span>{players?.[`player${turn.player}`]?.name || `Player ${turn.player}`}</span>
                        <span className="text-gray-500">{getTimeAgo(turn.time)}</span>
                      </div>
                      
                      {/* Words with detailed scoring */}
                      <div className="space-y-1">
                        {turn.words.map((word, wordIndex) => {
                          // Find the corresponding play to get bonus info
                          const correspondingPlay = recentPlays.find(play => 
                            play.word === word.word && play.points === word.points && play.player === turn.player
                          );
                          
                          const baseScore = calculateWordValue(word.word);
                          const bonusScore = word.points - baseScore;
                          const bonuses = correspondingPlay?.bonuses;
                          
                          return (
                            <div key={wordIndex} className="text-xs font-mono">
                              {(() => {
                                // Calculate all the components
                                const letterMultiplierBonuses = correspondingPlay?.letterMultipliers?.filter(m => m > 1) || [];
                                const wordMult = bonuses?.wordMultiplier || 1;
                                const bingoBonus = correspondingPlay?.bingoBonus ? 50 : 0;
                                
                                // Build the labels and values arrays
                                const labels = [word.word];
                                const values = [baseScore];
                                
                                // Add letter multipliers
                                letterMultiplierBonuses.forEach((mult, idx) => {
                                  const actualIdx = correspondingPlay?.letterMultipliers?.findIndex(m => m === mult) || 0;
                                  const letterValue = (LETTER_VALUES[word.word.charAt(actualIdx)] || 1);
                                  const bonus = letterValue * (mult - 1);
                                  labels.push(`+${word.word.charAt(actualIdx)}×${mult}`);
                                  values.push(bonus);
                                });
                                
                                // Add word multiplier (if > 1, show the multiplication effect)
                                if (wordMult > 1) {
                                  const preMultTotal = values.reduce((sum, val) => sum + val, 0);
                                  const multiplierBonus = preMultTotal * (wordMult - 1);
                                  labels.push(`× ${wordMult}`);
                                  values.push(multiplierBonus);
                                }
                                
                                // Add bingo bonus
                                if (bingoBonus > 0) {
                                  labels.push('+ Bonus!🎉');
                                  values.push(bingoBonus);
                                }
                                
                                // Add equals sign
                                labels.push('=');
                                values.push(word.points);
                                
                                return (
                                  <div className="space-y-0.5">
                                    {/* Labels row */}
                                    <div className="flex items-center justify-end gap-2">
                                      {labels.map((label, idx) => (
                                        <div key={idx} className={`text-center min-w-[3rem] ${
                                          idx === 0 ? 'text-gray-700 font-semibold' : 
                                          label.includes('L×') ? 'text-red-600' :
                                          label.includes('×') ? 'text-purple-600' :
                                          label.includes('Bonus') ? bonusColor + ' font-bold' :
                                          'text-gray-600'
                                        }`}>
                                          {label}
                                        </div>
                                      ))}
                                    </div>
                                    
                                    {/* Values row */}
                                    <div className="flex items-center justify-end gap-2">
                                      {values.map((value, idx) => (
                                        <div key={idx} className={`text-center min-w-[3rem] font-medium ${
                                          idx === 0 ? 'text-gray-700' :
                                          typeof value === 'string' ? 'text-gray-600 text-lg font-bold' :
                                          idx === values.length - 1 ? 'text-gray-700 font-bold' :
                                          'text-gray-600'
                                        }`}>
                                          {typeof value === 'string' && value === '' ? word.points : value}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Turn Total with line above */}
                      {turn.words.length > 1 && (
                        <div className="mt-1 pt-1 border-t border-gray-400">
                          <div className={`flex justify-between text-xs font-bold ${textColor}`}>
                            <span>Total</span>
                            <span>{totalPoints}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TileGrid;