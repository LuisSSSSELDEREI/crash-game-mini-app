              import React, { useState, useEffect, useRef } from 'react';
import './Game.css';
import currencyIcon from '../assets/images/currency.png';
import friendsIcon from '../assets/images/друзья.png';
import playIcon from '../assets/images/играть.png';

const GAME_STATES = {
  BETTING: 'betting',     // Принятие ставок (10 секунд)
  PLAYING: 'playing',     // Игра идет (множитель растет)
  CRASHED: 'crashed'      // Краш (3 секунды показа)
};

const BETTING_TIME = 10;    // Время на ставки в секундах
const CRASH_TIME = 3000;    // Время показа краша в миллисекундах

const Game = () => {
  const [betAmount, setBetAmount] = useState(350);
  const [autoWithdrawAt, setAutoWithdrawAt] = useState(1.5);
  const [isAutoWithdrawEnabled, setIsAutoWithdrawEnabled] = useState(false);
  const [activeBets, setActiveBets] = useState([]);
  const [timer, setTimer] = useState(BETTING_TIME);
  const [balance, setBalance] = useState(1000.00);
  const [gameState, setGameState] = useState(GAME_STATES.BETTING);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [hasActiveBet, setHasActiveBet] = useState(false);
  const [crashPoint, setCrashPoint] = useState(null);
  const [multiplierHistory, setMultiplierHistory] = useState([]);
  const multiplierInterval = useRef(null);
  const [rocketHeight, setRocketHeight] = useState(0);
  const gameAreaRef = useRef(null);
  const [message, setMessage] = useState(null);  // Добавляем состояние для сообщений

  // Создание звезд
  useEffect(() => {
    if (gameAreaRef.current) {
      // Очищаем старые звезды
      const oldStars = gameAreaRef.current.querySelectorAll('.star');
      oldStars.forEach(star => star.remove());

      // Создаем новые звезды
      for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        gameAreaRef.current.appendChild(star);
      }
    }
  }, []);

  const handleBetAmountChange = (amount) => {
    if (gameState !== GAME_STATES.BETTING) return;
    setBetAmount(prev => {
      const newAmount = prev + amount;
      return newAmount > 0 ? newAmount : 0;
    });
  };

  const handleAutoWithdrawChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 1.0) {
      setAutoWithdrawAt(value);
    }
  };

  const toggleAutoWithdraw = () => {
    setIsAutoWithdrawEnabled(!isAutoWithdrawEnabled);
  };

  const generateCrashPoint = () => {
    const random = Math.random();
    let point;
    
    if (random < 0.4) { // 40% шанс краша до 1.5x
      point = 1 + Math.random() * 0.5;
    } else if (random < 0.7) { // 30% шанс краша между 1.5x и 3x
      point = 1.5 + Math.random() * 1.5;
    } else if (random < 0.9) { // 20% шанс краша между 3x и 10x
      point = 3 + Math.random() * 7;
    } else { // 10% шанс краша выше 10x
      point = 10 + Math.random() * 90;
    }
    
    return parseFloat(point.toFixed(2));
  };

  const startGame = () => {
    setGameState(GAME_STATES.PLAYING);
    setCurrentMultiplier(1.00);
    setRocketHeight(0);
    const crashAt = generateCrashPoint();
    setCrashPoint(crashAt);
    
    if (multiplierInterval.current) {
      clearInterval(multiplierInterval.current);
    }
    
    multiplierInterval.current = setInterval(() => {
      setCurrentMultiplier(prev => {
        const increase = prev * 0.01;
        const newValue = parseFloat((prev + increase).toFixed(2));
        
        setRocketHeight(prev => Math.min(prev + 2, gameAreaRef.current?.clientHeight - 100 || 0));
        
        // Проверяем достижение точки краша
        if (newValue >= crashAt) {
          if (multiplierInterval.current) {
            clearInterval(multiplierInterval.current);
            multiplierInterval.current = null;
          }
          handleCrash(crashAt);
          return crashAt;
        }
        
        return newValue;
      });
    }, 50);
  };

  const handleCrash = (finalMultiplier) => {
    setGameState(GAME_STATES.CRASHED);
    // Добавляем только один множитель
    setMultiplierHistory(prev => {
      // Проверяем, не добавлен ли уже этот множитель
      if (prev[0] !== finalMultiplier) {
        return [finalMultiplier, ...prev.slice(0, 4)];  // Сохраняем только последние 5
      }
      return prev;
    });
    setCrashPoint(null);

    // Очищаем активные ставки при крахе
    setActiveBets([]);
    setHasActiveBet(false);

    setTimeout(() => {
      startBettingPhase();
    }, CRASH_TIME);
  };

  const startBettingPhase = () => {
    setGameState(GAME_STATES.BETTING);
    setTimer(BETTING_TIME);
    setHasActiveBet(false);
    setCurrentMultiplier(1.00);
    setRocketHeight(0);
  };

  const placeBet = () => {
    if (betAmount > 0 && balance >= betAmount && !hasActiveBet && gameState === GAME_STATES.BETTING) {
      setBalance(prev => prev - betAmount);
      setHasActiveBet(true);
      setActiveBets(prev => [...prev, { amount: betAmount, multiplier: currentMultiplier }]);
    }
  };

  const cashOut = () => {
    if (hasActiveBet && gameState === GAME_STATES.PLAYING) {
      const winAmount = betAmount * currentMultiplier;
      setBalance(prev => prev + winAmount);
      setHasActiveBet(false);
      setActiveBets(prev => prev.filter(bet => bet.amount !== betAmount));
      
      // Показываем сообщение о выигрыше
      showMessage(`Выигрыш: ${winAmount.toFixed(2)}!`, 'success');
    }
  };

  // Функция для показа сообщения
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Эффект для отслеживания автовывода
  useEffect(() => {
    if (isAutoWithdrawEnabled && hasActiveBet && gameState === GAME_STATES.PLAYING) {
      if (currentMultiplier >= autoWithdrawAt) {
        cashOut();
      }
    }
  }, [currentMultiplier, isAutoWithdrawEnabled, hasActiveBet, gameState, autoWithdrawAt]);

  // Управление таймером
  useEffect(() => {
    let timerInterval = null;

    if (gameState === GAME_STATES.BETTING && timer > 0) {
      timerInterval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            startGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [gameState, timer]);

  return (
    <div className="game-wrapper">
      {/* Сообщение о выигрыше */}
      {message && (
        <div className={`game-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Верхняя панель с логотипом и балансом */}
      <div className="header-panel">
        <div className="logo">
          <span className="logo-brawl">Brawl</span>
          <span className="logo-jet">Jet</span>
        </div>
        <div className="balance">
          <img src={currencyIcon} alt="Currency" />
          <span>{balance.toFixed(2)}</span>
        </div>
      </div>

      {/* История множителей */}
      <div className="multipliers-history">
        {multiplierHistory.slice(0, 5).map((value, index) => (
          <div key={index} className="multiplier-item">
            x{value.toFixed(2)}
          </div>
        ))}
      </div>

      {/* Игровая зона */}
      <div className="game-area" ref={gameAreaRef}>
        <div className={`game-status ${gameState === GAME_STATES.CRASHED ? 'crashed' : ''}`}>
          {gameState === GAME_STATES.BETTING && `Ставки: ${timer} сек`}
          {gameState === GAME_STATES.PLAYING && `x${currentMultiplier.toFixed(2)}`}
          {gameState === GAME_STATES.CRASHED && `Разбился на x${currentMultiplier.toFixed(2)}`}
        </div>
        {gameState === GAME_STATES.PLAYING && (
          <div 
            className="rocket-trail" 
            style={{ height: `${rocketHeight}px` }}
          />
        )}
      </div>

      {/* Панель ставок */}
      <div className="betting-controls">
        {/* Автовывод */}
        <div className="auto-withdraw-section">
          <div className="auto-withdraw-input-group">
            <input
              type="number"
              className="auto-withdraw-input"
              value={autoWithdrawAt}
              onChange={handleAutoWithdrawChange}
              min="1.0"
              step="0.1"
              placeholder="Автовывод при x"
            />
            <div className="auto-withdraw-value">
              {isAutoWithdrawEnabled 
                ? `Автовывод на x${autoWithdrawAt.toFixed(2)}`
                : 'Автовывод отключен'}
            </div>
          </div>
          <button 
            className={`auto-withdraw-button ${isAutoWithdrawEnabled ? 'active' : ''}`}
            onClick={toggleAutoWithdraw}
          >
            {isAutoWithdrawEnabled ? 'Отключить' : 'Применить'}
          </button>
        </div>

        {/* Контроль ставки */}
        <div className="bet-amount-control">
          <button 
            className="bet-button" 
            onClick={() => handleBetAmountChange(-5)}
            disabled={gameState !== GAME_STATES.BETTING}
          >-</button>
          <input
            type="number"
            className="bet-input"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            disabled={gameState !== GAME_STATES.BETTING}
          />
          <button 
            className="bet-button" 
            onClick={() => handleBetAmountChange(5)}
            disabled={gameState !== GAME_STATES.BETTING}
          >+</button>
        </div>

        <div className="quick-bets">
          <button 
            className="quick-bet" 
            onClick={() => handleBetAmountChange(5)}
            disabled={gameState !== GAME_STATES.BETTING}
          >+5</button>
          <button 
            className="quick-bet" 
            onClick={() => handleBetAmountChange(25)}
            disabled={gameState !== GAME_STATES.BETTING}
          >+25</button>
          <button 
            className="quick-bet" 
            onClick={() => handleBetAmountChange(100)}
            disabled={gameState !== GAME_STATES.BETTING}
          >+100</button>
          <button 
            className="quick-bet" 
            onClick={() => handleBetAmountChange(500)}
            disabled={gameState !== GAME_STATES.BETTING}
          >+500</button>
        </div>

        {gameState === GAME_STATES.PLAYING && hasActiveBet ? (
          <button className="place-bet withdraw" onClick={cashOut}>
            Забрать x{currentMultiplier.toFixed(2)}
          </button>
        ) : (
          <button 
            className="place-bet" 
            onClick={placeBet}
            disabled={gameState !== GAME_STATES.BETTING || hasActiveBet}
          >
            {gameState === GAME_STATES.CRASHED ? 'Игра закончена' : 'Сделать ставку'}
          </button>
        )}
      </div>

      {/* Активные ставки */}
      {activeBets.length > 0 && (
        <div className="active-bets-panel">
          <div className="active-bets-header">
            <span>Активные ставки</span>
            <span>Множитель</span>
          </div>
          {activeBets.map((bet, index) => (
            <div key={index} className="bet-item">
              <span>{bet.amount.toFixed(2)}</span>
              <span>x{bet.multiplier.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Нижняя навигация */}
      <div className="nav-buttons">
        <button className="nav-button active">
          <img src={playIcon} alt="Play" />
          <span>Играть</span>
        </button>
        <button className="nav-button">
          <img src={friendsIcon} alt="Friends" />
          <span>Друзья</span>
        </button>
        <button className="nav-button">
          <img src={currencyIcon} alt="Currency" />
          <span>Вывод</span>
        </button>
        <button className="nav-button">
          <img src={currencyIcon} alt="Currency" />
          <span>Задания</span>
        </button>
      </div>
    </div>
  );
};

export default Game;
