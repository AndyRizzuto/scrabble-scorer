import React, { useState } from 'react';
import { Users, BarChart3, RotateCcw } from 'lucide-react';
import { 
  Player, 
  SetupData, 
  WordEntry, 
  GameHistoryEntry, 
  BonusMultipliers 
} from '../types/game';
import { calculateWordValue, calculateBonusPoints } from '../utils/scoring';
import GameSetup from './GameSetup';
import ScoreDisplay from './ScoreDisplay';
import TurnManager from './TurnManager';
import TileGrid from './TileGrid';
import MultiWordTurn from './MultiWordTurn';

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
  const [showMultiWordMode, setShowMultiWordMode] = useState(false);
  
  // Simplified state for tile-based input
  // All word input logic is now handled by TileGrid component
  
  // UI state
  const [showSetupModal, setShowSetupModal] = useState(true);
  const [currentPage, setCurrentPage] = useState<'game' | 'timeline'>('game');

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

  // Simplified handlers for tile-based input
  const handleAddWord = (word: string, points: number) => {
    if (showMultiWordMode) {
      // Add to current turn
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
    } else {
      // Direct score addition
      const playerKey = `player${currentPlayer}` as const;
      setPlayers(prev => ({
        ...prev,
        [playerKey]: {
          ...prev[playerKey],
          score: prev[playerKey].score + points
        }
      }));
      
      // Add to history
      setGameHistory(prev => [...prev, {
        player: currentPlayer,
        word: word.toUpperCase(),
        points,
        time: new Date().toLocaleTimeString()
      }]);
      
      // Switch to next player
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  const handleClearTiles = () => {
    // TileGrid handles its own clearing
  };


  const removeWordFromTurn = (index: number) => {
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
    setShowMultiWordMode(false);
    
    // Switch to next player
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };


  const resetGame = () => {
    setPlayers({
      player1: { id: 1, name: 'Andrew', score: 0 },
      player2: { id: 2, name: 'Carla', score: 0 }
    });
    setCurrentPlayer(1);
    setGameHistory([]);
    setCurrentTurnWords([]);
    setShowMultiWordMode(false);
    setShowSetupModal(true);
  };

  const switchTurn = () => {
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };

  const toggleMultiWordMode = () => {
    setShowMultiWordMode(!showMultiWordMode);
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
          <p className="text-gray-600">Two-player scoring with word validation</p>
        </div>

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
            <ScoreDisplay
              players={players}
              currentPlayer={currentPlayer}
              onScoresUpdate={handleScoresUpdate}
            />

            <TurnManager
              players={players}
              currentPlayer={currentPlayer}
              showMultiWordMode={showMultiWordMode}
              currentTurnWords={currentTurnWords}
              onSwitchTurn={switchTurn}
              onToggleMultiWordMode={toggleMultiWordMode}
            />

            {showMultiWordMode && (
              <MultiWordTurn
                currentTurnWords={currentTurnWords}
                onRemoveWord={removeWordFromTurn}
                getTurnTotal={getTurnTotal}
              />
            )}

            <TileGrid
              onAddWord={handleAddWord}
              onClear={handleClearTiles}
            />

            {/* Multi-word turn completion */}
            {showMultiWordMode && currentTurnWords.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={completeTurn}
                  className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors text-lg"
                >
                  Complete Turn ({getTurnTotal()} points)
                </button>
              </div>
            )}

            {/* Reset Game Button */}
            <div className="mt-6">
              <button
                onClick={resetGame}
                className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Game
              </button>
            </div>

            {/* Game History */}
            {gameHistory.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-700 mb-4">Recent Plays</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {gameHistory.slice(-10).reverse().map((entry, index) => (
                    <div key={index} className={`flex justify-between items-center p-2 rounded text-sm ${
                      entry.isTurnSummary ? 'bg-green-100 border border-green-300' : 'bg-gray-50'
                    }`}>
                      <span className={`font-medium ${
                        entry.player === 1 ? 'text-blue-600' : 'text-purple-600'
                      }`}>
                        {players[`player${entry.player}`].name}
                      </span>
                      <span className={`font-mono ${entry.isTurnSummary ? 'text-xs' : ''}`}>
                        {entry.word}
                      </span>
                      <span className="font-semibold">+{entry.points}</span>
                      <span className="text-gray-500 text-xs">{entry.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrabbleScorer;

