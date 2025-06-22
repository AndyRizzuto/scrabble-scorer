import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TileBagButton from '../TileBagButton';

const meta: Meta<typeof TileBagButton> = {
  title: 'Tiles/TileBagButton',
  component: TileBagButton,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof TileBagButton>;

export const Default: Story = {
  args: {
    usedTiles: 14,
    tilesRemaining: 100,
    onClick: () => {},
  },
};
