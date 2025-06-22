import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ScoreDisplay from '../score/ScoreDisplay';

const meta: Meta<typeof ScoreDisplay> = {
  title: 'Score/ScoreDisplay',
  component: ScoreDisplay,
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
    onScoresUpdate: () => {},
  },
};
