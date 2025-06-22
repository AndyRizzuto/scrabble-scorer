import React from 'react';
import TileGrid from './TileGrid';

interface GamePageProps {
  // Add all props needed by the game page
  onAddWord: (word: string, points: number) => void;
  onClear: () => void;
  onWordChange: (word: string, points: number, tiles?: number) => void;
  onValidationChange: (result: any) => void;
  recentPlays: any[];
  players: any;
  onResetGame: () => void;
  currentTurnWords: any[];
  onRemoveWord: (index: number) => void;
  onWordClick: (word: string, definition?: string) => void;
  restoreToTiles: string;
  onCompleteTurn: () => void;
  currentTurnTotal: number;
  canCompleteTurn: boolean;
}

const GamePage: React.FC<GamePageProps> = (props) => (
  <div>
    <TileGrid
      onAddWord={props.onAddWord}
      onClear={props.onClear}
      onWordChange={props.onWordChange}
      onValidationChange={props.onValidationChange}
      recentPlays={props.recentPlays}
      players={props.players}
      onResetGame={props.onResetGame}
      currentTurnWords={props.currentTurnWords}
      onRemoveWord={props.onRemoveWord}
      onWordClick={props.onWordClick}
      restoreToTiles={props.restoreToTiles}
      onCompleteTurn={props.onCompleteTurn}
    />
    {props.canCompleteTurn && (
      <div className="mt-6">
        <button
          onClick={props.onCompleteTurn}
          className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors text-lg"
        >
          Complete Turn ({props.currentTurnTotal} points)
        </button>
      </div>
    )}
  </div>
);

export default GamePage;