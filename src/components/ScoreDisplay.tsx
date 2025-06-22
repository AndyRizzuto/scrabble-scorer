import React, { useState } from 'react';
import { Player, ValidationResult } from '../types/game';

interface ScoreDisplayProps {
  players: {
    player1: Player;
    player2: Player;
  };
  currentPlayer: 1 | 2;
  onScoresUpdate: (scores: { player1: number; player2: number }) => void;
  currentWord?: string;
  currentPoints?: number;
  validationResult?: ValidationResult | null;
  usedTiles?: number;
  onSwitchTurn?: () => void;
  canSwitchTurn?: boolean;
  editingScores?: boolean;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ 
  players, 
  currentPlayer, 
  onScoresUpdate,
  currentWord,
  currentPoints,
  validationResult,
  usedTiles = 0,
  onSwitchTurn,
  canSwitchTurn = true,
  editingScores = false
}) => {
  const [tempScores, setTempScores] = useState({
    player1: players.player1.score,
    player2: players.player2.score
  });

  // Update temp scores when editing starts
  React.useEffect(() => {
    if (editingScores) {
      setTempScores({
        player1: players.player1.score,
        player2: players.player2.score
      });
    }
  }, [editingScores, players.player1.score, players.player2.score]);

  // Save scores when editing ends
  React.useEffect(() => {
    if (!editingScores && tempScores.player1 !== players.player1.score || tempScores.player2 !== players.player2.score) {
      onScoresUpdate(tempScores);
    }
  }, [editingScores]);

  return (
    <div className="mb-6 w-full">
      <div className="flex flex-row items-stretch gap-4 w-full">
        {/* Player Score Boxes - Always vertical, responsive width */}
        <div className="flex flex-col gap-3 w-full max-w-[15%] sm:max-w-[35%]">
          <div className={`flex flex-col items-center justify-center w-full h-16 md:h-20 rounded-lg transition-all border-2 ${
            currentPlayer === 1 ? 'bg-blue-100 border-blue-400' : 'bg-gray-50 border-gray-300'
          }`}>
            <h2 className="text-xs font-semibold text-gray-700 truncate leading-tight">{players.player1.name}</h2>
            {editingScores ? (
              <input
                type="number"
                value={tempScores.player1}
                onChange={(e) => setTempScores(prev => ({ ...prev, player1: parseInt(e.target.value) || 0 }))}
                className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 bg-transparent text-center w-full border-none outline-none"
              />
            ) : (
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">{players.player1.score}</div>
            )}
          </div>
          <div className={`flex flex-col items-center justify-center w-full h-16 md:h-20 rounded-lg transition-all border-2 ${
            currentPlayer === 2 ? 'bg-purple-100 border-purple-400' : 'bg-gray-50 border-gray-300'
          }`}>
            <h2 className="text-xs font-semibold text-gray-700 truncate leading-tight">{players.player2.name}</h2>
            {editingScores ? (
              <input
                type="number"
                value={tempScores.player2}
                onChange={(e) => setTempScores(prev => ({ ...prev, player2: parseInt(e.target.value) || 0 }))}
                className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600 bg-transparent text-center w-full border-none outline-none"
              />
            ) : (
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">{players.player2.score}</div>
            )}
          </div>
        </div>

        {/* Enhanced Current Word Display to the Right */}
        <div className="flex-1 w-full">
          <div className={`p-3 rounded-lg border-2 h-full flex flex-col justify-center ${
            currentPlayer === 1 
              ? 'bg-blue-50 border-blue-200 text-blue-800' 
              : 'bg-purple-50 border-purple-200 text-purple-800'
          }`}>
            {currentWord && currentPoints !== undefined ? (
              <>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold">{currentWord}</div>
                    {/* Speaker Icon immediately after word */}
                    {validationResult?.pronunciation && (
                      <button
                        onClick={() => {
                          if ('speechSynthesis' in window) {
                            const utterance = new SpeechSynthesisUtterance(currentWord);
                            utterance.rate = 0.8;
                            speechSynthesis.speak(utterance);
                          }
                        }}
                        className="p-1 rounded-full hover:bg-white/50 transition-colors"
                        title="Pronounce word"
                      >
                        🔊
                      </button>
                    )}
                  </div>
                  <div className="font-bold text-lg">{currentPoints} points</div>
                </div>
                
                {validationResult && (
                  <div className="space-y-1 text-sm">
                    {/* Pronunciation and Part of Speech */}
                    {(validationResult.pronunciation || validationResult.partOfSpeech) && (
                      <div className="flex items-center gap-2 text-xs opacity-75">
                        {validationResult.pronunciation && (
                          <span className="font-mono bg-white/50 px-2 py-1 rounded">
                            {validationResult.pronunciation}
                          </span>
                        )}
                        {validationResult.partOfSpeech && (
                          <span className="italic">
                            {validationResult.partOfSpeech}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Definition */}
                    {validationResult.definition && (
                      <div className="text-xs opacity-90 line-clamp-2">
                        {validationResult.definition}
                      </div>
                    )}
                    
                    {/* Etymology/Origin */}
                    {validationResult.origin && (
                      <div className="text-xs opacity-75 italic">
                        Origin: {validationResult.origin.length > 50 
                          ? `${validationResult.origin.substring(0, 50)}...` 
                          : validationResult.origin}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Placeholder content when no word */
              <div className="text-center py-4">
                <div className="text-sm font-medium mb-2">📚 Word Information</div>
                <div className="text-xs opacity-60">
                  Type letters in the tiles below to see word definitions, pronunciation, and etymology
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScoreDisplay;

