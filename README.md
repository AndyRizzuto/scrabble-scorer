# Scrabble Score Keeper

A modern, interactive Scrabble score keeper built with React, TypeScript, and Tailwind CSS. Features word validation, multipliers, multi-word turns, game statistics, and more!

## 🎮 Features

- **Two-player scoring** with custom player names
- **Word validation** system with visual feedback
- **Interactive letter tiles** with click-to-cycle multipliers (1x → 2x → 3x)
- **Multi-word turn mode** for complex scoring scenarios
- **Automatic bingo detection** (+50 points for 7-letter words)
- **Undo functionality** (last 10 moves)
- **Game statistics** with detailed analytics
- **Timeline view** showing game progression
- **CSV export** for game data analysis
- **Mobile responsive** design
- **Score editing** capability

## 🚀 Live Demo

Visit the live demo at: [https://yourusername.github.io/scrabble-scorer/](https://yourusername.github.io/scrabble-scorer/)

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/scrabble-scorer.git
cd scrabble-scorer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📱 Usage

1. **Setup**: Enter player names and starting scores (optional)
2. **Playing**: 
   - Enter words and set letter/word multipliers
   - Use multi-word mode for complex turns
   - Switch between players manually or automatically
3. **Tracking**: View game timeline and statistics
4. **Export**: Download game data as CSV

## 🏗️ Architecture

The app is built with a modular component architecture:

- `ScrabbleScorer.tsx` - Main game orchestrator
- `ScoreDisplay.tsx` - Player scores with editing
- `LetterTiles.tsx` - Interactive letter multiplier tiles  
- `GameStats.tsx` - Comprehensive game statistics
- `Timeline.tsx` - Game progression visualization
- Additional utility components for modular functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).