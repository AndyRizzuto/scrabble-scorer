import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import LetterTiles from '../LetterTiles';

const meta: Meta<typeof LetterTiles> = {
  title: 'Tiles/LetterTiles',
  component: LetterTiles,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof LetterTiles>;

export const Default: Story = {
  args: {
    word: 'SCRABBLE',
    letterMultipliers: [1, 1, 1, 1, 1, 1, 1, 1],
    bingoBonus: false,
    tilesUsed: 8,
    onLetterMultiplierChange: () => {},
    onResetAll: () => {},
  },
};
