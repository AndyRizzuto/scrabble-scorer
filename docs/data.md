# Data Model

## TypeScript Types

### Player
```
interface Player {
  name: string;
  score: number;
}
```

### WordEntry
```
interface WordEntry {
  word: string;
  basePoints: number;
  bonusPoints: number;
  finalPoints: number;
  bonuses: BonusMultipliers;
  letterMultipliers: number[];
  bingoBonus: boolean;
}
```

### GameHistoryEntry
```
interface GameHistoryEntry {
  player: number;
  word: string;
  points: number;
  time: string;
  bonuses?: BonusMultipliers;
  letterMultipliers?: number[];
  bingoBonus?: boolean;
  basePoints?: number;
  isTurnSummary?: boolean;
}
```

### BonusMultipliers
```
interface BonusMultipliers {
  letterMultiplier: number;
  wordMultiplier: number;
}
```

### ValidationResult
```
interface ValidationResult {
  word: string;
  valid: boolean;
  definition?: string;
}
```

### SetupData
```
interface SetupData {
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
}
```

## Data Flow
- State is managed in the main component and passed down via props.
- Game history is an array of `GameHistoryEntry` objects.
- All scoring and validation logic uses these types for consistency.

See also: [logic.md](logic.md), [components.md](components.md)
