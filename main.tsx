// Main application entry point using the refactored components
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ScrabbleScorer } from './src/components';

function App() {
  return <ScrabbleScorer />;
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);

