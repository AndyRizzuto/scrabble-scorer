# Application Logic

## Turn and Scoring Flow
- Players take turns entering words.
- Each word is validated and scored using Scrabble rules (see `utils/scoring.ts`).
- Words can be added one at a time or in multi-word mode (for a single turn).
- When a turn is completed, all words for that turn are saved to the game history.
- Bonuses (double/triple word/letter, bingo) are applied per word.

## Validation
- Words are validated locally and can be extended to use a dictionary API.
- Invalid words cannot be added to the turn or scored.

## State Management
- Main state is managed in `ScrabbleScorer`.
- Game state includes: player names, scores, current turn words, game history, and UI state (modals, editing, etc).

## Undo/Redo
- Recent turns can be undone, restoring words and scores.

## Data Flow
- Components communicate via props and callbacks.
- All scoring and validation logic is centralized in utility functions for consistency.

See also: [components.md](components.md), [data.md](data.md)
