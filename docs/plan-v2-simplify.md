# Scrabble Scorer v2: Simplification & Camera Scoring Plan

## Vision

Strip this down to a **beautiful, focused scoring app** — then add camera-powered automatic scoring as the killer feature. Think "calculator for Scrabble" not "Scrabble game manager."

---

## Part 1: Simplify the App

### What to KEEP (core scorer)
- **Game Setup** — player names (2-4 players), starting scores
- **Tile Grid** — the 7-tile letter input with visual tiles (this is the heart of the app)
- **Scoring Engine** — letter values, letter multipliers (2x/3x), word multipliers (2x/3x), bingo bonus
- **Turn Completion** — add word, switch player, running score
- **Score Display** — current scores per player
- **Recent Plays** — last few words played (simple list)
- **Keyboard Shortcuts** — Enter to add word, Cmd+Enter to complete turn

### What to REMOVE (~2,400 lines of code)
| Feature | Lines | Why Remove |
|---------|-------|------------|
| Multi-game tracking / Timeline | ~370 | Overcomplicates a simple scorer |
| Turn Time Analytics | ~209 | Analytics bloat |
| Turn Timer (countdown + 8 sound effects) | ~250 | Replace with simple optional stopwatch |
| Success Animations / Confetti | ~163 | Cute but adds complexity |
| Game Sessions hook | ~105 | Dead code, duplicated in Timeline |
| Unused hooks (useTileInputState, useWordValidation) | ~132 | Never wired up |
| Test data generation in ScrabbleScorer | ~44 | Production pollution |
| Score Sheet view | ~253 | Merge useful parts into main view |
| Game Complete Banner | ~33 | Simplify to inline message |
| Responsive Timer | ~40 | Remove with timer rework |
| Win streak tracking | ~60 | Multi-game feature |
| Header page navigation (game/score/timeline) | ~60 | Single-page app, no pages needed |
| TileDistributionModal | ~78 | Nice-to-have, add back later |

### What to SIMPLIFY
- **ScrabbleScorer.tsx** (906 → ~300 lines): Single-game focus, no multi-game state, no page navigation
- **TileGrid.tsx** (410 → ~250 lines): Remove duplicated hook logic, extract scoring display
- **Score Display**: Merge the best of ScoreDisplay + ScoreSheet into one clean component
- **One page, no routing**: Game setup → scoring view. That's it.

### Target Architecture
```
src/
├── App.tsx                    (~50 lines - entry, setup flow)
├── components/
│   ├── GameSetup.tsx          (~100 lines - player config)
│   ├── TileInput.tsx          (~200 lines - the tile grid + multipliers)
│   ├── ScoreBoard.tsx         (~150 lines - scores + recent plays)
│   ├── CameraCapture.tsx      (~100 lines - photo/camera UI)  [NEW]
│   └── BoardRecognition.tsx   (~100 lines - OCR results)      [NEW]
├── hooks/
│   ├── useGameState.ts        (~100 lines - all game state)
│   └── useCamera.ts           (~80 lines - camera integration) [NEW]
├── utils/
│   ├── scoring.ts             (~90 lines - unchanged)
│   └── vision.ts              (~60 lines - Claude Vision API)  [NEW]
└── types/
    └── game.ts                (~50 lines - simplified types)
```

**Target: ~1,100 lines of app code** (down from ~4,700)

---

## Part 2: Elegant UI / Microinteractions

### Design Principles
1. **One screen** — no page navigation, everything visible at a glance
2. **Touch-friendly** — large tap targets for tile input (works on trackpad too)
3. **Subtle motion** — CSS transitions on score changes, tile placement
4. **Typography-driven** — scores are the hero, big and bold
5. **Dark mode** — single dark theme, looks great on Mac

### Microinteractions to Add
- Score count-up animation when points are added (CSS `@keyframes` or `framer-motion`)
- Tile press feedback (scale down on click, spring back)
- Smooth slide transition when switching players
- Subtle glow on the active player's score
- Camera shutter animation when capturing a photo

### UI Stack
- **Tailwind CSS** (keep, already using)
- **framer-motion** (add, for spring animations and layout transitions)
- Remove Storybook (unnecessary overhead for a small focused app — can add back later)

---

## Part 3: Camera-Powered Scoring

### How It Works
1. User taps "Scan Board" button (or keyboard shortcut)
2. Camera opens (or user selects a photo)
3. Photo is sent to **Claude Vision API**
4. Claude returns structured JSON: the word(s) played and tile positions
5. App auto-fills the tile grid with recognized letters
6. User confirms/adjusts and submits the score

### Why Claude Vision API
- **One API call replaces an entire computer vision pipeline** — no OpenCV, no Tesseract, no custom ML models
- Handles varying lighting, angles, board styles out of the box
- Returns structured data directly (not raw OCR text)
- Cost: ~$0.01-0.05 per photo (negligible for personal use)
- Your existing TileGrid serves as the manual fallback

### API Integration
```typescript
// utils/vision.ts
import Anthropic from "@anthropic-ai/sdk";

async function recognizeBoard(imageBase64: string): Promise<BoardState> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    messages: [{
      role: "user",
      content: [{
        type: "image",
        source: { type: "base64", media_type: "image/jpeg", data: imageBase64 }
      }, {
        type: "text",
        text: "Analyze this Scrabble board photo. Return JSON with: the new word(s) played this turn, the letters and their positions, and any bonus squares used."
      }]
    }]
  });
  return parseResponse(response);
}
```

### Camera Modes
1. **Quick Photo** — take a single photo, recognize the latest word played
2. **Before/After** — take a photo before and after a play, diff to find the new word
3. **Manual Entry** — existing tile grid (always available as fallback)

---

## Part 4: Mac Desktop App (Tauri 2)

### Why Tauri over Electron
| | Tauri 2 | Electron |
|---|---------|----------|
| App size | **3-10 MB** | 80-150 MB |
| RAM usage | **20-50 MB** | 150-300 MB |
| Startup | **~0.4s** | 1-2s |
| Mac feel | **Native WebKit** | Chromium |
| Camera | CrabCamera plugin | getUserMedia |

Tauri uses the Mac's built-in WebKit (Safari engine) — no bundled browser. The app feels native, launches instantly, and weighs almost nothing.

### Migration Path
Your entire React + TypeScript + Tailwind frontend ports as-is. The only new pieces:
1. `src-tauri/` directory with Rust config (~50 lines you barely touch)
2. Camera plugin registration
3. API key storage in macOS Keychain (Tauri's secure storage plugin)

### Setup
```bash
# Create Tauri wrapper around existing app
npm create tauri-app@latest -- --template react-ts
# Copy existing src/ into new project
# Add camera plugin to src-tauri/Cargo.toml
```

---

## Implementation Phases

### Phase 1: Simplify (1-2 days)
1. Delete dead code (unused hooks, test data generation, legacy files)
2. Remove multi-game tracking, timeline, analytics, timer sounds
3. Collapse to single-page layout (no page navigation)
4. Merge ScoreDisplay + ScoreSheet into one component
5. Slim ScrabbleScorer.tsx from 906 → ~300 lines
6. Verify the core loop works: setup → enter word → score → next player

### Phase 2: Beautiful UI (1-2 days)
1. Redesign as a single-screen dark-mode app
2. Add framer-motion for score animations and tile interactions
3. Typography pass — make scores the hero
4. Microinteractions on tile input and turn transitions
5. Polish until it feels like a premium Mac utility

### Phase 3: Tauri Desktop (1 day)
1. Scaffold Tauri 2 project with Vite + React template
2. Port simplified app into Tauri shell
3. Configure for macOS (icon, app name, window size)
4. Test native build on Mac
5. Add camera permission handling

### Phase 4: Camera Scoring (2-3 days)
1. Add camera capture UI (photo button + preview)
2. Integrate Claude Vision API for board recognition
3. Build the "scan → recognize → confirm → score" flow
4. Add before/after diffing for automatic word detection
5. Handle edge cases (blurry photos, partial boards, blank tiles)

### Phase 5: Polish & Ship (1 day)
1. App icon and branding
2. Mac code signing (optional for personal use)
3. DMG installer packaging
4. README and setup instructions

---

## Key Decisions Needed

1. **API Key management** — hardcoded for personal use, or settings screen?
2. **Offline mode** — should the app work without internet (manual-only mode)?
3. **Player count** — keep it at 2-4 players, or simplify to exactly 2?
4. **Dictionary validation** — keep the word validation feature, or pure scorer?
5. **Game persistence** — save games to disk, or ephemeral (scores reset on close)?
