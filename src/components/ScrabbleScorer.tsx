import React, { useState } from 'react';
import { Users, BarChart3, RotateCcw, Edit3, ArrowRightLeft } from 'lucide-react';
import { 
  Player, 
  SetupData, 
  WordEntry, 
  GameHistoryEntry, 
  BonusMultipliers,
  ValidationResult 
} from '../types/game';
import { calculateWordValue, calculateBonusPoints } from '../utils/scoring';
import GameSetup from './GameSetup';
import ScoreDisplay from './ScoreDisplay';
import TurnManager from './TurnManager';
import TileGrid from './TileGrid';
import MultiWordTurn from './MultiWordTurn';
import TileDistributionModal from './TileDistributionModal';

const ScrabbleScorer: React.FC = () => {
  // Player and game state
  const [players, setPlayers] = useState<{
    player1: Player;
    player2: Player;
  }>({
    player1: { id: 1, name: 'Andrew', score: 0 },
    player2: { id: 2, name: 'Carla', score: 0 }
  });
  
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [currentTurnWords, setCurrentTurnWords] = useState<WordEntry[]>([]);
  
  // Current word/points state for display
  const [currentWord, setCurrentWord] = useState('');
  const [currentPoints, setCurrentPoints] = useState(0);
  const [usedTiles, setUsedTiles] = useState(0);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
  // UI state
  const [showSetupModal, setShowSetupModal] = useState(true);
  const [currentPage, setCurrentPage] = useState<'game' | 'timeline'>('game');
  const [selectedWordDefinition, setSelectedWordDefinition] = useState<{word: string; definition?: string} | null>(null);
  const [restoreToTiles, setRestoreToTiles] = useState<string>('');
  const [editingScores, setEditingScores] = useState(false);
  const [showTileModal, setShowTileModal] = useState(false);

  // Handlers
  const handleSetupSubmit = (data: SetupData) => {
    setPlayers({
      player1: { id: 1, name: data.player1Name, score: data.player1Score },
      player2: { id: 2, name: data.player2Name, score: data.player2Score }
    });
    setShowSetupModal(false);
  };

  const handleScoresUpdate = (scores: { player1: number; player2: number }) => {
    setPlayers(prev => ({
      player1: { ...prev.player1, score: scores.player1 },
      player2: { ...prev.player2, score: scores.player2 }
    }));
  };

  // Always add words to current turn (word shelf approach)
  const handleAddWord = (word: string, points: number) => {
    const newWord: WordEntry = {
      word: word.toUpperCase(),
      basePoints: calculateWordValue(word),
      bonusPoints: points,
      finalPoints: points,
      bonuses: { letterMultiplier: 1, wordMultiplier: 1 }, // TileGrid handles this internally
      letterMultipliers: [], // TileGrid handles this internally
      bingoBonus: false, // TileGrid handles this internally
      tilesUsed: word.length
    };
    setCurrentTurnWords(prev => [...prev, newWord]);
  };

  const handleClearTiles = () => {
    // TileGrid handles its own clearing
  };


  const removeWordFromTurn = (index: number) => {
    const wordToRestore = currentTurnWords[index];
    if (wordToRestore) {
      // Restore the word to tiles
      setRestoreToTiles(wordToRestore.word);
      // Clear the restore state after a short delay to allow the effect to trigger
      setTimeout(() => setRestoreToTiles(''), 100);
    }
    // Remove the word from the turn
    setCurrentTurnWords(prev => prev.filter((_, i) => i !== index));
  };

  const getTurnTotal = () => {
    return currentTurnWords.reduce((sum, wordEntry) => sum + wordEntry.finalPoints, 0);
  };

  const completeTurn = () => {
    if (currentTurnWords.length === 0) return;
    
    const totalPoints = getTurnTotal();
    const playerKey = `player${currentPlayer}` as const;
    
    setPlayers(prev => ({
      ...prev,
      [playerKey]: {
        ...prev[playerKey],
        score: prev[playerKey].score + totalPoints
      }
    }));

    // Add each word to history
    currentTurnWords.forEach(wordEntry => {
      setGameHistory(prev => [...prev, {
        player: currentPlayer,
        word: wordEntry.word,
        points: wordEntry.finalPoints,
        time: new Date().toLocaleTimeString(),
        bonuses: wordEntry.bonuses
      }]);
    });

    // Add turn summary to history if multiple words
    if (currentTurnWords.length > 1) {
      setGameHistory(prev => [...prev, {
        player: currentPlayer,
        word: `TURN TOTAL (${currentTurnWords.length} words)`,
        points: totalPoints,
        time: new Date().toLocaleTimeString(),
        isTurnSummary: true
      }]);
    }

    // Reset turn
    setCurrentTurnWords([]);
    
    // Switch to next player
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };

  const handleWordClick = (word: string, definition?: string) => {
    setSelectedWordDefinition({ word, definition });
  };

  const handleToggleEditScores = () => {
    setEditingScores(!editingScores);
  };


  const resetGame = () => {
    if (confirm('Are you sure you want to reset the game? This will clear all scores and history.')) {
      setPlayers({
        player1: { id: 1, name: 'Andrew', score: 0 },
        player2: { id: 2, name: 'Carla', score: 0 }
      });
      setCurrentPlayer(1);
      setGameHistory([]);
      setCurrentTurnWords([]);
      setShowSetupModal(true);
    }
  };

  const switchTurn = () => {
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Setup Modal */}
      {showSetupModal && (
        <GameSetup onSetupSubmit={handleSetupSubmit} />
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="text-blue-600" />
              Scrabble Score Keeper
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage('game')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'game' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Game
              </button>
              <button
                onClick={() => setCurrentPage('timeline')}
                disabled={gameHistory.length === 0}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  currentPage === 'timeline' 
                    ? 'bg-purple-600 text-white' 
                    : gameHistory.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Timeline
              </button>
            </div>
          </div>
          
          {/* Header Controls Row */}
          <div className="flex items-center justify-center gap-4 mb-4">
            {/* Edit Score Button */}
            <button
              onClick={handleToggleEditScores}
              className={`p-3 rounded-lg transition-colors ${
                editingScores 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              } text-white`}
              title={editingScores ? 'Save scores' : 'Edit scores'}
            >
              <Edit3 className="w-5 h-5" />
            </button>
            
            {/* Switch Player Button */}
            <button
              onClick={switchTurn}
              disabled={currentTurnWords.length > 0}
              className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
              title="Switch turn"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
            
            {/* Tile Distribution Pill - Double Height */}
            <button 
              onClick={() => setShowTileModal(true)}
              className="text-base text-gray-600 bg-white px-6 py-3 rounded-full border hover:bg-gray-50 transition-colors cursor-pointer h-12 flex items-center"
              title="View remaining tiles"
            >
              📦 {98 - 14 - usedTiles} tiles left
            </button>
          </div>
        </div>

        {/* Always Show Score Display */}
        <ScoreDisplay
          players={players}
          currentPlayer={currentPlayer}
          onScoresUpdate={handleScoresUpdate}
          currentWord={currentWord}
          currentPoints={currentPoints}
          validationResult={validationResult}
          usedTiles={usedTiles}
          onSwitchTurn={switchTurn}
          canSwitchTurn={currentTurnWords.length === 0}
          editingScores={editingScores}
        />

        {currentPage === 'timeline' ? (
          // Timeline Page (simplified for now - could be extracted to separate component)
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Timeline</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-700">{players.player1.name}</h3>
                  <div className="text-2xl font-bold text-blue-600">{players.player1.score}</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-700">{players.player2.name}</h3>
                  <div className="text-2xl font-bold text-purple-600">{players.player2.score}</div>
                </div>
              </div>
            </div>

            {gameHistory.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No games played yet. Start playing to see the timeline!</p>
              </div>
            )}
          </div>
        ) : (
          // Game Page
          <div>
            <TileGrid
              onAddWord={handleAddWord}
              onClear={handleClearTiles}
              onWordChange={(word, points, tiles) => {
                setCurrentWord(word);
                setCurrentPoints(points);
                setUsedTiles(tiles || 0);
              }}
              onValidationChange={setValidationResult}
              recentPlays={gameHistory}
              players={{
                player1: { name: players.player1.name },
                player2: { name: players.player2.name }
              }}
              onResetGame={resetGame}
              currentTurnWords={currentTurnWords.map(w => ({
                word: w.word,
                points: w.finalPoints,
                definition: validationResult?.definition
              }))}
              onRemoveWord={removeWordFromTurn}
              onWordClick={handleWordClick}
              restoreToTiles={restoreToTiles}
            />

            {/* Complete Turn Button */}
            {currentTurnWords.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={completeTurn}
                  className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors text-lg"
                >
                  Complete Turn ({getTurnTotal()} points)
                </button>
              </div>
            )}


          </div>
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

export default ScrabbleScorer;

