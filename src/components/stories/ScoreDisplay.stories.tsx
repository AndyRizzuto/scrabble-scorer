import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ScoreDisplay from '../score/ScoreDisplay';

const meta: Meta<typeof ScoreDisplay> = {
  title: 'Score/ScoreDisplay',
  component: ScoreDisplay,
  parameters: {
    docs: {
      description: {
        component: 'ScoreDisplay shows current player scores with highlighting for the active player and inline editing capability.',
      },
    },
  },
  argTypes: {
    currentPlayer: {
      control: { type: 'select' },
      options: [1, 2],
      description: 'The current active player (highlighted)',
    },
    onScoresUpdate: { action: 'scores updated' },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof ScoreDisplay>;

export const Default: Story = {
  args: {
    players: {
      player1: { id: 1, name: 'Alice', score: 42 },
      player2: { id: 2, name: 'Bob', score: 37 },
    },
    currentPlayer: 1,
  },
};

export const HighScores: Story = {
  args: {
    players: {
      player1: { id: 1, name: 'Sarah', score: 387 },
      player2: { id: 2, name: 'Mike', score: 412 },
    },
    currentPlayer: 2,
  },
};

export const CloseGame: Story = {
  args: {
    players: {
      player1: { id: 1, name: 'Emma', score: 298 },
      player2: { id: 2, name: 'Josh', score: 301 },
    },
    currentPlayer: 1,
  },
};

export const EarlyGame: Story = {
  args: {
    players: {
      player1: { id: 1, name: 'Taylor', score: 0 },
      player2: { id: 2, name: 'Jordan', score: 0 },
    },
    currentPlayer: 1,
  },
};
