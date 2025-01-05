import React, { useEffect } from 'react';
import Game from './components/Game';
import './App.css';

const tg = window.Telegram.WebApp;

function App() {
  useEffect(() => {
    tg.ready();
    tg.expand();
  }, []);

  return (
    <div className="app-container">
      <Game />
    </div>
  );
}

export default App;
