import { useState } from 'react';
import { Users, Check, X, RotateCcw, BarChart3, Undo, Download, TrendingUp } from 'lucide-react';
import { ScoreDisplay } from './ScoreDisplay';
import { SetupModal } from './SetupModal';
import { LetterTiles } from './LetterTiles';
import { BonusControls } from './BonusControls';
import { GameHistory } from './GameHistory';
import { AllWords } from './AllWords';
import { Timeline } from './Timeline';
import { GameStats } from './GameStats';

interface GameHistoryEntry {
  player: number;
  word: string;
  points: number;
  time: string;
  bonuses?: any;
  isTurnSummary?: boolean;
}

interface WordEntry {
  word: string;
  basePoints: number;
  bonusPoints: number;
  finalPoints: number;
  bonuses: { letterMultiplier: number; wordMultiplier: number };
  letterMultipliers: number[];
  bingoBonus: boolean;
  tilesUsed: number;
}

const ScrabbleScorer = () => {
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [playerNames, setPlayerNames] = useState({ player1: 'Player 1', player2: 'Player 2' });
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [word, setWord] = useState('');
  const [points, setPoints] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; word: string } | null>(null);
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [showSetupModal, setShowSetupModal] = useState(true);
  const [editingScores, setEditingScores] = useState(false);
  const [tempScores, setTempScores] = useState({ player1: 0, player2: 0 });
  const [setupData, setSetupData] = useState({
    player1Name: 'Andrew',
    player2Name: 'Carla',
    player1Score: 0,
    player2Score: 0
  });
  const [bonusMultipliers, setBonusMultipliers] = useState({
    letterMultiplier: 1,
    wordMultiplier: 1
  });
  const [currentTurnWords, setCurrentTurnWords] = useState<WordEntry[]>([]);
  const [showMultiWordMode, setShowMultiWordMode] = useState(false);
  const [tilesUsed, setTilesUsed] = useState(0);
  const [bingoBonus, setBingoBonus] = useState(false);
  const [letterMultipliers, setLetterMultipliers] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState('game');
  const [gameStateHistory, setGameStateHistory] = useState<{
    scores: typeof scores;
    gameHistory: typeof gameHistory;
    currentPlayer: number;
  }[]>([]);

  // Scrabble letter values
  const letterValues: { [key: string]: number } = {
    A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
    K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
    U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
  };

  const calculateWordValue = (word: string) => {
    return word.toUpperCase().split('').reduce((sum, letter) => {
      return sum + (letterValues[letter] || 0);
    }, 0);
  };

  const calculateBonusPoints = () => {
    let totalWithLetterBonuses = 0;
    const letters = word.toUpperCase().split('');
    
    letters.forEach((letter, index) => {
      const letterValue = letterValues[letter] || 0;
      const multiplier = letterMultipliers[index] || 1;
      totalWithLetterBonuses += letterValue * multiplier;
    });
    
    const finalPoints = totalWithLetterBonuses * bonusMultipliers.wordMultiplier;
    const bingoAddition = bingoBonus ? 50 : 0;
    return Math.round(finalPoints) + bingoAddition;
  };

  const resetBonuses = () => {
    setBonusMultipliers({ letterMultiplier: 1, wordMultiplier: 1 });
    setBingoBonus(false);
    setTilesUsed(0);
    setLetterMultipliers([]);
  };

  const updateWordAndTiles = (newWord: string) => {
    setWord(newWord);
    const wordLength = newWord.length;
    setTilesUsed(wordLength);
    setBingoBonus(wordLength === 7);
    
    setLetterMultipliers(prev => {
      const newMultipliers = [...prev];
      while (newMultipliers.length < wordLength) {
        newMultipliers.push(1);
      }
      return newMultipliers.slice(0, wordLength);
    });
  };

  const cycleLetterMultiplier = (index: number) => {
    setLetterMultipliers(prev => {
      const newMultipliers = [...prev];
      const current = newMultipliers[index] || 1;
      newMultipliers[index] = current === 1 ? 2 : current === 2 ? 3 : 1;
      return newMultipliers;
    });
  };

  const addWordToTurn = () => {
    if (!word.trim()) return;
    
    const basePoints = calculateWordValue(word);
    const bonusPoints = calculateBonusPoints();
    const finalPoints = parseInt(points) || bonusPoints;
    
    const newWord: WordEntry = {
      word: word.toUpperCase(),
      basePoints,
      bonusPoints,
      finalPoints,
      bonuses: { ...bonusMultipliers },
      letterMultipliers: [...letterMultipliers],
      bingoBonus,
      tilesUsed
    };
    
    setCurrentTurnWords(prev => [...prev, newWord]);
    
    setWord('');
    setPoints('');
    setValidationResult(null);
    resetBonuses();
  };

  const removeWordFromTurn = (index: number) => {
    setCurrentTurnWords(prev => prev.filter((_, i) => i !== index));
  };

  const getTurnTotal = () => {
    return currentTurnWords.reduce((sum, wordEntry) => sum + wordEntry.finalPoints, 0);
  };

  const completeTurn = () => {
    if (currentTurnWords.length === 0) return;
    
    saveGameState();
    
    const totalPoints = getTurnTotal();
    const playerKey = `player${currentPlayer}` as 'player1' | 'player2';
    
    setScores(prev => ({
      ...prev,
      [playerKey]: prev[playerKey] + totalPoints
    }));

    currentTurnWords.forEach(wordEntry => {
      setGameHistory(prev => [...prev, {
        player: currentPlayer,
        word: wordEntry.word,
        points: wordEntry.finalPoints,
        time: new Date().toLocaleTimeString(),
        bonuses: wordEntry.bonuses
      }]);
    });

    if (currentTurnWords.length > 1) {
      setGameHistory(prev => [...prev, {
        player: currentPlayer,
        word: `TURN TOTAL (${currentTurnWords.length} words)`,
        points: totalPoints,
        time: new Date().toLocaleTimeString(),
        isTurnSummary: true
      }]);
    }

    setCurrentTurnWords([]);
    setShowMultiWordMode(false);
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };

  const undoLastMove = () => {
    if (gameStateHistory.length === 0) return;
    
    const lastState = gameStateHistory[gameStateHistory.length - 1];
    setScores(lastState.scores);
    setGameHistory(lastState.gameHistory);
    setCurrentPlayer(lastState.currentPlayer);
    
    setGameStateHistory(prev => prev.slice(0, -1));
  };

  const exportToCSV = () => {
    if (gameHistory.length === 0) return;

    const csvContent = [
      ['Time', 'Player', 'Word', 'Points'],
      ...gameHistory.map(entry => [
        entry.time,
        playerNames[`player${entry.player}` as keyof typeof playerNames],
        entry.word,
        entry.points.toString()
      ])
    ];

    const csvString = csvContent.map(row => 
      row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `scrabble_game_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validateWord = async (word: string) => {
    if (!word.trim()) return;
    
    setIsValidating(true);
    setValidationResult(null);
    
    try {
      const isValid = /^[a-zA-Z]+$/.test(word) && word.length >= 2;
      setValidationResult({
        valid: isValid,
        word: word.toUpperCase()
      });
    } catch (error) {
      const isValid = /^[a-zA-Z]+$/.test(word) && word.length >= 2;
      setValidationResult({
        valid: isValid,
        word: word.toUpperCase()
      });
    }
    
    setIsValidating(false);
  };

  const saveGameState = () => {
    setGameStateHistory(prev => [
      ...prev.slice(-9), // Keep only last 10 states
      {
        scores: { ...scores },
        gameHistory: [...gameHistory],
        currentPlayer
      }
    ]);
  };

  const addScore = () => {
    if (showMultiWordMode) {
      addWordToTurn();
    } else {
      saveGameState();
      
      const pointsToAdd = parseInt(points) || 0;
      const playerKey = `player${currentPlayer}` as 'player1' | 'player2';
      
      setScores(prev => ({
        ...prev,
        [playerKey]: prev[playerKey] + pointsToAdd
      }));

      setGameHistory(prev => [...prev, {
        player: currentPlayer,
        word: word.toUpperCase(),
        points: pointsToAdd,
        time: new Date().toLocaleTimeString()
      }]);

      setWord('');
      setPoints('');
      setValidationResult(null);
      resetBonuses();
      
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  const resetGame = () => {
    setScores({ player1: 0, player2: 0 });
    setCurrentPlayer(1);
    setWord('');
    setPoints('');
    setValidationResult(null);
    setGameHistory([]);
    setCurrentTurnWords([]);
    setShowMultiWordMode(false);
    setShowSetupModal(true);
  };

  const handleSetupSubmit = () => {
    setPlayerNames({
      player1: setupData.player1Name || 'Andrew',
      player2: setupData.player2Name || 'Carla'
    });
    setScores({
      player1: parseInt(setupData.player1Score.toString()) || 0,
      player2: parseInt(setupData.player2Score.toString()) || 0
    });
    setShowSetupModal(false);
  };

  const handleSetupDataChange = (data: Partial<typeof setupData>) => {
    setSetupData(prev => ({ ...prev, ...data }));
  };

  const startEditingScores = () => {
    setTempScores({ ...scores });
    setEditingScores(true);
  };

  const saveScores = () => {
    setScores({ ...tempScores });
    setEditingScores(false);
  };

  const cancelEditingScores = () => {
    setTempScores({ ...scores });
    setEditingScores(false);
  };

  const handleTempScoreChange = (player: 'player1' | 'player2', value: number) => {
    setTempScores(prev => ({ ...prev, [player]: value }));
  };

  const switchTurn = () => {
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };

  const suggestedPoints = word ? calculateWordValue(word) : 0;
  const bonusCalculatedPoints = suggestedPoints ? calculateBonusPoints() : 0;

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <SetupModal
        show={showSetupModal}
        setupData={setupData}
        onSetupDataChange={handleSetupDataChange}
        onSubmit={handleSetupSubmit}
      />

      <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="text-blue-600" />
              <span className="hidden sm:inline">Scrabble Score Keeper</span>
              <span className="sm:hidden">Scrabble</span>
            </h1>
            <div className="flex gap-1 sm:gap-2">
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
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2 ${
                  currentPage === 'timeline' 
                    ? 'bg-purple-600 text-white' 
                    : gameHistory.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Timeline</span>
              </button>
              <button
                onClick={() => setCurrentPage('stats')}
                disabled={gameHistory.length === 0}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2 ${
                  currentPage === 'stats' 
                    ? 'bg-green-600 text-white' 
                    : gameHistory.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Stats</span>
              </button>
            </div>
          </div>
          <p className="text-gray-600">Two-player scoring with word validation</p>
        </div>

        {currentPage === 'timeline' ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <button
                onClick={exportToCSV}
                disabled={gameHistory.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
            <Timeline 
              gameHistory={gameHistory}
              playerNames={playerNames}
              scores={scores}
            />
          </div>
        ) : currentPage === 'stats' ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <button
                onClick={exportToCSV}
                disabled={gameHistory.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
            <GameStats 
              gameHistory={gameHistory}
              playerNames={playerNames}
              scores={scores}
            />
          </div>
        ) : (
          <div>
            <ScoreDisplay
              playerNames={playerNames}
              scores={scores}
              tempScores={tempScores}
              currentPlayer={currentPlayer}
              editingScores={editingScores}
              onTempScoreChange={handleTempScoreChange}
            />

            {/* Edit/Save Scores Button */}
            <div className="text-center mb-6">
              {editingScores ? (
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={saveScores}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditingScores}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={startEditingScores}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium transition-colors"
                >
                  Edit Scores
                </button>
              )}
            </div>

            {/* Current Player Turn */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-4">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  currentPlayer === 1 ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {playerNames[`player${currentPlayer}` as keyof typeof playerNames]}'s Turn
                </div>
                <button
                  onClick={switchTurn}
                  disabled={showMultiWordMode && currentTurnWords.length > 0}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 text-sm font-medium transition-colors"
                >
                  Switch Turn
                </button>
                <button
                  onClick={() => setShowMultiWordMode(!showMultiWordMode)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showMultiWordMode 
                      ? 'bg-orange-600 text-white hover:bg-orange-700' 
                      : 'bg-orange-200 text-orange-700 hover:bg-orange-300'
                  }`}
                >
                  {showMultiWordMode ? 'Exit Multi-Word' : 'Multi-Word Mode'}
                </button>
              </div>
            </div>

            {/* Word Input */}
            <div className="space-y-4 mb-6">
              {showMultiWordMode && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-orange-800 mb-2">Multi-Word Turn Mode</h4>
                  <p className="text-sm text-orange-700 mb-3">
                    Add multiple words for this turn. Each word can have different bonuses.
                  </p>
                  
                  {currentTurnWords.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-2">Words in this turn:</h5>
                      <div className="space-y-2">
                        {currentTurnWords.map((wordEntry, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                            <div className="flex items-center gap-4">
                              <span className="font-mono font-semibold">{wordEntry.word}</span>
                              <span className="text-sm text-gray-600">
                                Base: {wordEntry.basePoints}
                                {(wordEntry.bonuses.letterMultiplier > 1 || wordEntry.bonuses.wordMultiplier > 1) && 
                                  ` → Bonus: ${wordEntry.bonusPoints}`
                                }
                                {wordEntry.bingoBonus && ' (+50 BINGO)'}
                              </span>
                              <span className="font-semibold text-green-600">+{wordEntry.finalPoints}</span>
                            </div>
                            <button
                              onClick={() => removeWordFromTurn(index)}
                              className="text-red-600 hover:text-red-800 px-2 py-1 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                        <span className="font-semibold text-green-800">
                          Turn Total: {getTurnTotal()} points
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Word
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => updateWordAndTiles(e.target.value)}
                    placeholder="Enter your word..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && validateWord(word)}
                  />
                  <button
                    onClick={() => validateWord(word)}
                    disabled={isValidating || !word.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    {isValidating ? '...' : 'Check'}
                  </button>
                </div>
              </div>

              <LetterTiles
                word={word}
                letterValues={letterValues}
                letterMultipliers={letterMultipliers}
                tilesUsed={tilesUsed}
                bingoBonus={bingoBonus}
                onLetterMultiplierCycle={cycleLetterMultiplier}
                onResetAll={() => setLetterMultipliers(new Array(word.length).fill(1))}
              />

              {validationResult && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  validationResult.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {validationResult.valid ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                  <span>
                    "{validationResult.word}" is {validationResult.valid ? 'valid' : 'not valid'}
                  </span>
                </div>
              )}

              <BonusControls
                bonusMultipliers={bonusMultipliers}
                letterMultipliers={letterMultipliers}
                bingoBonus={bingoBonus}
                onWordMultiplierChange={(multiplier) => 
                  setBonusMultipliers(prev => ({ ...prev, wordMultiplier: multiplier }))
                }
                onResetBonuses={resetBonuses}
              />

              {/* Points Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points to Add
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    placeholder="Enter points..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {word && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPoints(suggestedPoints.toString())}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                      >
                        Base: {suggestedPoints}
                      </button>
                      {(letterMultipliers.some(m => m > 1) || bonusMultipliers.wordMultiplier > 1 || bingoBonus) && (
                        <button
                          onClick={() => setPoints(bonusCalculatedPoints.toString())}
                          className="px-3 py-2 bg-yellow-200 text-yellow-800 rounded-lg hover:bg-yellow-300 transition-colors text-sm font-medium"
                        >
                          Total: {bonusCalculatedPoints}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {word && (
                  <p className="text-sm text-gray-500 mt-1">
                    Base: {suggestedPoints} pts
                    {(letterMultipliers.some(m => m > 1) || bonusMultipliers.wordMultiplier > 1 || bingoBonus) && 
                      ` → With bonuses: ${bonusCalculatedPoints} pts`
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6 sm:mb-8">
              {showMultiWordMode ? (
                <>
                  <button
                    onClick={addScore}
                    disabled={!word.trim()}
                    className="flex-1 px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors text-sm sm:text-base"
                  >
                    Add Word to Turn
                  </button>
                  <button
                    onClick={completeTurn}
                    disabled={currentTurnWords.length === 0}
                    className="px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium transition-colors text-sm sm:text-base"
                  >
                    Complete Turn ({getTurnTotal()})
                  </button>
                </>
              ) : (
                <button
                  onClick={addScore}
                  disabled={!points && points !== '0'}
                  className="flex-1 px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium transition-colors text-sm sm:text-base"
                >
                  Add Score
                </button>
              )}
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={undoLastMove}
                  disabled={gameStateHistory.length === 0}
                  className="px-3 sm:px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 font-medium transition-colors flex items-center gap-2 text-sm sm:text-base"
                  title="Undo Last Move"
                >
                  <Undo className="w-4 h-4" />
                  <span className="hidden sm:inline">Undo</span>
                </button>
                <button
                  onClick={resetGame}
                  className="px-3 sm:px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors flex items-center gap-2 text-sm sm:text-base"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>

            {/* Game History & Words List */}
            {gameHistory.length > 0 && (
              <div className="border-t pt-4 sm:pt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <GameHistory gameHistory={gameHistory} playerNames={playerNames} />
                <AllWords gameHistory={gameHistory} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrabbleScorer;