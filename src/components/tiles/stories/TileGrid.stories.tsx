import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TileGrid from '../TileGrid';

const meta: Meta<typeof TileGrid> = {
  title: 'Tiles/TileGrid',
  component: TileGrid,
  parameters: {
    docs: {
      description: {
        component: 'TileGrid is the main word entry and scoring interface for each turn.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof TileGrid>;

const baseProps = {
  onAddWord: () => alert('Add Word'),
  onClear: () => alert('Clear'),
  onCompleteTurn: () => alert('Complete Turn'),
  currentTurnWords: [],
};

export const Default: Story = {
  args: {
    ...baseProps,
  },
  parameters: {
    docs: {
      source: {
        code: `<TileGrid {...baseProps} />`,
      },
    },
  },
};

export const WithShelfWords: Story = {
  args: {
    ...baseProps,
    currentTurnWords: [{ word: 'HELLO', points: 12 }],
  },
  parameters: {
    docs: {
      source: {
        code: `<TileGrid {...baseProps} currentTurnWords={[{ word: 'HELLO', points: 12 }]} />`,
      },
    },
  },
};

export const DisabledCompleteTurn: Story = {
  args: {
    ...baseProps,
  },
  parameters: {
    docs: {
      source: {
        code: `<TileGrid {...baseProps} />`,
      },
    },
  },
};
