import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TileInput from '../TileInput';

const meta: Meta<typeof TileInput> = {
  title: 'Tiles/TileInput',
  component: TileInput,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof TileInput>;

export const Default: Story = {
  args: {
    value: 'A',
    multiplier: 1,
    index: 0,
    onLetterChange: () => {},
    onMultiplierChange: () => {},
    onNext: () => {},
    onPrevious: () => {},
    autoFocus: false,
  },
};
