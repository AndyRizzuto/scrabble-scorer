# Scrabble Score Keeper

A modern, modular Scrabble scorekeeping app built with React and TypeScript.

## Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Components](#components)
- [Logic](#logic)
- [Data Model](#data-model)
- [How It Works](#how-it-works)
- [Development](#development)
- [Further Reading](#further-reading)

## Overview
This app allows two players to keep score for a game of Scrabble, including support for multi-word turns, bonuses, and undoing turns. The codebase is fully typed and split into focused, reusable components.

## Project Structure
```
src/
  components/         # All React components
  types/              # TypeScript interfaces and types
  utils/              # Scoring and validation logic
  assets/             # Images and static assets
public/               # Static files
```

## Components
See [`docs/components.md`](docs/components.md) for a full breakdown of all UI components and their responsibilities.

## Logic
See [`docs/logic.md`](docs/logic.md) for a detailed explanation of the application's logic, turn flow, and state management.

## Data Model
See [`docs/data.md`](docs/data.md) for all TypeScript types and data flow documentation.

## How It Works
- Players enter their names and starting scores.
- On each turn, a player enters a word (or multiple words in multi-word mode).
- Words are validated and scored according to Scrabble rules, including letter/word multipliers and bingo bonuses.
- The turn is completed, and all words are added to the game history and score sheet.
- Recent plays and full score sheet are available for review. Turns can be undone if needed.

## Development
1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Further Reading
- [Components Documentation](docs/components.md)
- [Logic Documentation](docs/logic.md)
- [Data Model Documentation](docs/data.md)

---

For more details, see the `docs/` directory for in-depth documentation on each part of the application.

