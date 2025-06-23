# Scrabble Scorer

A modern, user-friendly Scrabble scorekeeping app with a focus on clarity, speed, and beautiful UI.

## Key Features
- Fast, keyboard-driven scoring for two players
- Multi-word turns, shelf, and undo support
- Timeline/history with win stats and game details
- Score sheet with clear, readable layout
- Responsive design and mobile-friendly
- Built with React, TypeScript, Vite, and Tailwind CSS

## Storybook
- All major UI components have Storybook stories, including header and game management components.
- Stories include edge cases, actions, and autodocs for prop tables.
- RecentPlays story is fully polished with controls and actions.
- Controls checklist is in progress for all components—contributions welcome!
- To run Storybook:
  ```sh
  npm run storybook
  ```

## Automated Tests
- Automated tests cover all major game logic and UI flows.
- Tests are stable and ready for CI integration.

## Code Quality & Refactoring
- Unused components (MultiWordTurn, WordInput) have been removed from the main app.
- Refactor plan in place to extract custom hooks from TileGrid and Timeline for maintainability.

## Contributing
- See the roadmap for current priorities and open tasks.
- Please help expand Storybook controls and polish stories for all components.
- Open issues for bugs, feature requests, or questions.

## Roadmap
See [docs/roadmap.md](docs/roadmap.md) for detailed sprints, themes, and next steps.

