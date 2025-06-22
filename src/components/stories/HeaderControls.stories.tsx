import React from 'react';
import HeaderControls from '../header/HeaderControls';

export default {
  title: 'Header/HeaderControls',
  component: HeaderControls,
  tags: ['autodocs'],
};

export const Default = {
  args: {
    editingScores: false,
    onToggleEditScores: () => alert('Toggle Edit Scores'),
    onSwitchTurn: () => alert('Switch Turn'),
    canSwitchTurn: true,
    onShowTileModal: () => alert('Show Tile Modal'),
    usedTiles: 7,
    tilesRemaining: 91,
    ResponsiveTimer: <span>Timer</span>,
  },
};
