# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server on port 3000 (auto-opens browser)
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run preview` - Preview production build
- `npm start` - Alias for `npm run dev`

### CSS/Styling Issues
This project uses **Tailwind CSS v3.4.x** (not v4). If CSS styles aren't being applied:
1. Check `postcss.config.js` uses `import tailwindcss from 'tailwindcss'` (not `@tailwindcss/postcss`)
2. Verify `tailwind.config.js` includes all content paths: `./main.tsx`, `./scrabble_scorer.tsx`, `./src/**/*.{js,ts,jsx,tsx}`
3. Clear Vite cache: `rm -rf node_modules/.vite && npm run dev`

## Architecture Overview

### Component Architecture
This codebase was refactored from a monolithic 900-line component into a modular React architecture:

**Main Orchestrator**: `ScrabbleScorer.tsx` - Manages all game state, coordinates between child components
- Game state: players, scores, turn management, history
- Word input state: current word, points, multipliers, bonuses
- UI state: setup modal, page navigation

**Specialized Components**:
- `GameSetup.tsx` - Initial player configuration modal
- `ScoreDisplay.tsx` - Player scores with inline editing capability
- `TurnManager.tsx` - Turn switching and multi-word mode controls
- `TileGrid.tsx` - Primary word input with visual tiles, validation, and scoring
- `MultiWordTurn.tsx` - Multi-word turn summary and management (legacy)

**Component Organization**:
- `/src/components/game/` - Game flow components (setup, turn management, timeline)
- `/src/components/score/` - Scoring and display components
- `/src/components/tiles/` - Tile input and bag components
- `/src/components/header/` - Navigation and header components
- `/src/components/stories/` - Storybook stories for all components

### Key Data Flow Patterns
1. **State Management**: All game state lives in `ScrabbleScorer`, passed down via props
2. **Event Handling**: Child components receive handler functions, bubble events up
3. **Word Processing**: `TileGrid` handles complex scoring logic with integrated visual tiles
4. **Turn Logic**: Multi-word turns accumulate in `currentTurnWords` array before being committed

### Type System
Comprehensive TypeScript interfaces in `src/types/game.ts`:
- `Player`, `WordEntry`, `GameHistoryEntry` - Core game entities
- `BonusMultipliers`, `ValidationResult`, `SetupData` - Feature-specific types
- `GameState` - Complete application state shape

### Business Logic Layer
`src/utils/scoring.ts` contains pure functions:
- `LETTER_VALUES` - Scrabble letter point values
- `calculateWordValue()` - Base word scoring
- `calculateBonusPoints()` - Complex multiplier calculations with bingo bonus
- `validateWord()` - Word validation (ready for dictionary API integration)

## Important Implementation Details

### Scoring System
- Base scoring uses standard Scrabble letter values
- Letter multipliers (2x, 3x) apply per-letter before word multipliers
- Word multipliers (2x, 3x) apply to entire word total
- Bingo bonus adds flat +50 points for using all 7 tiles
- Multi-word turns accumulate points across multiple words

### Component Communication
- No Context API or Redux - uses prop drilling pattern
- Parent-to-child: Props for data and event handlers
- Child-to-parent: Callback functions for state updates
- Sibling communication: Through shared parent state

### Legacy Code
- `scrabble_scorer.tsx` - Original monolithic component (preserved for reference)
- `WordInput.tsx` - Empty file, component functionality moved to `TileGrid`
- `MultiWordTurn.tsx` - Legacy multi-word component (replaced by shelf functionality)
- Current architecture uses `main.tsx` → `ScrabbleScorer` component tree

### Styling Architecture
- Tailwind CSS with utility-first approach
- PostCSS processing with autoprefixer
- Responsive design with mobile-first breakpoints
- Component-level styling via className props

## File Organization Logic
- `/src/components/` - All React components organized by feature
  - `/game/` - Game flow and management components
  - `/score/` - Scoring display and timer components  
  - `/tiles/` - Tile input, bag, and grid components
  - `/header/` - Navigation and branding components
  - `/stories/` - Storybook stories for all components
  - Each folder includes `index.ts` barrel exports
- `/src/types/` - TypeScript interfaces and type definitions  
- `/src/utils/` - Pure business logic functions
- `/docs/` - Project documentation and roadmap
- Root level - Configuration files, entry points, legacy code

## Development & Testing
- **Storybook**: All major components have stories with controls and actions
- **Testing**: Automated tests cover game logic and UI flows, ready for CI
- **Component Stories**: RecentPlays fully polished, controls checklist in progress for others