import React from 'react';
import { TrendingUp, Trophy, Target, Users } from 'lucide-react';

interface GameHistoryEntry {
  player: number;
  word: string;
  points: number;
  time: string;
  bonuses?: any;
  isTurnSummary?: boolean;
}

interface GameStatsProps {
  gameHistory: GameHistoryEntry[];
  playerNames: { player1: string; player2: string };
  scores: { player1: number; player2: number };
}

export const GameStats: React.FC<GameStatsProps> = ({
  gameHistory,
  playerNames,
  scores
}) => {
  if (gameHistory.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No statistics available yet. Start playing to see your stats!</p>
      </div>
    );
  }

  // Filter out turn summaries for word statistics
  const wordEntries = gameHistory.filter(entry => !entry.isTurnSummary);
  
  // Calculate statistics
  const totalWords = wordEntries.length;
  const averageWordScore = totalWords > 0 
    ? Math.round(wordEntries.reduce((sum, entry) => sum + entry.points, 0) / totalWords)
    : 0;
  
  const highestScoringWord = wordEntries.reduce((highest, entry) => 
    entry.points > highest.points ? entry : highest
  , { word: '', points: 0, player: 1 });

  // Player-specific stats
  const player1Words = wordEntries.filter(entry => entry.player === 1);
  const player2Words = wordEntries.filter(entry => entry.player === 2);
  
  const player1Avg = player1Words.length > 0 
    ? Math.round(player1Words.reduce((sum, entry) => sum + entry.points, 0) / player1Words.length)
    : 0;
  
  const player2Avg = player2Words.length > 0 
    ? Math.round(player2Words.reduce((sum, entry) => sum + entry.points, 0) / player2Words.length)
    : 0;

  const player1Best = player1Words.reduce((highest, entry) => 
    entry.points > highest.points ? entry : highest
  , { word: '', points: 0 });

  const player2Best = player2Words.reduce((highest, entry) => 
    entry.points > highest.points ? entry : highest
  , { word: '', points: 0 });

  // Unique words count
  const uniqueWords = new Set(wordEntries.map(entry => entry.word)).size;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Statistics</h2>
      
      {/* Overall Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
          <div className="text-2xl font-bold text-blue-600">{totalWords}</div>
          <div className="text-sm text-gray-600">Total Words</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <Target className="w-6 h-6 mx-auto mb-2 text-green-600" />
          <div className="text-2xl font-bold text-green-600">{averageWordScore}</div>
          <div className="text-sm text-gray-600">Avg Points</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <Trophy className="w-6 h-6 mx-auto mb-2 text-purple-600" />
          <div className="text-2xl font-bold text-purple-600">{highestScoringWord.points}</div>
          <div className="text-sm text-gray-600">Best Word</div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-orange-600" />
          <div className="text-2xl font-bold text-orange-600">{uniqueWords}</div>
          <div className="text-sm text-gray-600">Unique Words</div>
        </div>
      </div>

      {/* Best Word */}
      {highestScoringWord.word && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">🏆 Highest Scoring Word</h3>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xl font-bold">{highestScoringWord.word}</span>
            <div className="text-right">
              <div className="font-bold text-yellow-600">{highestScoringWord.points} points</div>
              <div className="text-sm text-gray-600">
                by {playerNames[`player${highestScoringWord.player}` as keyof typeof playerNames]}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Player Comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-3">{playerNames.player1}</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Score:</span>
              <span className="font-bold">{scores.player1}</span>
            </div>
            <div className="flex justify-between">
              <span>Words Played:</span>
              <span className="font-bold">{player1Words.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Average Word:</span>
              <span className="font-bold">{player1Avg}</span>
            </div>
            {player1Best.word && (
              <div className="flex justify-between">
                <span>Best Word:</span>
                <span className="font-bold">{player1Best.word} ({player1Best.points})</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-3">{playerNames.player2}</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Score:</span>
              <span className="font-bold">{scores.player2}</span>
            </div>
            <div className="flex justify-between">
              <span>Words Played:</span>
              <span className="font-bold">{player2Words.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Average Word:</span>
              <span className="font-bold">{player2Avg}</span>
            </div>
            {player2Best.word && (
              <div className="flex justify-between">
                <span>Best Word:</span>
                <span className="font-bold">{player2Best.word} ({player2Best.points})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Word Length Analysis */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Word Length Distribution</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[2, 3, 4, 5, 6, 7].map(length => {
            const wordsOfLength = wordEntries.filter(entry => entry.word.length === length);
            const count = wordsOfLength.length;
            const avgPoints = count > 0 
              ? Math.round(wordsOfLength.reduce((sum, entry) => sum + entry.points, 0) / count)
              : 0;
            
            return (
              <div key={length} className="text-center p-2 bg-white rounded">
                <div className="font-bold text-lg">{length}</div>
                <div className="text-xs text-gray-600">{count} words</div>
                {count > 0 && (
                  <div className="text-xs text-gray-500">~{avgPoints} pts</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};