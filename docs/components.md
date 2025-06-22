# Components Overview

## Main Components

### ScrabbleScorer
- Orchestrates game state, turn logic, and history.
- Renders all subcomponents and manages data flow.

### GameSetup
- Modal for entering player names and starting scores.
- Handles initial game setup and reset.

### ScoreDisplay
- Shows current scores for both players.
- Allows inline editing of scores.

### TurnManager
- Controls turn switching and toggling multi-word mode.
- Shows current player and turn status.

### WordInput
- Handles word entry, validation, and scoring.
- Manages letter multipliers, word bonuses, and bingo detection.

### LetterTiles
- Visual representation of Scrabble tiles.
- Allows users to set letter multipliers per tile.

### MultiWordTurn
- Displays all words added in the current turn.
- Allows removal of words before completing the turn.

### ScoreSheet
- Displays the full game history in a score sheet layout.
- Uses cursive font with bold weight for readability.

### RecentPlays
- Shows a summary of recent plays grouped by turn.
- Allows undoing recent turns.

### TileGrid
- Main input grid for entering words and managing tiles.
- Contains action buttons for adding words and completing turns.

## Utility Modules

### utils/scoring.ts
- Contains all scoring and validation logic.
- Exports constants and functions for calculating word values, bonuses, and validating words.

### types/game.ts
- Defines all TypeScript interfaces for game data, state, and validation.

See also: [logic.md](logic.md), [data.md](data.md)
