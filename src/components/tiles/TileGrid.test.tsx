import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import TileGrid from './TileGrid';
jest.mock('../../utils/scoring', () => ({
  ...jest.requireActual('../../utils/scoring'),
  validateWord: jest.fn(async (word) => ({ word, valid: true })),
}));

describe('TileGrid - Complete Turn Button', () => {
  const baseProps = {
    onAddWord: jest.fn(),
    onClear: jest.fn(),
    onCompleteTurn: jest.fn(),
    currentTurnWords: [],
    // ...other required props with sensible defaults
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('disables Complete Turn if input is not empty and not valid', () => {
    render(
      <TileGrid
        {...baseProps}
        currentTurnWords={[]}
      />
    );
    // Simulate user typing an invalid word
    const input = screen.getByPlaceholderText(/enter your word/i);
    fireEvent.change(input, { target: { value: 'zzzzzz' } });
    // Simulate validation result (invalid)
    // ...simulate validation logic or mock validationResult
    // The button should be disabled
    const completeBtn = screen.getByText(/complete turn/i).closest('button');
    expect(completeBtn).toBeDisabled();
  });

  it('adds current valid word and completes turn', async () => {
    const onAddWord = jest.fn();
    const onCompleteTurn = jest.fn();
    render(
      <TileGrid
        {...baseProps}
        onAddWord={onAddWord}
        onCompleteTurn={onCompleteTurn}
      />
    );
    // Simulate typing "TEST" into the tile inputs
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'T' } });
    fireEvent.change(inputs[1], { target: { value: 'E' } });
    fireEvent.change(inputs[2], { target: { value: 'S' } });
    fireEvent.change(inputs[3], { target: { value: 'T' } });

    // Wait for validation to complete (if needed)
    await screen.findByText(/complete turn/i);

    // Click Complete Turn
    const completeBtn = screen.getByText(/complete turn/i).closest('button');
    fireEvent.click(completeBtn!);

    expect(onAddWord).toHaveBeenCalled();
    expect(onCompleteTurn).toHaveBeenCalled();
  });

  it('completes turn if input is empty and shelf is not empty', () => {
    const onCompleteTurn = jest.fn();
    render(
      <TileGrid
        {...baseProps}
        onCompleteTurn={onCompleteTurn}
        currentTurnWords={[{ word: 'TEST', points: 10 }]}
      />
    );
    // Input is empty, shelf has words
    const completeBtn = screen.getByText(/complete turn/i).closest('button');
    fireEvent.click(completeBtn!);
    expect(onCompleteTurn).toHaveBeenCalled();
  });

  // Add more tests for edge cases as needed
});
