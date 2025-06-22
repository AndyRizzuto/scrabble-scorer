import React from 'react';

interface ScoreSheetProps {
  players: { player1: { name: string; score: number }; player2: { name: string; score: number } };
  gameHistory: any[];
  getWinStats: (playerKey: 'player1' | 'player2') => { totalWins: number; currentStreak: number; hasFlame: boolean };
}

const ScoreSheet: React.FC<ScoreSheetProps> = ({ players, gameHistory, getWinStats }) => (
  <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-lg" style={{
    backgroundImage: `repeating-linear-gradient(transparent,transparent 24px,#e5e7eb 24px,#e5e7eb 25px)`,
    minHeight: '400px',
    fontFamily: 'cursive',
    fontWeight: 700
  }}>
    {/* Player Name Headers with Win Stats */}
    <div className="grid grid-cols-2 gap-8 mb-6 pb-4 border-b-2 border-gray-400">
      <div className="text-center">
        <h3 className="text-xl font-bold text-blue-700 underline" style={{ fontFamily: 'cursive', fontWeight: 700 }}>{players.player1.name}</h3>
        {(() => {
          const stats = getWinStats('player1');
          return (
            <div className="mt-2 text-lg font-bold text-blue-600" style={{ fontFamily: 'cursive', fontWeight: 700 }}>
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
        <h3 className="text-xl font-bold text-purple-700 underline" style={{ fontFamily: 'cursive', fontWeight: 700 }}>{players.player2.name}</h3>
        {(() => {
          const stats = getWinStats('player2');
          return (
            <div className="mt-2 text-lg font-bold text-purple-600" style={{ fontFamily: 'cursive', fontWeight: 700 }}>
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
          return (
            <div key={`p1-${index}`} className="flex justify-between items-center text-base" style={{ fontFamily: 'cursive', fontWeight: 700 }}>
              <div className="font-semibold text-blue-800" style={{ fontFamily: 'cursive', fontWeight: 700 }}>
                {entry.isTurnSummary ? (
                  <span className="text-blue-600 font-bold">{entry.points}</span>
                ) : (
                  `${entry.points}`
                )}
              </div>
              <div className="text-gray-700 text-right flex-1 ml-2" style={{ fontFamily: 'cursive', fontWeight: 700 }}>
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
            <div className="text-center font-bold text-2xl text-blue-700 bg-blue-50 rounded px-2 py-1" style={{ fontFamily: 'cursive', fontWeight: 700 }}>
              {players.player1.score}
            </div>
          </div>
        )}
      </div>
      {/* Player 2 Column */}
      <div className="space-y-2">
        {gameHistory.filter(entry => entry.player === 2).map((entry, index) => {
          return (
            <div key={`p2-${index}`} className="flex justify-between items-center text-base" style={{ fontFamily: 'cursive', fontWeight: 700 }}>
              <div className="font-semibold text-purple-800" style={{ fontFamily: 'cursive', fontWeight: 700 }}>
                {entry.isTurnSummary ? (
                  <span className="text-purple-600 font-bold">{entry.points}</span>
                ) : (
                  `${entry.points}`
                )}
              </div>
              <div className="text-gray-700 text-right flex-1 ml-2" style={{ fontFamily: 'cursive', fontWeight: 700 }}>
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
            <div className="text-center font-bold text-2xl text-purple-700 bg-purple-50 rounded px-2 py-1" style={{ fontFamily: 'cursive', fontWeight: 700 }}>
              {players.player2.score}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default ScoreSheet;
