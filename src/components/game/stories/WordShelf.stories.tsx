import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import WordShelf from '../WordShelf';

const meta: Meta<typeof WordShelf> = {
  title: 'Game/WordShelf',
  component: WordShelf,
  parameters: {
    docs: {
      description: {
        component: 'WordShelf displays words added to the current turn and provides an "Add Word" button when a valid word is available.',
      },
    },
  },
  argTypes: {
    currentTurnWords: {
      description: 'Array of words added to the current turn',
    },
    currentWordInfo: {
      description: 'Information about the current word being typed',
    },
    onAddWord: { action: 'add word' },
    onRemoveWord: { action: 'remove word' },
    onWordClick: { action: 'word clicked' },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof WordShelf>;

const sampleWords = [
  { word: 'HELLO', points: 8, definition: 'A greeting' },
  { word: 'WORLD', points: 12, definition: 'The Earth' },
  { word: 'QUIZ', points: 22, definition: 'A test' },
];

export const Empty: Story = {
  args: {
    currentTurnWords: [],
    currentWordInfo: undefined,
  },
};

export const WithValidWord: Story = {
  args: {
    currentTurnWords: [],
    currentWordInfo: {
      word: 'BOOKS',
      points: 15,
      isValid: true,
    },
  },
};

export const WithInvalidWord: Story = {
  args: {
    currentTurnWords: [],
    currentWordInfo: {
      word: 'XZXZ',
      points: 0,
      isValid: false,
    },
  },
};

export const WithWords: Story = {
  args: {
    currentTurnWords: sampleWords,
    currentWordInfo: undefined,
  },
};

export const WithWordsAndValidWord: Story = {
  args: {
    currentTurnWords: sampleWords,
    currentWordInfo: {
      word: 'STORY',
      points: 18,
      isValid: true,
    },
  },
};

export const SingleWord: Story = {
  args: {
    currentTurnWords: [{ word: 'HELLO', points: 8, definition: 'A greeting' }],
    currentWordInfo: undefined,
  },
};

export const ManyWords: Story = {
  args: {
    currentTurnWords: [
      { word: 'HELLO', points: 8, definition: 'A greeting' },
      { word: 'WORLD', points: 12, definition: 'The Earth' },
      { word: 'QUIZ', points: 22, definition: 'A test' },
      { word: 'JUMP', points: 15, definition: 'To leap' },
      { word: 'HAPPY', points: 14, definition: 'Joyful' },
      { word: 'ZEBRA', points: 16, definition: 'Striped animal' },
    ],
    currentWordInfo: {
      word: 'FINAL',
      points: 8,
      isValid: true,
    },
  },
};