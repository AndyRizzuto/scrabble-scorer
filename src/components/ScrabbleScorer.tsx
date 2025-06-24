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
import GameSetup from './game/GameSetup';
import ScoreDisplay from './score/ScoreDisplay';
import TurnManager from './game/TurnManager';
import TileGrid from './tiles/TileGrid';
import TileDistributionModal from './tiles/TileDistributionModal';
import TurnTimer from './score/TurnTimer';
import Timeline from './game/Timeline';
import HeaderNav from './header/HeaderNav';
import HeaderControls from './header/HeaderControls';
import GameCompleteBanner from './game/GameCompleteBanner';
import ScoreSheet from './score/ScoreSheet';
import LogoWithFallback from './header/LogoWithFallback';
import TileBagButton from './tiles/TileBagButton';
import ResponsiveTimer from './score/ResponsiveTimer';

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
    tilesRemaining: 98,
    usedLetters: {}
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
    const carlaWins: number[] = [];
    const daysWithGames: number[] = [];
    
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
    const andrewWins: number[] = [];
    // Andrew's first win - 5 days ago
    const andrewWin1 = now - (5 * 24 * 60 * 60 * 1000) + (Math.random() * 12 * 60 * 60 * 1000);
    andrewWins.push(andrewWin1);
    
    // Andrew's second win - 12 days ago
    const andrewWin2 = now - (12 * 24 * 60 * 60 * 1000) + (Math.random() * 12 * 60 * 60 * 1000);
    andrewWins.push(andrewWin2);

    // Use generic player names for test data
    const player1Name = 'Player 1';
    const player2Name = 'Player 2';    
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

    // Track letters used
    const newUsedLetters = { ...currentGame.usedLetters };
    word.toUpperCase().split('').forEach(letter => {
      newUsedLetters[letter] = (newUsedLetters[letter] || 0) + 1;
    });
    updateCurrentGame({
      currentTurnWords: [...currentGame.currentTurnWords, newWord],
      usedLetters: newUsedLetters
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
      
      // Track letters used in current word
      const newUsedLetters = { ...currentGame.usedLetters };
      currentWordInfo.word.toUpperCase().split('').forEach(letter => {
        newUsedLetters[letter] = (newUsedLetters[letter] || 0) + 1;
      });

      // Add current word to shelf
      updateCurrentGame({
        currentTurnWords: [...currentGame.currentTurnWords, newWordEntry],
        usedLetters: newUsedLetters
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
      // Reverse letter tracking for removed word
      const newUsedLetters = { ...currentGame.usedLetters };
      if (wordToRestore) {
        wordToRestore.word.toUpperCase().split('').forEach(letter => {
          if (newUsedLetters[letter] > 0) {
            newUsedLetters[letter] = newUsedLetters[letter] - 1;
            if (newUsedLetters[letter] === 0) {
              delete newUsedLetters[letter];
            }
          }
        });
      }

      updateCurrentGame({
        currentTurnWords: currentGame.currentTurnWords.filter((_, i) => i !== index),
        usedLetters: newUsedLetters
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
    
    // Reverse letter tracking for undone words
    const newUsedLetters = { ...currentGame.usedLetters };
    turnToUndo.entries.forEach(entry => {
      entry.word.toUpperCase().split('').forEach(letter => {
        if (newUsedLetters[letter] > 0) {
          newUsedLetters[letter] = newUsedLetters[letter] - 1;
          if (newUsedLetters[letter] === 0) {
            delete newUsedLetters[letter];
          }
        }
      });
    });

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
      currentTurnWords: wordsForShelf,  // Restore other words to shelf
      usedLetters: newUsedLetters
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
      
      // Replace legacy state resets with updateCurrentGame
      updateCurrentGame({
        players: {
          player1: { id: 1, name: 'Andrew', score: 0 },
          player2: { id: 2, name: 'Carla', score: 0 }
        },
        currentPlayer: 1,
        gameHistory: [],
        currentTurnWords: [],
        usedLetters: {}
      });
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
      tilesRemaining: 98,
      usedLetters: {}
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

  // Atomic add word and complete turn
  const handleAddWordAndCompleteTurn = (word: string, points: number, wordData?: Partial<WordEntry>) => {
    if (word && points > 0 && validationResult?.valid) {
      handleAddWord(word, points, wordData);
      setTimeout(() => {
        completeTurn();
        handleClearTiles(); // Clear tiles after turn is completed
      }, 0);
    } else if (currentTurnWords.length > 0) {
      completeTurn();
      setTimeout(() => {
        handleClearTiles();
      }, 0);
    }
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
          <HeaderNav
            currentPage={currentPage}
            hasCurrentGame={!!hasCurrentGame}
            onPageChange={handlePageChange}
            onShowSetup={() => setShowSetupModal(true)}
          />
          {/* Header Controls Row */}
          {currentPage === 'game' && (
            <HeaderControls
              editingScores={editingScores}
              onToggleEditScores={handleToggleEditScores}
              onSwitchTurn={switchTurn}
              canSwitchTurn={currentTurnWords.length === 0}
              onShowTileModal={() => setShowTileModal(true)}
              usedTiles={usedTiles}
              tilesRemaining={currentGame.tilesRemaining}
              ResponsiveTimer={
                <ResponsiveTimer
                  isActive={currentGame.status === 'active' && currentPage === 'game'}
                  onTimerPaused={() => {
                    if (currentGameId) setGameStatus(currentGameId, 'paused');
                  }}
                  currentPlayer={currentPlayer}
                  turnStartTime={currentGame.currentTurnStartTime}
                  onTimerExpired={() => {
                    // Optional: auto-switch turn when timer expires
                    console.log('Timer expired for', players[`player${currentPlayer}`].name);
                  }}
                />
              }
            />
          )}
          {/* Score page header - Just tile bag on the right */}
          {currentPage === 'score' && (
            <div className="flex items-center justify-end gap-4 mb-4">
              <TileBagButton
                usedTiles={usedTiles}
                tilesRemaining={currentGame.tilesRemaining}
                onClick={() => setShowTileModal(true)}
              />
            </div>
          )}
        </div>

        {/* Show Score Display only on Game page */}
        {currentPage === 'game' && (
          <div className="w-full">
            {isCurrentGameFinal ? (
              <GameCompleteBanner
                winner={currentGame.winner ?? null}
                player1Name={players.player1.name}
                player2Name={players.player2.name}
                player1Score={players.player1.score}
                player2Score={players.player2.score}
              />
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
                backgroundImage: `repeating-linear-gradient(transparent,transparent 24px,#e5e7eb 24px,#e5e7eb 25px)`,
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
              <ScoreSheet
                players={players}
                gameHistory={gameHistory}
                getWinStats={getWinStats}
              />
            )}
          </div>
        ) : (
          // Game Page
          <div>
            {isCurrentGameFinal ? (
              <GameCompleteBanner
                winner={currentGame.winner ?? null}
                player1Name={players.player1.name}
                player2Name={players.player2.name}
                player1Score={players.player1.score}
                player2Score={players.player2.score}
              />
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
                  currentTurnWords={currentTurnWords.map(w => ({
                    word: w.word,
                    points: w.finalPoints,
                    definition: validationResult?.definition
                  }))}
                  onRemoveWord={removeWordFromTurn}
                  onWordClick={handleWordClick}
                  restoreToTiles={restoreToTiles}
                  restoreMultipliers={restoreMultipliers || undefined}
                  onCompleteTurn={completeTurn}
                  onUndoTurn={undoTurn}
                  onAddWordAndCompleteTurn={handleAddWordAndCompleteTurn}
                />
              </>
            )}
          </div>
        )}
      </div>
      {/* Tile Distribution Modal */}
      <TileDistributionModal 
        isOpen={showTileModal} 
        onClose={() => setShowTileModal(false)}
        usedTiles={currentGame.usedLetters}
      />
    </div>
  );
};

export default ScrabbleScorer;

