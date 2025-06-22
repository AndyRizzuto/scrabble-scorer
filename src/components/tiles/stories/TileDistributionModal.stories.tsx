import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TileDistributionModal from '../TileDistributionModal';

const meta: Meta<typeof TileDistributionModal> = {
  title: 'Tiles/TileDistributionModal',
  component: TileDistributionModal,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof TileDistributionModal>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
  },
};
