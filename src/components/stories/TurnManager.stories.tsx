import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TurnManager from '../game/TurnManager';
import { Player, WordEntry } from '../../types/game';

const meta: Meta<typeof TurnManager> = {
  title: 'Game/TurnManager',
  component: TurnManager,
  parameters: {
    docs: {
      description: {
        component: 'TurnManager handles player turn switching and displays current turn information with word shelf.',
      },
    },
  },
  argTypes: {
    currentPlayer: {
      control: { type: 'select' },
      options: [1, 2],
      description: 'The current active player',
    },
    showMultiWordMode: {
      control: 'boolean',
      description: 'Whether multi-word mode is enabled',
    },
    onSwitchTurn: { action: 'switch turn' },
    onToggleMultiWordMode: { action: 'toggle multi-word mode' },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof TurnManager>;

const player1: Player = { id: 1, name: 'Alice', score: 120 };
const player2: Player = { id: 2, name: 'Bob', score: 110 };
const sampleWords: WordEntry[] = [
  { word: 'QUIZ', basePoints: 22, bonusPoints: 0, finalPoints: 22, bonuses: { letterMultiplier: 1, wordMultiplier: 1 }, letterMultipliers: [], bingoBonus: false, tilesUsed: 4 },
];

export const Default: Story = {
  args: {
    players: { player1, player2 },
    currentPlayer: 1,
    showMultiWordMode: false,
    currentTurnWords: [],
  },
};

export const MultiWordMode: Story = {
  args: {
    players: { player1, player2 },
    currentPlayer: 2,
    showMultiWordMode: true,
    currentTurnWords: sampleWords,
  },
};

export const WithManyWords: Story = {
  args: {
    players: { player1, player2 },
    currentPlayer: 1,
    showMultiWordMode: true,
    currentTurnWords: [
      { word: 'HELLO', basePoints: 8, bonusPoints: 2, finalPoints: 10, bonuses: { letterMultiplier: 1, wordMultiplier: 1 }, letterMultipliers: [], bingoBonus: false, tilesUsed: 5 },
      { word: 'WORLD', basePoints: 9, bonusPoints: 3, finalPoints: 12, bonuses: { letterMultiplier: 1, wordMultiplier: 1 }, letterMultipliers: [], bingoBonus: false, tilesUsed: 5 },
      { word: 'TEST', basePoints: 4, bonusPoints: 0, finalPoints: 4, bonuses: { letterMultiplier: 1, wordMultiplier: 1 }, letterMultipliers: [], bingoBonus: false, tilesUsed: 4 },
    ],
  },
};
