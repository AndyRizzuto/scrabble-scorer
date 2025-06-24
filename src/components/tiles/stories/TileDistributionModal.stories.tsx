import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TileDistributionModal from '../TileDistributionModal';

const meta: Meta<typeof TileDistributionModal> = {
  title: 'Tiles/TileDistributionModal',
  component: TileDistributionModal,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'responsive',
    },
    docs: {
      description: {
        component: 'Shows the Scrabble tile distribution with point values and remaining counts. Updates in real-time as tiles are used during gameplay.'
      }
    }
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '100vw' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof TileDistributionModal>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
  },
};

export const WithUsedTiles: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    usedTiles: {
      A: 2,
      E: 3,
      T: 4,
      S: 2,
      R: 1,
      N: 2,
      O: 1
    },
  },
};

export const NearlyEmpty: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    usedTiles: {
      A: 8, B: 2, C: 2, D: 4, E: 11, F: 2, G: 3, H: 2, I: 8, J: 1,
      K: 1, L: 4, M: 2, N: 5, O: 7, P: 2, Q: 1, R: 5, S: 3, T: 5,
      U: 3, V: 2, W: 2, X: 1, Y: 2, Z: 1
    },
  },
};

export const SomeExhausted: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    usedTiles: {
      J: 1, // All J tiles used
      Q: 1, // All Q tiles used
      X: 1, // All X tiles used
      Z: 1, // All Z tiles used
      A: 5,
      E: 8,
      S: 3,
    },
  },
};
