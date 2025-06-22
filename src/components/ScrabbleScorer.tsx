import React, { useState } from 'react';
import { Users, BarChart3, RotateCcw, Edit3, ArrowRightLeft, Trophy, CheckCircle } from 'lucide-react';
import { 
  Player, 
  SetupData, 
  WordEntry, 
  GameHistoryEntry, 
  BonusMultipliers,
  ValidationResult,
  Game,
  GameStatus 
} from '../types/game';
import { calculateWordValue, calculateBonusPoints } from '../utils/scoring';
import GameSetup from './GameSetup';
import ScoreDisplay from './ScoreDisplay';
import TurnManager from './TurnManager';
import TileGrid from './TileGrid';
import MultiWordTurn from './MultiWordTurn';
import TileDistributionModal from './TileDistributionModal';
import TurnTimer from './TurnTimer';
import Timeline from './Timeline';

const ResponsiveTimer: React.FC<{ 
  isActive: boolean; 
  onTimerExpired?: () => void;
  onTimerPaused?: () => void;
  currentPlayer: 1 | 2;
  turnStartTime?: number;
}> = ({ isActive, onTimerExpired, onTimerPaused, currentPlayer, turnStartTime }) => {
  const [collapsed, setCollapsed] = React.useState(true);
  
  return (
    <div className="flex items-center gap-2">
      {collapsed ? (
        <button
          className="flex items-center px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          onClick={() => setCollapsed(false)}
          aria-label="Expand timer"
        >
          <span className="text-lg">⏱️</span>
        </button>
      ) : (
        <div onClick={() => setCollapsed(true)} className="cursor-pointer">
          <TurnTimer 
            isActive={isActive} 
            onTimerExpired={onTimerExpired}
            onTimerPaused={onTimerPaused}
            currentPlayer={currentPlayer}
            turnStartTime={turnStartTime}
          />
        </div>
      )}
    </div>
  );
};

const ScrabbleScorer: React.FC = () => {
  // Game management state
  const [games, setGames] = useState<Game[]>([]);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  
  // Get current game or create empty structure
  const currentGame = games.find(g => g.id === currentGameId) || {
    id: '',
    status: 'active' as GameStatus,
    startTime: Date.now(),
    pausedTime: 0,
    currentTurnStartTime: Date.now(),
    players: {
      player1: { id: 1, name: 'Andrew', score: 0 },
      player2: { id: 2, name: 'Carla', score: 0 }
    },
    currentPlayer: 1 as 1 | 2,
    gameHistory: [],
    currentTurnWords: [],
    tilesRemaining: 98
  };
  
  // Legacy state for backward compatibility (derived from currentGame)
  const players = currentGame.players;
  const currentPlayer = currentGame.currentPlayer;
  const gameHistory = currentGame.gameHistory;
  const currentTurnWords = currentGame.currentTurnWords;
  
  // Game wins tracking - Preloaded with test data
  const generateTestData = () => {
    const now = Date.now();
    const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000);
    const threeWeeksAgo = now - (21 * 24 * 60 * 60 * 1000);
    
    // Generate 10 wins for Carla (player2) across 6 random days in last 3 weeks
    const carlaWins = [];
    const daysWithGames = [];
    
    // Pick 6 random days in the last 3 weeks
    for (let i = 0; i < 6; i++) {
      const randomDay = Math.floor(Math.random() * 21); // 0-20 days ago
      const dayTimestamp = now - (randomDay * 24 * 60 * 60 * 1000);
      daysWithGames.push(dayTimestamp);
    }
    
    // Distribute 10 wins across these 6 days
    const winsPerDay = [2, 2, 2, 1, 2, 1]; // Adds up to 10
    daysWithGames.forEach((dayTimestamp, index) => {
      for (let j = 0; j < winsPerDay[index]; j++) {
        // Add some random hours/minutes to spread games throughout the day
        const gameTime = dayTimestamp + (Math.random() * 12 * 60 * 60 * 1000); // Random time within 12 hours
        carlaWins.push(gameTime);
      }
    });
    
    // Add 2 wins for Andrew (player1) on different days
    const andrewWins = [];
    // Andrew's first win - 5 days ago
    const andrewWin1 = now - (5 * 24 * 60 * 60 * 1000) + (Math.random() * 12 * 60 * 60 * 1000);
    andrewWins.push(andrewWin1);
    
    // Andrew's second win - 12 days ago
    const andrewWin2 = now - (12 * 24 * 60 * 60 * 1000) + (Math.random() * 12 * 60 * 60 * 1000);
    andrewWins.push(andrewWin2);
    
    return {
      player1: andrewWins.sort((a, b) => a - b), // Andrew has 2 wins
      player2: carlaWins.sort((a, b) => a - b) // Sort chronologically
    };
  };
  
  const [gameWins, setGameWins] = useState<{
    player1: number[];
    player2: number[];
  }>(generateTestData());
  
  // Current word/points state for display
  const [currentWord, setCurrentWord] = useState('');
  const [currentPoints, setCurrentPoints] = useState(0);
  const [usedTiles, setUsedTiles] = useState(0);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
  // UI state
  const [showSetupModal, setShowSetupModal] = useState(true);
  const [currentPage, setCurrentPage] = useState<'game' | 'score' | 'timeline'>('timeline');
  
  // Handle page changes with game status management
  const handlePageChange = (page: 'game' | 'score' | 'timeline') => {
    // Pause current game when leaving game page
    if (currentGameId && currentGame.status === 'active' && currentPage === 'game' && page !== 'game') {
      setGameStatus(currentGameId, 'paused');
    }
    
    // Resume game when returning to game page (only if navigating from timeline)
    if (currentGameId && currentGame.status === 'paused' && page === 'game') {
      setGameStatus(currentGameId, 'active');
    }
    
    setCurrentPage(page);
  };
  const [selectedWordDefinition, setSelectedWordDefinition] = useState<{word: string; definition?: string} | null>(null);
  const [restoreToTiles, setRestoreToTiles] = useState<string>('');
  const [restoreMultipliers, setRestoreMultipliers] = useState<{
    letterMultipliers: number[];
    wordMultiplier: number;
  } | null>(null);
  const [editingScores, setEditingScores] = useState(false);
  const [showTileModal, setShowTileModal] = useState(false);

  // Handlers
  const handleSetupSubmit = (data: SetupData) => {
    const newGame = createNewGame(data);
    setGames(prev => [...prev, newGame]);
    setCurrentGameId(newGame.id);
    setShowSetupModal(false);
  };

  const handleScoresUpdate = (scores: { player1: number; player2: number }) => {
    updateCurrentGame({
      players: {
        player1: { ...currentGame.players.player1, score: scores.player1 },
        player2: { ...currentGame.players.player2, score: scores.player2 }
      }
    });
  };

  // Always add words to current turn (word shelf approach)
  const handleAddWord = (word: string, points: number, wordData?: Partial<WordEntry>) => {
    const newWord: WordEntry = {
      word: word.toUpperCase(),
      basePoints: wordData?.basePoints || calculateWordValue(word),
      bonusPoints: wordData?.bonusPoints || (points - calculateWordValue(word)),
      finalPoints: points,
      bonuses: wordData?.bonuses || { letterMultiplier: 1, wordMultiplier: 1 },
      letterMultipliers: wordData?.letterMultipliers || [],
      bingoBonus: wordData?.bingoBonus || false,
      tilesUsed: word.length
    };
    updateCurrentGame({
      currentTurnWords: [...currentGame.currentTurnWords, newWord]
    });
  };

  const handleClearTiles = () => {
    // TileGrid handles its own clearing
  };


  const removeWordFromTurn = (index: number, currentWordInfo?: {word: string, points: number, isValid: boolean}) => {
    const wordToRestore = currentTurnWords[index];
    
    // If there's a valid current word, add it to shelf before removing the pill word
    if (currentWordInfo && currentWordInfo.isValid && currentWordInfo.word && currentWordInfo.points > 0) {
      const newWordEntry: WordEntry = {
        word: currentWordInfo.word.toUpperCase(),
        basePoints: calculateWordValue(currentWordInfo.word),
        bonusPoints: currentWordInfo.points,
        finalPoints: currentWordInfo.points,
        bonuses: { letterMultiplier: 1, wordMultiplier: 1 }, // Will be updated by TileGrid
        letterMultipliers: [], // Will be updated by TileGrid
        bingoBonus: false, // Will be updated by TileGrid
        tilesUsed: currentWordInfo.word.length
      };
      
      // Add current word to shelf
      updateCurrentGame({
        currentTurnWords: [...currentGame.currentTurnWords, newWordEntry]
      });
    }
    
    if (wordToRestore) {
      // Restore the word to tiles with full multiplier data
      setRestoreToTiles(wordToRestore.word);
      setRestoreMultipliers({
        letterMultipliers: wordToRestore.letterMultipliers,
        wordMultiplier: wordToRestore.bonuses.wordMultiplier
      });
      // Clear the restore state after a short delay to allow the effect to trigger
      setTimeout(() => {
        setRestoreToTiles('');
        setRestoreMultipliers(null);
      }, 100);
    }
    
    // Remove the word from the turn (with slight delay to allow current word to be added first)
    setTimeout(() => {
      updateCurrentGame({
        currentTurnWords: currentGame.currentTurnWords.filter((_, i) => i !== index)
      });
    }, 50);
  };

  const getTurnTotal = () => {
    return currentTurnWords.reduce((sum, wordEntry) => sum + wordEntry.finalPoints, 0);
  };

  const completeTurn = () => {
    if (currentTurnWords.length === 0) return;
    
    const totalPoints = getTurnTotal();
    const playerKey = `player${currentPlayer}` as const;
    
    // Create new word entries for history
    const newHistoryEntries: GameHistoryEntry[] = [];
    
    // Add each word to history
    currentTurnWords.forEach(wordEntry => {
      newHistoryEntries.push({
        player: currentPlayer,
        word: wordEntry.word,
        points: wordEntry.finalPoints,
        time: new Date().toISOString(),
        bonuses: wordEntry.bonuses,
        letterMultipliers: wordEntry.letterMultipliers,
        bingoBonus: wordEntry.bingoBonus,
        basePoints: wordEntry.basePoints
      });
    });

    // Add turn summary to history if multiple words
    if (currentTurnWords.length > 1) {
      newHistoryEntries.push({
        player: currentPlayer,
        word: `TURN TOTAL (${currentTurnWords.length} words)`,
        points: totalPoints,
        time: new Date().toISOString(),
        isTurnSummary: true
      });
    }
    
    // Update the current game
    updateCurrentGame({
      players: {
        ...currentGame.players,
        [playerKey]: {
          ...currentGame.players[playerKey],
          score: currentGame.players[playerKey].score + totalPoints
        }
      },
      gameHistory: [...currentGame.gameHistory, ...newHistoryEntries],
      currentTurnWords: [],
      currentPlayer: currentPlayer === 1 ? 2 : 1
    });
    
    setTimerActive(true);
  };

  const handleWordClick = (word: string, definition?: string) => {
    setSelectedWordDefinition({ word, definition });
  };

  const handleToggleEditScores = () => {
    setEditingScores(!editingScores);
  };


  const undoTurn = (turnIndex: number) => {
    if (!confirm('Undo this turn? This will restore the words to your tiles and reverse the score changes.')) {
      return;
    }
    
    // Group history entries by turns (like in TileGrid)
    const turns: Array<{player: number, entries: typeof gameHistory}> = [];
    let currentTurn: {player: number, entries: typeof gameHistory} | null = null;
    
    [...gameHistory].reverse().forEach(entry => {
      if (entry.isTurnSummary) return;
      
      if (!currentTurn || currentTurn.player !== entry.player) {
        if (currentTurn) turns.push(currentTurn);
        currentTurn = {
          player: entry.player,
          entries: [entry]
        };
      } else {
        currentTurn.entries.push(entry);
      }
    });
    
    if (currentTurn) turns.push(currentTurn);
    
    // Get the turn to undo
    const turnToUndo = turns[turnIndex];
    if (!turnToUndo) return;
    
    // Calculate score to subtract
    const scoreToSubtract = turnToUndo.entries.reduce((sum, entry) => sum + entry.points, 0);
    
    // Remove turn entries from history
    const entriesToRemove = new Set(turnToUndo.entries);
    const newHistory = gameHistory.filter(entry => !entriesToRemove.has(entry));
    
    // Update player score
    const playerKey = `player${turnToUndo.player}` as 'player1' | 'player2';
    const newPlayers = {
      ...currentGame.players,
      [playerKey]: {
        ...currentGame.players[playerKey],
        score: Math.max(0, currentGame.players[playerKey].score - scoreToSubtract)
      }
    };
    
    // Restore words: all but last to shelf, last to tiles
    const wordsToRestore = turnToUndo.entries.map(entry => ({
      word: entry.word,
      basePoints: entry.basePoints || calculateWordValue(entry.word),
      bonusPoints: entry.points - (entry.basePoints || calculateWordValue(entry.word)),
      finalPoints: entry.points,
      bonuses: entry.bonuses || { letterMultiplier: 1, wordMultiplier: 1 },
      letterMultipliers: entry.letterMultipliers || [],
      bingoBonus: entry.bingoBonus || false,
      tilesUsed: entry.word.length
    }));
    
    // Restore all words except the last to current turn shelf
    const wordsForShelf = wordsToRestore.slice(0, -1);
    const lastWord = wordsToRestore[wordsToRestore.length - 1];
    
    // Restore last word to tiles
    if (lastWord) {
      setRestoreToTiles(lastWord.word);
      setRestoreMultipliers({
        letterMultipliers: lastWord.letterMultipliers,
        wordMultiplier: lastWord.bonuses.wordMultiplier
      });
      setTimeout(() => {
        setRestoreToTiles('');
        setRestoreMultipliers(null);
      }, 100);
    }
    
    // Update game state
    updateCurrentGame({
      gameHistory: newHistory,
      players: newPlayers,
      currentPlayer: turnToUndo.player as 1 | 2,  // Switch back to the player who played that turn
      currentTurnWords: wordsForShelf  // Restore other words to shelf
    });
  };

  const resetGame = () => {
    if (confirm('Are you sure you want to reset the game? This will clear all scores and history.')) {
      // Determine winner before resetting
      if (players.player1.score > 0 || players.player2.score > 0) {
        const winner = players.player1.score > players.player2.score ? 1 : 
                      players.player2.score > players.player1.score ? 2 : null;
        
        if (winner) {
          const now = Date.now();
          setGameWins(prev => ({
            ...prev,
            [`player${winner}`]: [...prev[`player${winner}` as keyof typeof prev], now]
          }));
        }
      }
      
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

  const handleCreateGame = () => {
    setCurrentPage('game');
    setShowSetupModal(true);
  };

  const handleCloseSetup = () => {
    setShowSetupModal(false);
    // If no active game, go to timeline
    if (!hasCurrentGame) {
      setCurrentPage('timeline');
    }
  };

  const handleGameClick = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;
    
    // Set this game as current
    setCurrentGameId(gameId);
    
    // Handle interaction based on game status:
    if (game.status === 'final') {
      // Final games: make current and go to score sheet
      handlePageChange('score');
    } else if (game.status === 'paused') {
      // Paused games: make current, set to active, go to game tab
      setGameStatus(gameId, 'active');
      handlePageChange('game');
    } else if (game.status === 'active') {
      // Active games: go to game tab
      handlePageChange('game');
    }
  };

  // Game management functions
  const createNewGame = (setupData: SetupData): Game => {
    const gameId = `game-${Date.now()}`;
    const now = Date.now();
    const newGame: Game = {
      id: gameId,
      status: 'active',
      startTime: now,
      pausedTime: 0,
      currentTurnStartTime: now,
      players: {
        player1: { id: 1, name: setupData.player1Name, score: setupData.player1Score },
        player2: { id: 2, name: setupData.player2Name, score: setupData.player2Score }
      },
      currentPlayer: 1,
      gameHistory: [],
      currentTurnWords: [],
      tilesRemaining: 98
    };
    return newGame;
  };

  const updateCurrentGame = (updates: Partial<Game>) => {
    if (!currentGameId) return;
    setGames(prev => prev.map(game => 
      game.id === currentGameId 
        ? { ...game, ...updates }
        : game
    ));
  };

  const setGameStatus = (gameId: string, status: GameStatus) => {
    setGames(prev => prev.map(game => {
      if (game.id === gameId) {
        const now = Date.now();
        const updates: Partial<Game> = { status };
        
        if (status === 'paused' && game.status === 'active') {
          // Starting a pause
          updates.lastPauseStart = now;
        } else if (status === 'active' && game.status === 'paused') {
          // Resuming from pause
          if (game.lastPauseStart) {
            updates.pausedTime = game.pausedTime + (now - game.lastPauseStart);
            updates.lastPauseStart = undefined;
          }
        } else if (status === 'final') {
          // Finalizing game
          updates.endTime = now;
          
          // Add any remaining pause time
          if (game.status === 'paused' && game.lastPauseStart) {
            updates.pausedTime = game.pausedTime + (now - game.lastPauseStart);
            updates.lastPauseStart = undefined;
          }
          
          // Determine winner
          if (game.players.player1.score > game.players.player2.score) {
            updates.winner = 1;
          } else if (game.players.player2.score > game.players.player1.score) {
            updates.winner = 2;
          } else {
            updates.winner = null;
          }
        }
        
        return { ...game, ...updates };
      }
      return game;
    }));
  };

  // Legacy function for Timeline component - calculates active play time
  const getGameDurationForTimeline = (game: Game): number => {
    const now = Date.now();
    let endTime = game.endTime || now;
    
    // If game is currently paused, add current pause time
    let totalPausedTime = game.pausedTime;
    if (game.status === 'paused' && game.lastPauseStart) {
      totalPausedTime += (now - game.lastPauseStart);
    }
    
    return endTime - game.startTime - totalPausedTime;
  };
  
  // Format duration in minutes and seconds
  const formatDuration = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Timer calculation helpers
  const getCurrentTurnDuration = (game: Game): number => {
    if (!game.currentTurnStartTime) return 0;
    return Date.now() - game.currentTurnStartTime;
  };

  const getGameTimer = (game: Game): number => {
    // Active playing time (excluding paused time)
    const totalGameTime = Date.now() - game.startTime;
    let currentPausedTime = game.pausedTime;
    
    // Add current pause duration if game is currently paused
    if (game.status === 'paused' && game.lastPauseStart) {
      currentPausedTime += Date.now() - game.lastPauseStart;
    }
    
    return Math.max(0, totalGameTime - currentPausedTime);
  };

  const getGameDuration = (game: Game): number => {
    // Total time from start to finish (including paused time)
    if (game.endTime) {
      return game.endTime - game.startTime;
    }
    return Date.now() - game.startTime;
  };

  const hasExistingGames = gameWins.player1.length > 0 || gameWins.player2.length > 0;
  const hasCurrentGame = currentGameId && games.some(g => g.id === currentGameId);
  const isCurrentGameFinal = currentGame.status === 'final';

  const switchTurn = () => {
    updateCurrentGame({
      currentPlayer: currentPlayer === 1 ? 2 : 1,
      currentTurnStartTime: Date.now()
    });
  };

  // Calculate win statistics
  const getWinStats = (playerKey: 'player1' | 'player2') => {
    const wins = gameWins[playerKey];
    const totalWins = wins.length;
    
    if (totalWins === 0) return { totalWins: 0, currentStreak: 0, hasFlame: false };
    
    // Calculate current streak by looking at most recent wins
    const otherPlayerKey = playerKey === 'player1' ? 'player2' : 'player1';
    const allWins = [...gameWins.player1.map(w => ({player: 1, time: w})), 
                     ...gameWins.player2.map(w => ({player: 2, time: w}))]
                   .sort((a, b) => b.time - a.time); // Most recent first
    
    let currentStreak = 0;
    const currentPlayer = playerKey === 'player1' ? 1 : 2;
    
    for (const win of allWins) {
      if (win.player === currentPlayer) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    const hasFlame = currentStreak >= 3;
    
    return { totalWins, currentStreak, hasFlame };
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Setup Modal */}
      {showSetupModal && (
        <GameSetup 
          onSetupSubmit={handleSetupSubmit} 
          onClose={hasExistingGames ? handleCloseSetup : undefined}
          canClose={hasExistingGames}
        />
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center">
              {/* Prominent logo with fallback title */}
              <LogoWithFallback />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (hasCurrentGame) {
                    handlePageChange('game');
                  } else {
                    setShowSetupModal(true);
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'game' 
                    ? 'bg-green-600 text-white'
                    : hasCurrentGame
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {hasCurrentGame ? 'Game' : 'New Game'}
              </button>
              <button
                onClick={() => handlePageChange('score')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'score' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <span style={{fontFamily: 'cursive', fontWeight: 'bold'}}>Score</span>
              </button>
              <button
                onClick={() => handlePageChange('timeline')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'timeline' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Timeline
              </button>
            </div>
            <div className="w-16"></div>
          </div>
          
          {/* Header Controls Row */}
          {currentPage === 'game' && (
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
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
              
              {/* Tile Distribution Pill - Responsive */}
              <button 
                onClick={() => setShowTileModal(true)}
                className="text-base text-gray-600 bg-white px-6 py-3 rounded-full border hover:bg-gray-50 transition-colors cursor-pointer h-12 flex items-center min-w-[64px] whitespace-nowrap
                  sm:px-4 sm:text-sm
                  md:px-6 md:text-base"
                title="View remaining tiles"
              >
                🎒 {98 - 14 - usedTiles} in bag
              </button>
              
              </div>
              
              {/* Turn Timer - Right justified */}
              <ResponsiveTimer 
                isActive={currentGame.status === 'active' && currentPage === 'game'} 
                onTimerPaused={() => {
                  if (currentGameId) {
                    setGameStatus(currentGameId, 'paused');
                  }
                }}
                currentPlayer={currentPlayer}
                turnStartTime={currentGame.currentTurnStartTime}
                onTimerExpired={() => {
                // Optional: auto-switch turn when timer expires
                console.log('Timer expired for', players[`player${currentPlayer}`].name);
              }} />
            </div>
          )}
          
          {/* Score page header - Just tile bag on the right */}
          {currentPage === 'score' && (
            <div className="flex items-center justify-end gap-4 mb-4">
              {/* Tile Distribution Pill - Responsive */}
              <button 
                onClick={() => setShowTileModal(true)}
                className="text-base text-gray-600 bg-white px-6 py-3 rounded-full border hover:bg-gray-50 transition-colors cursor-pointer h-12 flex items-center min-w-[64px] whitespace-nowrap
                  sm:px-4 sm:text-sm
                  md:px-6 md:text-base"
                title="View remaining tiles"
              >
                🎒 {98 - 14 - usedTiles} in bag
              </button>
            </div>
          )}
        </div>

        {/* Show Score Display only on Game page */}
        {currentPage === 'game' && (
          <div className="w-full">
            {isCurrentGameFinal ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Game Complete</h3>
                <p className="text-gray-600 mb-4">This game has been finalized and cannot be edited.</p>
                <div className="text-lg font-bold">
                  {currentGame.winner === 1 ? players.player1.name : 
                   currentGame.winner === 2 ? players.player2.name : 'Tie'} 
                  {currentGame.winner ? ' Won!' : ''}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Final Score: {players.player1.score} - {players.player2.score}
                </div>
              </div>
            ) : (
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
            )}
          </div>
        )}

        {currentPage === 'timeline' ? (
          <Timeline 
            players={players}
            gameHistory={gameHistory}
            gameWins={gameWins}
            games={games}
            onCreateGame={handleCreateGame}
            onGameClick={handleGameClick}
            formatDuration={formatDuration}
            getGameDuration={getGameDurationForTimeline}
          />
        ) : currentPage === 'score' ? (
          // Timeline Page - Paper Score Sheet Style
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center" style={{fontFamily: 'cursive'}}>Score Sheet</h2>
            </div>

            {gameHistory.length === 0 ? (
              // Show empty score sheet with today's date
              <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-lg" style={{
                backgroundImage: `repeating-linear-gradient(
                  transparent,
                  transparent 24px,
                  #e5e7eb 24px,
                  #e5e7eb 25px
                )`,
                minHeight: '400px',
                fontFamily: 'cursive'
              }}>
                {/* Date Header */}
                <div className="text-center mb-6 pb-4 border-b-2 border-gray-400">
                  <div className="text-lg font-bold text-gray-600" style={{fontFamily: 'cursive'}}>
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>

                {/* Player Name Headers */}
                <div className="grid grid-cols-2 gap-8 mb-6 pb-4 border-b-2 border-gray-400">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-blue-700 underline" style={{fontFamily: 'cursive'}}>
                      {players.player1.name}
                    </h3>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-purple-700 underline" style={{fontFamily: 'cursive'}}>
                      {players.player2.name}
                    </h3>
                  </div>
                </div>

                {/* Empty scores with 0's */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="text-center font-bold text-2xl text-blue-700 bg-blue-50 rounded px-2 py-1" style={{fontFamily: 'cursive'}}>
                      0
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-center font-bold text-2xl text-purple-700 bg-purple-50 rounded px-2 py-1" style={{fontFamily: 'cursive'}}>
                      0
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="text-center mt-8 text-gray-500" style={{fontFamily: 'cursive'}}>
                  <p className="text-lg">Ready to start a new game!</p>
                  <p className="text-sm mt-2">Click "New Game" to begin scoring</p>
                </div>
              </div>
            ) : (
              // Paper-style scoring sheet
              <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-lg" style={{
                backgroundImage: `repeating-linear-gradient(
                  transparent,
                  transparent 24px,
                  #e5e7eb 24px,
                  #e5e7eb 25px
                )`,
                minHeight: '400px',
                fontFamily: 'cursive'
              }}>
                {/* Player Name Headers with Win Stats */}
                <div className="grid grid-cols-2 gap-8 mb-6 pb-4 border-b-2 border-gray-400">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-blue-700 underline" style={{fontFamily: 'cursive'}}>
                      {players.player1.name}
                    </h3>
                    {(() => {
                      const stats = getWinStats('player1');
                      return (
                        <div className="mt-2 text-lg font-bold text-blue-600" style={{fontFamily: 'cursive'}}>
                          {stats.totalWins} wins
                          {stats.currentStreak > 0 && (
                            <span className="ml-2">
                              +{stats.currentStreak}
                              {stats.hasFlame && <span className="ml-1">🔥</span>}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-purple-700 underline" style={{fontFamily: 'cursive'}}>
                      {players.player2.name}
                    </h3>
                    {(() => {
                      const stats = getWinStats('player2');
                      return (
                        <div className="mt-2 text-lg font-bold text-purple-600" style={{fontFamily: 'cursive'}}>
                          {stats.totalWins} wins
                          {stats.currentStreak > 0 && (
                            <span className="ml-2">
                              +{stats.currentStreak}
                              {stats.hasFlame && <span className="ml-1">🔥</span>}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Score Entries */}
                <div className="grid grid-cols-2 gap-8">
                  {/* Player 1 Column */}
                  <div className="space-y-2">
                    {gameHistory.filter(entry => entry.player === 1).map((entry, index) => {
                      const player1RunningTotal = gameHistory
                        .filter(e => e.player === 1)
                        .slice(0, index + 1)
                        .reduce((sum, e) => sum + e.points, 0);
                      
                      return (
                        <div key={`p1-${index}`} className="flex justify-between items-center text-base" style={{fontFamily: 'cursive'}}>
                          <div className="font-semibold text-blue-800" style={{fontFamily: 'cursive'}}>
                            {entry.isTurnSummary ? (
                              <span className="text-blue-600 font-bold">{entry.points}</span>
                            ) : (
                              `${entry.points}`
                            )}
                          </div>
                          <div className="text-gray-700 text-right flex-1 ml-2" style={{fontFamily: 'cursive'}}>
                            {entry.isTurnSummary ? (
                              <span className="text-sm italic">{entry.word}</span>
                            ) : (
                              entry.word
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {/* Running Total */}
                    {players.player1.score > 0 && (
                      <div className="border-t border-blue-300 pt-2 mt-4">
                        <div className="text-center font-bold text-2xl text-blue-700 bg-blue-50 rounded px-2 py-1" style={{fontFamily: 'cursive'}}>
                          {players.player1.score}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Player 2 Column */}
                  <div className="space-y-2">
                    {gameHistory.filter(entry => entry.player === 2).map((entry, index) => {
                      const player2RunningTotal = gameHistory
                        .filter(e => e.player === 2)
                        .slice(0, index + 1)
                        .reduce((sum, e) => sum + e.points, 0);
                      
                      return (
                        <div key={`p2-${index}`} className="flex justify-between items-center text-base" style={{fontFamily: 'cursive'}}>
                          <div className="font-semibold text-purple-800" style={{fontFamily: 'cursive'}}>
                            {entry.isTurnSummary ? (
                              <span className="text-purple-600 font-bold">{entry.points}</span>
                            ) : (
                              `${entry.points}`
                            )}
                          </div>
                          <div className="text-gray-700 text-right flex-1 ml-2" style={{fontFamily: 'cursive'}}>
                            {entry.isTurnSummary ? (
                              <span className="text-sm italic">{entry.word}</span>
                            ) : (
                              entry.word
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {/* Running Total */}
                    {players.player2.score > 0 && (
                      <div className="border-t border-purple-300 pt-2 mt-4">
                        <div className="text-center font-bold text-2xl text-purple-700 bg-purple-50 rounded px-2 py-1" style={{fontFamily: 'cursive'}}>
                          {players.player2.score}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Game Page
          <div>
            {isCurrentGameFinal ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Game Complete</h3>
                <p className="text-gray-600 mb-4">This game has been finalized and cannot be edited.</p>
                <div className="text-lg font-bold">
                  {currentGame.winner === 1 ? players.player1.name : 
                   currentGame.winner === 2 ? players.player2.name : 'Tie'} 
                  {currentGame.winner ? ' Won!' : ''}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Final Score: {players.player1.score} - {players.player2.score}
                </div>
              </div>
            ) : (
              <>
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
                  restoreMultipliers={restoreMultipliers}
                  onCompleteTurn={completeTurn}
                  onUndoTurn={undoTurn}
                />

                {/* Complete Turn Button
                {currentTurnWords.length > 0 && (
                  <div className="mt-6">
                    <button
                      onClick={completeTurn}
                      className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors text-lg"
                    >
                      Complete Turn ({getTurnTotal()} points)
                    </button>
                  </div>
                )} */}
              </>
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

// Prominent logo with fallback title if image fails to load
const LogoWithFallback: React.FC = () => {
  const [showFallback, setShowFallback] = React.useState(false);
  return showFallback ? (
    <span className="text-2xl sm:text-4xl font-extrabold tracking-tight text-blue-700 drop-shadow-lg">SKOREBORED</span>
  ) : (
    <img
      src="/logo.svg"
      alt="SKOREBORED"
      className="h-16 sm:h-24 w-auto max-w-xs mx-auto drop-shadow-xl"
      style={{ minHeight: 48 }}
      onError={() => setShowFallback(true)}
      draggable={false}
    />
  );
};

export default ScrabbleScorer;

