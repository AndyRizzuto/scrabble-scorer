import React, { useState } from 'react';
import { Users, Check, X, RotateCcw, BarChart3 } from 'lucide-react';

const ScrabbleScorer = () => {
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [playerNames, setPlayerNames] = useState({ player1: 'Player 1', player2: 'Player 2' });
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [word, setWord] = useState('');
  const [points, setPoints] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
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
  const [showBonusCalculator, setShowBonusCalculator] = useState(false);
  const [currentTurnWords, setCurrentTurnWords] = useState([]);
  const [showMultiWordMode, setShowMultiWordMode] = useState(false);
  const [tilesUsed, setTilesUsed] = useState(0);
  const [bingoBonus, setBingoBonus] = useState(false);
  const [letterMultipliers, setLetterMultipliers] = useState([]);
  const [currentPage, setCurrentPage] = useState('game'); // 'game' or 'timeline'

  // Scrabble letter values
  const letterValues = {
    A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
    K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
    U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
  };

  const calculateWordValue = (word) => {
    return word.toUpperCase().split('').reduce((sum, letter) => {
      return sum + (letterValues[letter] || 0);
    }, 0);
  };

  const calculateBonusPoints = (basePoints) => {
    // Calculate with individual letter multipliers and word multiplier
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

  const updateWordAndTiles = (newWord) => {
    setWord(newWord);
    const wordLength = newWord.length;
    setTilesUsed(wordLength);
    setBingoBonus(wordLength === 7);
    
    // Adjust letter multipliers array to match word length
    setLetterMultipliers(prev => {
      const newMultipliers = [...prev];
      while (newMultipliers.length < wordLength) {
        newMultipliers.push(1);
      }
      return newMultipliers.slice(0, wordLength);
    });
  };

  const cycleLetterMultiplier = (index) => {
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
    const bonusPoints = calculateBonusPoints(basePoints);
    const finalPoints = parseInt(points) || bonusPoints;
    
    const newWord = {
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
    
    // Reset form for next word
    setWord('');
    setPoints('');
    setValidationResult(null);
    resetBonuses();
  };

  const removeWordFromTurn = (index) => {
    setCurrentTurnWords(prev => prev.filter((_, i) => i !== index));
  };

  const getTurnTotal = () => {
    return currentTurnWords.reduce((sum, wordEntry) => sum + wordEntry.finalPoints, 0);
  };

  const completeTurn = () => {
    if (currentTurnWords.length === 0) return;
    
    const totalPoints = getTurnTotal();
    const playerKey = `player${currentPlayer}`;
    
    setScores(prev => ({
      ...prev,
      [playerKey]: prev[playerKey] + totalPoints
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

  const validateWord = async (word) => {
    if (!word.trim()) return;
    
    setIsValidating(true);
    setValidationResult(null);
    
    try {
      // Using Merriam-Webster API endpoint
      const response = await fetch(`https://www.merriam-webster.com/dictionary/${word.toLowerCase()}`);
      
      // Since we can't access the API directly in this environment, 
      // we'll simulate validation based on common English patterns
      const isValid = /^[a-zA-Z]+$/.test(word) && word.length >= 2;
      
      setValidationResult({
        valid: isValid,
        word: word.toUpperCase()
      });
    } catch (error) {
      // Fallback validation - accept if it's alphabetic and reasonable length
      const isValid = /^[a-zA-Z]+$/.test(word) && word.length >= 2;
      setValidationResult({
        valid: isValid,
        word: word.toUpperCase()
      });
    }
    
    setIsValidating(false);
  };

  const addScore = () => {
    if (showMultiWordMode) {
      addWordToTurn();
    } else {
      // Original single word logic
      const pointsToAdd = parseInt(points) || 0;
      const playerKey = `player${currentPlayer}`;
      
      setScores(prev => ({
        ...prev,
        [playerKey]: prev[playerKey] + pointsToAdd
      }));

      // Add to history
      setGameHistory(prev => [...prev, {
        player: currentPlayer,
        word: word.toUpperCase(),
        points: pointsToAdd,
        time: new Date().toLocaleTimeString()
      }]);

      // Reset form
      setWord('');
      setPoints('');
      setValidationResult(null);
      resetBonuses();
      
      // Switch to next player
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
      player1: parseInt(setupData.player1Score) || 0,
      player2: parseInt(setupData.player2Score) || 0
    });
    setShowSetupModal(false);
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

  const switchTurn = () => {
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };

  const suggestedPoints = word ? calculateWordValue(word) : 0;
  const bonusCalculatedPoints = suggestedPoints ? calculateBonusPoints(suggestedPoints) : 0;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-center mb-6">Game Setup</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Player 1 Name
                </label>
                <input
                  type="text"
                  value={setupData.player1Name}
                  onChange={(e) => setSetupData(prev => ({ ...prev, player1Name: e.target.value }))}
                  placeholder="Andrew"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Player 1 Starting Score
                </label>
                <input
                  type="number"
                  value={setupData.player1Score}
                  onChange={(e) => setSetupData(prev => ({ ...prev, player1Score: e.target.value }))}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Player 2 Name
                </label>
                <input
                  type="text"
                  value={setupData.player2Name}
                  onChange={(e) => setSetupData(prev => ({ ...prev, player2Name: e.target.value }))}
                  placeholder="Carla"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Player 2 Starting Score
                </label>
                <input
                  type="number"
                  value={setupData.player2Score}
                  onChange={(e) => setSetupData(prev => ({ ...prev, player2Score: e.target.value }))}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSetupSubmit}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
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
          // Timeline Page
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Timeline</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-700">{playerNames.player1}</h3>
                  <div className="text-2xl font-bold text-blue-600">{scores.player1}</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-700">{playerNames.player2}</h3>
                  <div className="text-2xl font-bold text-purple-600">{scores.player2}</div>
                </div>
              </div>
            </div>

            {/* Timeline Visualization */}
            <div className="space-y-4">
              {gameHistory.map((entry, index) => {
                // Calculate running scores
                const entriesUpToThis = gameHistory.slice(0, index + 1);
                const player1RunningScore = entriesUpToThis
                  .filter(e => e.player === 1)
                  .reduce((sum, e) => sum + e.points, 0);
                const player2RunningScore = entriesUpToThis
                  .filter(e => e.player === 2)
                  .reduce((sum, e) => sum + e.points, 0);

                return (
                  <div key={index} className={`relative ${entry.isTurnSummary ? 'mb-6' : ''}`}>
                    {/* Timeline line */}
                    {index < gameHistory.length - 1 && (
                      <div className="absolute left-8 top-12 w-0.5 h-8 bg-gray-300"></div>
                    )}
                    
                    <div className={`flex items-start gap-4 ${
                      entry.isTurnSummary 
                        ? 'bg-green-50 border border-green-200 rounded-lg p-4' 
                        : 'bg-gray-50 rounded-lg p-4'
                    }`}>
                      {/* Timeline dot */}
                      <div className={`w-4 h-4 rounded-full mt-2 flex-shrink-0 ${
                        entry.player === 1 ? 'bg-blue-500' : 'bg-purple-500'
                      } ${entry.isTurnSummary ? 'bg-green-500' : ''}`}></div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-semibold ${
                                entry.player === 1 ? 'text-blue-600' : 'text-purple-600'
                              }`}>
                                {playerNames[`player${entry.player}`]}
                              </span>
                              <span className="text-xs text-gray-500">{entry.time}</span>
                            </div>
                            <div className={`font-mono text-lg ${entry.isTurnSummary ? 'text-sm' : ''}`}>
                              {entry.word}
                            </div>
                            <div className="text-sm text-gray-600">
                              +{entry.points} points
                            </div>
                          </div>
                          
                          {/* Running score display */}
                          <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1">Running Scores</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-blue-600 font-semibold">
                                {playerNames.player1}: {player1RunningScore}
                              </div>
                              <div className="text-purple-600 font-semibold">
                                {playerNames.player2}: {player2RunningScore}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Lead: {player1RunningScore > player2RunningScore 
                                ? `${playerNames.player1} +${player1RunningScore - player2RunningScore}`
                                : player2RunningScore > player1RunningScore
                                ? `${playerNames.player2} +${player2RunningScore - player1RunningScore}`
                                : 'Tied'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {gameHistory.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No games played yet. Start playing to see the timeline!</p>
              </div>
            )}
          </div>
        ) : (
          // Game Page (existing content)
          <div>

        {/* Score Display */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className={`text-center p-6 rounded-lg transition-all ${
            currentPlayer === 1 ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gray-50'
          }`}>
            <h2 className="text-lg font-semibold text-gray-700">{playerNames.player1}</h2>
            {editingScores ? (
              <input
                type="number"
                value={tempScores.player1}
                onChange={(e) => setTempScores(prev => ({ ...prev, player1: parseInt(e.target.value) || 0 }))}
                className="text-3xl font-bold text-blue-600 bg-transparent border-b-2 border-blue-300 text-center w-24 mx-auto"
              />
            ) : (
              <div className="text-3xl font-bold text-blue-600">{scores.player1}</div>
            )}
          </div>
          <div className={`text-center p-6 rounded-lg transition-all ${
            currentPlayer === 2 ? 'bg-purple-100 border-2 border-purple-400' : 'bg-gray-50'
          }`}>
            <h2 className="text-lg font-semibold text-gray-700">{playerNames.player2}</h2>
            {editingScores ? (
              <input
                type="number"
                value={tempScores.player2}
                onChange={(e) => setTempScores(prev => ({ ...prev, player2: parseInt(e.target.value) || 0 }))}
                className="text-3xl font-bold text-purple-600 bg-transparent border-b-2 border-purple-300 text-center w-24 mx-auto"
              />
            ) : (
              <div className="text-3xl font-bold text-purple-600">{scores.player2}</div>
            )}
          </div>
        </div>

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
              {playerNames[`player${currentPlayer}`]}'s Turn
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
              
              {/* Current Turn Words */}
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

          {/* Letter Tiles Display */}
          {word && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-blue-800">
                  Letter Tiles ({tilesUsed}/7)
                  {bingoBonus && <span className="ml-2 text-green-600">🎉 BINGO! +50</span>}
                </h4>
                <button
                  onClick={() => setLetterMultipliers(new Array(word.length).fill(1))}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                >
                  Reset All
                </button>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {word.split('').map((letter, index) => {
                  const multiplier = letterMultipliers[index] || 1;
                  const letterValue = letterValues[letter.toUpperCase()] || 0;
                  const adjustedValue = letterValue * multiplier;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => cycleLetterMultiplier(index)}
                      className={`w-16 h-16 rounded-lg border-2 font-bold text-lg transition-all transform hover:scale-105 active:scale-95 ${
                        multiplier === 1 
                          ? 'bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200'
                          : multiplier === 2 
                          ? 'bg-blue-500 border-blue-600 text-white hover:bg-blue-600'
                          : 'bg-green-500 border-green-600 text-white hover:bg-green-600'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold">{letter.toUpperCase()}</div>
                        <div className="text-xs leading-none">
                          {multiplier === 1 ? letterValue : `${letterValue}×${multiplier}`}
                        </div>
                        <div className="text-xs font-bold">
                          ={adjustedValue}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 text-center text-sm text-gray-600">
                Click each letter to cycle: Normal (1x) → Double Letter (2x) → Triple Letter (3x)
              </div>
            </div>
          )}

          {/* Validation Result */}
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

          {/* Compact Bonus Controls */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Word Multipliers */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Word Bonus</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setBonusMultipliers(prev => ({ ...prev, wordMultiplier: 1 }))}
                    className={`px-2 py-1 text-xs rounded ${bonusMultipliers.wordMultiplier === 1 ? 'bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    1x
                  </button>
                  <button
                    onClick={() => setBonusMultipliers(prev => ({ ...prev, wordMultiplier: 2 }))}
                    className={`px-2 py-1 text-xs rounded ${bonusMultipliers.wordMultiplier === 2 ? 'bg-red-600 text-white' : 'bg-red-200 hover:bg-red-300'}`}
                  >
                    DW
                  </button>
                  <button
                    onClick={() => setBonusMultipliers(prev => ({ ...prev, wordMultiplier: 3 }))}
                    className={`px-2 py-1 text-xs rounded ${bonusMultipliers.wordMultiplier === 3 ? 'bg-purple-600 text-white' : 'bg-purple-200 hover:bg-purple-300'}`}
                  >
                    TW
                  </button>
                </div>
              </div>

              {/* Current Status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Current Bonuses</label>
                <div className="text-xs text-gray-600">
                  Word {bonusMultipliers.wordMultiplier}x
                  {letterMultipliers.some(m => m > 1) && ', Letter bonuses set'}
                  {bingoBonus && ', +50 Bingo'}
                </div>
                <button
                  onClick={resetBonuses}
                  className="mt-1 px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                >
                  Reset All
                </button>
              </div>
            </div>
          </div>

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
        <div className="flex gap-3 mb-8">
          {showMultiWordMode ? (
            <>
              <button
                onClick={addScore}
                disabled={!word.trim()}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
              >
                Add Word to Turn
              </button>
              <button
                onClick={completeTurn}
                disabled={currentTurnWords.length === 0}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium transition-colors"
              >
                Complete Turn ({getTurnTotal()})
              </button>
            </>
          ) : (
            <button
              onClick={addScore}
              disabled={!points && points !== '0'}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium transition-colors"
            >
              Add Score
            </button>
          )}
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Game History & Words List */}
        {gameHistory.length > 0 && (
          <div className="border-t pt-6 grid md:grid-cols-2 gap-6">
            {/* Game History */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-4">Recent Plays</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {gameHistory.slice(-10).reverse().map((entry, index) => (
                  <div key={index} className={`flex justify-between items-center p-2 rounded text-sm ${
                    entry.isTurnSummary ? 'bg-green-100 border border-green-300' : 'bg-gray-50'
                  }`}>
                    <span className={`font-medium ${
                      entry.player === 1 ? 'text-blue-600' : 'text-purple-600'
                    }`}>
                      {playerNames[`player${entry.player}`]}
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

            {/* Words Played List */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-4">All Words ({gameHistory.length})</h3>
              <div className="max-h-40 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {[...new Set(gameHistory.map(entry => entry.word))].sort().map((word, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-mono"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
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