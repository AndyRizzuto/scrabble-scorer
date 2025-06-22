import React, { useState } from 'react';
import { Users, BarChart3, RotateCcw, Edit3, ArrowRightLeft, Trophy } from 'lucide-react';
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
import TurnTimer from './TurnTimer';
import Timeline from './Timeline';

const ResponsiveTimer: React.FC<{ isActive: boolean; onTimerExpired?: () => void }> = ({ isActive, onTimerExpired }) => {
  const [collapsed, setCollapsed] = React.useState(window.innerWidth < 640);
  React.useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [expanded, setExpanded] = React.useState(false);
  if (!collapsed) {
    return <TurnTimer isActive={isActive} onTimerExpired={onTimerExpired} />;
  }
  return (
    <div className="flex items-center gap-2">
      <button
        className="flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 text-lg font-mono"
        onClick={() => setExpanded(e => !e)}
        aria-label={expanded ? 'Collapse timer' : 'Expand timer'}
      >
        <span className="min-w-[48px] text-center">
          {/* Show just the time (let TurnTimer render time only) */}
          <TurnTimer isActive={isActive} onTimerExpired={onTimerExpired} minimal={!expanded} />
        </span>
        <span className="ml-1">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="absolute z-10 bg-white shadow-lg rounded p-2 mt-2">
          <TurnTimer isActive={isActive} onTimerExpired={onTimerExpired} />
        </div>
      )}
    </div>
  );
};

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
    
    return {
      player1: [], // Andrew has no wins
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
  const [selectedWordDefinition, setSelectedWordDefinition] = useState<{word: string; definition?: string} | null>(null);
  const [restoreToTiles, setRestoreToTiles] = useState<string>('');
  const [editingScores, setEditingScores] = useState(false);
  const [showTileModal, setShowTileModal] = useState(false);
  const [timerActive, setTimerActive] = useState(false);

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
    
    // Switch to next player and start timer
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    setTimerActive(true);
  };

  const handleWordClick = (word: string, definition?: string) => {
    setSelectedWordDefinition({ word, definition });
  };

  const handleToggleEditScores = () => {
    setEditingScores(!editingScores);
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
    // Switch to score sheet and show that specific game
    setCurrentPage('score');
  };

  const hasExistingGames = gameWins.player1.length > 0 || gameWins.player2.length > 0;
  const hasCurrentGame = gameHistory.length > 0 || players.player1.score > 0 || players.player2.score > 0;

  const switchTurn = () => {
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    setTimerActive(true);
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
                onClick={() => setCurrentPage('game')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'game' 
                    ? (hasCurrentGame ? 'bg-blue-600 text-white' : 'bg-green-600 text-white')
                    : (hasCurrentGame ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-green-100 text-green-700 hover:bg-green-200')
                }`}
              >
                {hasCurrentGame ? 'Game' : 'New Game'}
              </button>
              <button
                onClick={() => setCurrentPage('score')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'score' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <span style={{fontFamily: 'cursive'}}>Score</span>
              </button>
              <button
                onClick={() => setCurrentPage('timeline')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'timeline' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Timeline
              </button>
            </div>
          </div>
          
          {/* Header Controls Row - Only show on Game and Score pages */}
          {currentPage !== 'timeline' && (
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
              
              {/* Tile Distribution Pill - Responsive */}
              <button 
                onClick={() => setShowTileModal(true)}
                className="text-base text-gray-600 bg-white px-6 py-3 rounded-full border hover:bg-gray-50 transition-colors cursor-pointer h-12 flex items-center min-w-[64px] whitespace-nowrap
                  sm:px-4 sm:text-sm
                  md:px-6 md:text-base"
                title="View remaining tiles"
              >
                {98 - 14 - usedTiles} in bag
              </button>
              
              {/* Turn Timer - Collapsible on small screens */}
              {currentPage === 'game' && (
                <ResponsiveTimer isActive={timerActive} onTimerExpired={() => {
                  // Optional: auto-switch turn when timer expires
                  console.log('Timer expired for', players[`player${currentPlayer}`].name);
                }} />
              )}
            </div>
          )}
        </div>

        {/* Show Score Display only on Game page */}
        {currentPage === 'game' && (
          <div className="w-full">
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
          </div>
        )}

        {currentPage === 'timeline' ? (
          <Timeline 
            players={players}
            gameHistory={gameHistory}
            gameWins={gameWins}
            onCreateGame={handleCreateGame}
            onGameClick={handleGameClick}
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
              onCompleteTurn={completeTurn}
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

// Prominent logo with fallback title if image fails to load
const LogoWithFallback: React.FC = () => {
  const [showFallback, setShowFallback] = React.useState(false);
  return showFallback ? (
    <span className="text-4xl font-extrabold tracking-tight text-blue-700 drop-shadow-lg">SKOREBORED</span>
  ) : (
    <img
      src="/logo.svg"
      alt="SKOREBORED"
      className="h-24 w-auto max-w-xs mx-auto drop-shadow-xl"
      style={{ minHeight: 64 }}
      onError={() => setShowFallback(true)}
      draggable={false}
    />
  );
};

export default ScrabbleScorer;

