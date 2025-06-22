import React from 'react';
import TileGrid from '../TileGrid';

export default {
  title: 'Tiles/TileGrid',
  component: TileGrid,
};

const baseProps = {
  onAddWord: () => alert('Add Word'),
  onClear: () => alert('Clear'),
  onCompleteTurn: () => alert('Complete Turn'),
  currentTurnWords: [],
  recentPlays: [],
  players: { player1: { name: 'Alice' }, player2: { name: 'Bob' } },
};

export const Default = () => <TileGrid {...baseProps} />;

export const WithShelfWords = () => (
  <TileGrid {...baseProps} currentTurnWords={[{ word: 'HELLO', points: 12 }]} />
);

export const DisabledCompleteTurn = () => (
  <TileGrid {...baseProps} />
);
