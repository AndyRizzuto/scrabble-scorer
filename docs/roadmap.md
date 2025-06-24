# Product Roadmap

## Roadmap Themes & Sprints

### Sprint 1: Core Game Experience
**Goal:** Polish the main game flow and fix critical usability issues.
- [x] Fix keyboard input (focus, shortcuts, mobile)
- [x] **Fix “Complete Turn” button logic and UX**
    - [x] Ensure button always adds the current valid word (if present) and completes the turn
    - [x] Disable button if input is not empty and not valid
    - [x] All words (from shelf and input) are saved and displayed in recent plays
    - [x] Add clear feedback for users if the button is disabled (e.g., tooltip or helper text)
    - [x] Add tests for edge cases (multi-word, empty input, invalid input)
- [x] Remove unused components (MultiWordTurn, WordInput) from main app
- [x] **LetterBag: show tile score & count**
    - [x] Update LetterBag UI so each tile displays both its letter score and the count of remaining tiles
    - [x] Make the display visually clear and accessible (color, font size, layout)
    - [x] Ensure LetterBag updates in real time as tiles are played
    - [x] Add Storybook stories for tile count and score functionality
- [x] Remove reset button from game page (move to timeline)
- [ ] Timer: auto-start, unpause on play, sync with game state
- [x] Add Storybook and stories for all major components
- [x] Add stories for header and game management components (HeaderControls, HeaderNav, TurnManager, LogoWithFallback)
- [x] Integrate app CSS (Tailwind) into Storybook for visual parity
- [x] Polish Storybook stories (add controls, actions, docs, edge cases)
    - [x] RecentPlays story polished with edge cases and actions
    - [x] Controls checklist completed for all components
    - [x] Updated TurnManager, HeaderControls, ScoreDisplay, TileInput with full controls
    - [x] Fixed viewport issues for modal components (GameSetup, TileDistributionModal)
    - [x] Added comprehensive documentation and argTypes
    - [x] Converted legacy stories to proper Meta/StoryObj format
- [x] Finalize and stabilize automated tests for CI
- [ ] Refactor TileGrid and Timeline to use custom hooks for state/effects
    - [ ] Extract useTileInputState, useWordValidation, useRestoreTiles, useBingoConfetti, useTileGridShortcuts
    - [ ] Extract useGameSessions for Timeline

### Sprint 2: Score Sheet & Readability
**Goal:** Make the score page clear, beautiful, and easy to use.
- [ ] Make words bolder/more readable (consider monospaced font for last played)
- [ ] Align words (right) and scores (center) in columns
- [ ] Explore 2-column layout per player for clarity
- [ ] Give “Score Sheet” title more prominence (align with tile bag)

### Sprint 3: Timeline & Game History
**Goal:** Improve timeline clarity and interactivity.
- [ ] Fix active/paused status logic
- [ ] Show % of games won (not just total)
- [ ] Add timeline-game-bar-tray (expandable tray for each game)
    - [ ] Header: left = game start datetime, right = reset
    - [ ] Below: recent plays (reuse component from Game page)
- [ ] Make recent plays look/feel consistent across app

## Future Ideas & Exploration
- Instructions, rules, and house rules (with voting)
- Persistence: Firebase for users, live updates, game invites
- Scorekeeper role vs. distributed entry (balance digital & human connection)
- Customizable score sheets: legal pad, envelope, receipt, etc.
- Custom pens, markers, and fonts
- Add other games (pinochle, spades, euchre, etc.)

## How We Work
- **Theme-based sprints:** Each sprint focuses on a single area/theme for deep improvement.
- **User-first:** Prioritize features that improve clarity, fun, and reduce friction.
- **Component reuse:** Strive for shared UI/logic between pages (e.g., recent plays).
- **Continuous feedback:** Ship improvements, gather feedback, iterate.

---

**Next Steps:**
1. Review and prioritize Sprint 1 tasks as a team.
2. Break down each task into actionable issues/stories.
3. Assign owners and set a sprint goal (e.g., "Game flow is smooth and bug-free").

Let’s focus on one theme at a time for maximum impact!
