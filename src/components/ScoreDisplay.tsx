import React, { useState } from 'react';
import { Edit3, Save, X, ArrowRightLeft } from 'lucide-react';
import { Player, ValidationResult } from '../types/game';
import TileDistributionModal from './TileDistributionModal';

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
  canSwitchTurn = true
}) => {
  const [editingScores, setEditingScores] = useState(false);
  const [showTileModal, setShowTileModal] = useState(false);
  const [tempScores, setTempScores] = useState({
    player1: players.player1.score,
    player2: players.player2.score
  });

  const startEditingScores = () => {
    setTempScores({
      player1: players.player1.score,
      player2: players.player2.score
    });
    setEditingScores(true);
  };

  const saveScores = () => {
    onScoresUpdate(tempScores);
    setEditingScores(false);
  };

  const cancelEditingScores = () => {
    setTempScores({
      player1: players.player1.score,
      player2: players.player2.score
    });
    setEditingScores(false);
  };

  return (
    <div className="mb-6 flex items-center gap-4">
      {/* Compact Score Display with Current Word to the Right */}
      <div className="flex items-center gap-4 flex-1">
        {/* Narrower Score Boxes */}
        <div className="flex gap-3">
          <div className={`text-center p-3 rounded-lg transition-all min-w-0 ${
            currentPlayer === 1 ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gray-50'
          }`}>
            <h2 className="text-sm font-semibold text-gray-700 truncate">{players.player1.name}</h2>
            {editingScores ? (
              <input
                type="number"
                value={tempScores.player1}
                onChange={(e) => setTempScores(prev => ({ ...prev, player1: parseInt(e.target.value) || 0 }))}
                className="text-2xl font-bold text-blue-600 bg-transparent border-b-2 border-blue-300 text-center w-16 mx-auto"
              />
            ) : (
              <div className="text-2xl font-bold text-blue-600">{players.player1.score}</div>
            )}
          </div>
          <div className={`text-center p-3 rounded-lg transition-all min-w-0 ${
            currentPlayer === 2 ? 'bg-purple-100 border-2 border-purple-400' : 'bg-gray-50'
          }`}>
            <h2 className="text-sm font-semibold text-gray-700 truncate">{players.player2.name}</h2>
            {editingScores ? (
              <input
                type="number"
                value={tempScores.player2}
                onChange={(e) => setTempScores(prev => ({ ...prev, player2: parseInt(e.target.value) || 0 }))}
                className="text-2xl font-bold text-purple-600 bg-transparent border-b-2 border-purple-300 text-center w-16 mx-auto"
              />
            ) : (
              <div className="text-2xl font-bold text-purple-600">{players.player2.score}</div>
            )}
          </div>
        </div>

        {/* Enhanced Current Word Display to the Right */}
        <div className="flex-1">
          {currentWord && currentPoints !== undefined && (
            <div className={`p-3 rounded-lg border-2 ${
              currentPlayer === 1 
                ? 'bg-blue-50 border-blue-200 text-blue-800' 
                : 'bg-purple-50 border-purple-200 text-purple-800'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-bold">{currentWord}</div>
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
            </div>
          )}
        </div>

      </div>
      
      {/* Right-justified Controls */}
      <div className="flex-shrink-0 flex flex-col gap-2 items-end">
        {/* Tile Distribution Pill */}
        <button 
          onClick={() => setShowTileModal(true)}
          className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border hover:bg-gray-50 transition-colors cursor-pointer"
          title="View remaining tiles"
        >
          📦 {98 - 14 - usedTiles} left
        </button>
        
        {/* Edit Button */}
        {editingScores ? (
          <div className="flex gap-1">
            <button
              onClick={saveScores}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Save scores"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={cancelEditingScores}
              className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              title="Cancel editing"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={startEditingScores}
            className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            title="Edit scores"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
        
        {/* Switch Player Button */}
        {onSwitchTurn && (
          <button
            onClick={onSwitchTurn}
            disabled={!canSwitchTurn}
            className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
            title="Switch turn"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Tile Distribution Modal */}
      <TileDistributionModal 
        isOpen={showTileModal} 
        onClose={() => setShowTileModal(false)} 
      />
    </div>
  );
};

export default ScoreDisplay;

