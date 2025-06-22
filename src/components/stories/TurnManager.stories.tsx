import React from 'react';
import TurnManager from '../game/TurnManager';
import { Player, WordEntry } from '../../types/game';

const player1: Player = { id: 1, name: 'Alice', score: 120 };
const player2: Player = { id: 2, name: 'Bob', score: 110 };
const sampleWords: WordEntry[] = [
  { word: 'QUIZ', basePoints: 22, bonusPoints: 0, finalPoints: 22, bonuses: { letterMultiplier: 1, wordMultiplier: 1 }, letterMultipliers: [], bingoBonus: false, tilesUsed: 4 },
];

export default {
  title: 'Game/TurnManager',
  component: TurnManager,
  tags: ['autodocs'],
};

export const Default = {
  args: {
    players: { player1, player2 },
    currentPlayer: 1,
    showMultiWordMode: false,
    currentTurnWords: [],
    onSwitchTurn: () => alert('Switch Turn'),
    onToggleMultiWordMode: () => alert('Toggle MultiWord Mode'),
  },
};

export const MultiWordMode = {
  args: {
    players: { player1, player2 },
    currentPlayer: 2,
    showMultiWordMode: true,
    currentTurnWords: sampleWords,
    onSwitchTurn: () => alert('Switch Turn'),
    onToggleMultiWordMode: () => alert('Toggle MultiWord Mode'),
  },
};
