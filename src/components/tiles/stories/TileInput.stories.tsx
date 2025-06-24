import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TileInput from '../TileInput';

const meta: Meta<typeof TileInput> = {
  title: 'Tiles/TileInput',
  component: TileInput,
  parameters: {
    docs: {
      description: {
        component: 'TileInput represents a single Scrabble tile with letter input and multiplier controls. Click the tile to cycle through multipliers.',
      },
    },
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'The letter displayed on the tile',
    },
    multiplier: {
      control: { type: 'select' },
      options: [1, 2, 3],
      description: 'Letter multiplier (1x, 2x, 3x)',
    },
    index: {
      control: { type: 'number', min: 0, max: 6 },
      description: 'Position in word (0-6)',
    },
    autoFocus: {
      control: 'boolean',
      description: 'Whether this tile should auto-focus',
    },
    onLetterChange: { action: 'letter changed' },
    onMultiplierChange: { action: 'multiplier changed' },
    onNext: { action: 'move to next tile' },
    onPrevious: { action: 'move to previous tile' },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof TileInput>;

export const Default: Story = {
  args: {
    value: 'A',
    multiplier: 1,
    index: 0,
    autoFocus: false,
  },
};

export const DoubleLetterScore: Story = {
  args: {
    value: 'Z',
    multiplier: 2,
    index: 3,
    autoFocus: false,
  },
};

export const TripleLetterScore: Story = {
  args: {
    value: 'Q',
    multiplier: 3,
    index: 1,
    autoFocus: false,
  },
};

export const Empty: Story = {
  args: {
    value: '',
    multiplier: 1,
    index: 0,
    autoFocus: true,
  },
};

export const HighValueLetter: Story = {
  args: {
    value: 'X',
    multiplier: 2,
    index: 5,
    autoFocus: false,
  },
};
