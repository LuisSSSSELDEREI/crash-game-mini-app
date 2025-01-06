              import React, { useState, useEffect, useRef } from 'react';
import './Game.css';
import currencyIcon from '../assets/images/currency.png';
import friendsIcon from '../assets/images/friends.png';
import playIcon from '../assets/images/play.png';
import planet1Icon from '../assets/images/планета1.png';
import planet2Icon from '../assets/images/планета2.png';
import planet3Icon from '../assets/images/планета3.png';
import planet4Icon from '../assets/images/планета4.png';
import Withdraw from './Withdraw';

const GAME_STATES = {
  BETTING: 'betting',     // Принятие ставок (10 секунд)
  PLAYING: 'playing',     // Игра идет (множитель растет)
  CRASHED: 'crashed'      // Краш (3 секунды показа)
};

const BETTING_TIME = 10;    // Время на ставки в секундах
const CRASH_TIME = 3000;    // Время показа краша в миллисекундах

const Game = () => {
  const [betAmount, setBetAmount] = useState(350);
  const [activeBets, setActiveBets] = useState([]);
  const [timer, setTimer] = useState(BETTING_TIME);
  const [balance, setBalance] = useState(0);  // Начальный баланс будет загружен с сервера
  const [gameState, setGameState] = useState(GAME_STATES.BETTING);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [hasActiveBet, setHasActiveBet] = useState(false);
  const [crashPoint, setCrashPoint] = useState(null);
  const [multiplierHistory, setMultiplierHistory] = useState([]);
  const multiplierInterval = useRef(null);
  const [rocketHeight, setRocketHeight] = useState(0);
  const gameAreaRef = useRef(null);
  const starsRef = useRef(null);
  const [message, setMessage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [visiblePlanets, setVisiblePlanets] = useState([]);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const modalRef = useRef(null);
  const [dragStart, setDragStart] = useState(null);
  const [dragPosition, setDragPosition] = useState(0);
  const [referralLink, setReferralLink] = useState('');
  const [referralFriends, setReferralFriends] = useState([]);
  const REFERRAL_BONUS = 7000; // 7.0K бонус
  const [currentPage, setCurrentPage] = useState('game'); // 'game' или 'withdraw'
  const [showTasksModal, setShowTasksModal] = useState(false);
  const tasksModalRef = useRef(null);
  const [tasksDragStart, setTasksDragStart] = useState(null);
  const [tasksDragPosition, setTasksDragPosition] = useState(0);

  const dailyTasks = [
    {
      id: 'channel1',
      icon: friendsIcon,
      text: 'Присоединяйся к Telegram каналу',
      reward: '5.0K',
      channelUsername: 'your_channel',
      completed: false
    },
    {
      id: 'channel2',
      icon: friendsIcon,
      text: 'Присоединяйся к Telegram каналу',
      reward: '5.0K',
      channelUsername: 'your_channel2',
      completed: false
    },
    {
      id: 'channel3',
      icon: friendsIcon,
      text: 'Присоединяйся к Telegram каналу',
      reward: '5.0K',
      channelUsername: 'your_channel3',
      completed: false
    }
  ];

  const [tasks, setTasks] = useState(dailyTasks);

  const handleTouchStart = (e) => {
    setDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (dragStart === null) return;
    
    const currentPosition = e.touches[0].clientY;
    const difference = currentPosition - dragStart;
    
    // Только позволяем тянуть вниз
    if (difference > 0) {
      setDragPosition(difference);
    }
  };

  const handleTouchEnd = () => {
    if (dragPosition > 100) { // Если потянули более чем на 100px
      setShowFriendsModal(false);
    }
    setDragStart(null);
    setDragPosition(0);
  };

  const handleTasksModalTouchStart = (e) => {
    setTasksDragStart(e.touches[0].clientY);
  };

  const handleTasksModalTouchMove = (e) => {
    if (tasksDragStart === null) return;
    
    const currentPosition = e.touches[0].clientY;
    const difference = currentPosition - tasksDragStart;
    
    if (difference > 0) {
      setTasksDragPosition(difference);
    }
  };

  const handleTasksModalTouchEnd = () => {
    if (tasksDragPosition > 100) {
      setShowTasksModal(false);
    }
    setTasksDragStart(null);
    setTasksDragPosition(0);
  };

  // Инициализация пользователя при загрузке
  useEffect(() => {
    const initUser = async () => {
      try {
        // Получаем данные из Telegram WebApp
        const tg = window.Telegram.WebApp;
        if (!tg.initDataUnsafe?.user) {
          console.error('No user data available');
          return;
        }

        const { id, username, first_name, last_name } = tg.initDataUnsafe.user;

        // Инициализируем пользователя на сервере
        const response = await fetch('http://localhost:3001/api/user/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            telegramId: id.toString(),
            username,
            firstName: first_name,
            lastName: last_name
          }),
        });

        const data = await response.json();
        if (data.success) {
          setUserData(data.user);
          setBalance(data.user.balance);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      }
    };

    initUser();
  }, []);

  // Обновление баланса на сервере
  const updateBalance = async (newBalance) => {
    try {
      const tg = window.Telegram.WebApp;
      if (!tg.initDataUnsafe?.user?.id) return;

      const response = await fetch('http://localhost:3001/api/user/update-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId: tg.initDataUnsafe.user.id.toString(),
          newBalance
        }),
      });

      const data = await response.json();
      if (!data.success) {
        console.error('Error updating balance:', data.error);
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const handleBetAmountChange = (amount) => {
    if (gameState !== GAME_STATES.BETTING) return;
    setBetAmount(prev => {
      const newAmount = prev + amount;
      return newAmount > 0 ? newAmount : 0;
    });
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
      const newBalance = balance - betAmount;
      setBalance(newBalance);
      updateBalance(newBalance);
      setHasActiveBet(true);
      setActiveBets(prev => [...prev, { amount: betAmount, multiplier: currentMultiplier }]);
    }
  };

  const cashOut = () => {
    if (hasActiveBet && gameState === GAME_STATES.PLAYING) {
      const winAmount = betAmount * currentMultiplier;
      const newBalance = balance + winAmount;
      setBalance(newBalance);
      updateBalance(newBalance);
      setHasActiveBet(false);
      setActiveBets(prev => prev.filter(bet => bet.amount !== betAmount));
      showMessage(`Выигрыш: ${winAmount.toFixed(2)}!`, 'success');
    }
  };

  // Функция для показа сообщения
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

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

  // Эффект для обновления позиции камеры и фона
  useEffect(() => {
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;

    if (gameState === GAME_STATES.PLAYING && currentMultiplier > 1) {
      // Изменяем градиент фона
      const progress = Math.min(((currentMultiplier - 1) / 1.5) * 100, 100);
      gameArea.style.setProperty('--space-progress', `${progress}%`);

      // Обновляем позицию ракеты для следования камеры
      gameArea.style.setProperty('--rocket-height', `${rocketHeight}px`);
    } else {
      gameArea.style.setProperty('--space-progress', '0%');
      gameArea.style.setProperty('--rocket-height', '0px');
    }
  }, [currentMultiplier, gameState, rocketHeight]);

  // Добавляем планеты по одной сверху вниз
  useEffect(() => {
    if (gameState === GAME_STATES.PLAYING) {
      const planets = ['sun', 'planet1', 'planet2', 'planet3', 'planet4', 'planet5'];
      let currentIndex = 0;

      const addPlanetInterval = setInterval(() => {
        if (currentIndex < planets.length) {
          setVisiblePlanets(prev => [...prev, planets[currentIndex]]);
          currentIndex++;
        } else {
          clearInterval(addPlanetInterval);
        }
      }, 500); // Уменьшили интервал до 500мс

      return () => {
        clearInterval(addPlanetInterval);
        setVisiblePlanets([]);
      };
    }
  }, [gameState]);

  // Создание звезд
  useEffect(() => {
    if (gameAreaRef.current) {
      const gameArea = gameAreaRef.current;
      const stars = [];

      // Создаем 150 звезд
      for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Случайное положение
        const x = Math.random() * 100;
        const y = Math.random() * 200; // Увеличили область для звезд
        const delay = Math.random() * 2; // Случайная задержка мерцания
        const size = Math.random() * 2 + 1; // Случайный размер от 1 до 3px
        
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDelay = `${delay}s`;
        star.style.transform = `translateZ(${Math.random() * -50}px)`; // Добавляем глубину

        gameArea.appendChild(star);
        stars.push(star);
      }

      starsRef.current = stars;

      // Очистка при размонтировании
      return () => {
        stars.forEach(star => {
          if (star.parentNode === gameArea) {
            gameArea.removeChild(star);
          }
        });
      };
    }
  }, [gameState]); // Пересоздаем звезды при изменении состояния игры

  // Инициализация пользователя и реферальной системы
  useEffect(() => {
    const initUser = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/user/me', {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
          setUserData(data.user);
          // Генерируем реферальную ссылку на основе ID пользователя
          const referralUrl = `${window.location.origin}?ref=${data.user.id}`;
          setReferralLink(referralUrl);
          
          // Загружаем список рефералов
          loadReferralFriends(data.user.id);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    initUser();
  }, []);

  // Загрузка списка рефералов
  const loadReferralFriends = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/referrals/${userId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setReferralFriends(data.referrals);
      }
    } catch (error) {
      console.error('Error loading referrals:', error);
    }
  };

  // Копирование реферальной ссылки
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    // Можно добавить уведомление о копировании
  };

  // Проверяем реферальный код при загрузке страницы
  useEffect(() => {
    const checkReferral = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      
      if (refCode && userData && refCode !== userData.id) {
        try {
          const response = await fetch('http://localhost:3001/api/referral/activate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              referrerId: refCode,
              referredId: userData.id
            })
          });
          
          const data = await response.json();
          if (data.success) {
            // Оба пользователя получили бонус
            setMessage(`Вы получили ${REFERRAL_BONUS} за приглашение друга!`);
          }
        } catch (error) {
          console.error('Error activating referral:', error);
        }
      }
    };

    checkReferral();
  }, [userData]);

  // Функция для проверки подписки на канал
  const checkChannelSubscription = async (channelUsername) => {
    try {
      const response = await fetch(`/api/check-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          channelUsername
        })
      });
      
      const data = await response.json();
      return data.isSubscribed;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  };

  // Функция для выдачи награды
  const giveReward = async (taskId, rewardAmount) => {
    try {
      const response = await fetch(`/api/give-reward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          taskId,
          reward: parseFloat(rewardAmount) * 1000 // Конвертируем "5.0K" в 5000
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Обновляем баланс пользователя
        setUserData(prev => ({
          ...prev,
          balance: prev.balance + parseFloat(rewardAmount) * 1000
        }));
        
        // Отмечаем задание как выполненное
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, completed: true } : task
        ));

        // Показываем уведомление о награде
        showNotification(`+${rewardAmount} получено!`);
      }
    } catch (error) {
      console.error('Error giving reward:', error);
    }
  };

  // Функция для обработки клика по заданию
  const handleTaskClick = async (task) => {
    if (task.completed) {
      showNotification('Задание уже выполнено');
      return;
    }

    // Открываем канал в новом окне
    window.open(`https://t.me/${task.channelUsername}`, '_blank');

    // Запускаем проверку подписки через 5 секунд
    setTimeout(async () => {
      const isSubscribed = await checkChannelSubscription(task.channelUsername);
      
      if (isSubscribed) {
        await giveReward(task.id, task.reward);
      } else {
        showNotification('Подпишитесь на канал для получения награды');
      }
    }, 5000);
  };

  // Функция для показа уведомлений
  const showNotification = (message) => {
    setMessage(message);
    setTimeout(() => setMessage(null), 3000);
  };

  // Состояние для уведомлений
  const [notification, setNotification] = useState(null);

  return (
    <div className="game-wrapper">
      {currentPage === 'game' ? (
        <div className="game-content">
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

          {/* Игровое поле */}
          <div className="game-field">
            <div className="game-area" ref={gameAreaRef}>
              <div className="space-container">
                {/* Звезды будут добавлены через useEffect */}
                {visiblePlanets.includes('sun') && <img src={planet4Icon} alt="Sun" className="planet sun" />}
                {visiblePlanets.includes('planet1') && <img src={planet1Icon} alt="Planet 1" className="planet planet1" />}
                {visiblePlanets.includes('planet2') && <img src={planet2Icon} alt="Planet 2" className="planet planet2" />}
                {visiblePlanets.includes('planet3') && <img src={planet3Icon} alt="Planet 3" className="planet planet3" />}
                {visiblePlanets.includes('planet4') && <img src={planet2Icon} alt="Planet 4" className="planet planet4" />}
                {visiblePlanets.includes('planet5') && <img src={planet3Icon} alt="Planet 5" className="planet planet5" />}
              </div>
              {gameState === GAME_STATES.PLAYING && (
                <div 
                  className="rocket-container"
                  style={{ height: `${rocketHeight}px` }}
                >
                  <div className="rocket-head" />
                  <div className="rocket-glow" />
                  <div className="rocket-trail" style={{ height: `${rocketHeight - 16}px` }} />
                </div>
              )}
              <div className={`game-status ${
                gameState === GAME_STATES.CRASHED 
                  ? 'crashed' 
                  : gameState === GAME_STATES.PLAYING 
                    ? 'playing' 
                    : ''
              }`}>
                {gameState === GAME_STATES.BETTING && `Ставки: ${timer} сек`}
                {gameState === GAME_STATES.PLAYING && `x${currentMultiplier.toFixed(2)}`}
                {gameState === GAME_STATES.CRASHED && `Разбился на x${currentMultiplier.toFixed(2)}`}
              </div>
            </div>
          </div>

          {/* Панель ставок */}
          <div className="betting-controls">
            {/* Контроль ставки */}
            <div className="bet-amount-label">Введите сумму</div>
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
        </div>
      ) : (
        <div className="withdraw-content">
          <Withdraw userData={userData} />
        </div>
      )}

      {/* Нижняя навигация */}
      <div className="nav-buttons">
        <button 
          className={`nav-button ${currentPage === 'game' ? 'active' : ''}`}
          onClick={() => setCurrentPage('game')}
        >
          <img src={playIcon} alt="Play" />
          <span>Играть</span>
        </button>
        <button 
          className={`nav-button ${currentPage === 'withdraw' ? 'active' : ''}`}
          onClick={() => setCurrentPage('withdraw')}
        >
          <img src={currencyIcon} alt="Withdraw" />
          <span>Вывод</span>
        </button>
        <button 
          className={`nav-button ${showFriendsModal ? 'active' : ''}`}
          onClick={() => setShowFriendsModal(true)}
        >
          <img src={friendsIcon} alt="Friends" />
          <span>Друзья</span>
        </button>
        <button 
          className={`nav-button ${showTasksModal ? 'active' : ''}`}
          onClick={() => setShowTasksModal(true)}
        >
          <img src={currencyIcon} alt="Tasks" />
          <span>Задания</span>
        </button>
      </div>

      {showFriendsModal && (
        <>
          <div 
            className={`modal-overlay ${showFriendsModal ? 'visible' : ''}`} 
            onClick={() => setShowFriendsModal(false)} 
          />
          <div 
            ref={modalRef}
            className={`friends-modal ${showFriendsModal ? 'visible' : ''}`}
            style={{ transform: `translateY(${dragPosition}px)` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="modal-handle"></div>
            <h2>Пригласите друзей!</h2>
            <p>Вы и ваш друг получите бонус!</p>
            
            <div className="invite-button">
              <img src={friendsIcon} alt="Gift" className="gift-icon" />
              <span>Пригласить друга</span>
              <span className="bonus">+{REFERRAL_BONUS/1000}K</span>
            </div>

            <div className="friends-list">
              <h3>Список ваших друзей</h3>
              {referralFriends.length > 0 ? (
                <div className="friends-grid">
                  {referralFriends.map(friend => (
                    <div key={friend.id} className="friend-item">
                      <div className="friend-avatar">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="friend-name">{friend.username}</span>
                      <span className="friend-date">
                        {new Date(friend.joinDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-message">
                  Вы ещё никого не пригласили!
                </div>
              )}
            </div>

            <button className="invite-friend-button">
              Пригласить друга
              <button 
                className="copy-link-button" 
                onClick={handleCopyLink}
                title={referralLink}
              >
                <i className="fas fa-copy"></i>
              </button>
            </button>
          </div>
        </>
      )}

      {showTasksModal && (
        <>
          <div 
            className={`modal-overlay ${showTasksModal ? 'visible' : ''}`} 
            onClick={() => setShowTasksModal(false)} 
          />
          <div 
            ref={tasksModalRef}
            className={`tasks-modal ${showTasksModal ? 'visible' : ''}`}
            style={{ transform: `translateY(${tasksDragPosition}px)` }}
            onTouchStart={handleTasksModalTouchStart}
            onTouchMove={handleTasksModalTouchMove}
            onTouchEnd={handleTasksModalTouchEnd}
          >
            <div className="modal-handle"></div>
            <h2>Зарабатывай больше<br />Brawl Coin</h2>
            
            <div className="tasks-section">
              <h3>Ежедневные задания</h3>
              {tasks.map((task, index) => (
                <div 
                  key={index} 
                  className={`task-item ${task.completed ? 'completed' : ''}`} 
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="task-content">
                    <img src={task.icon} alt="Task" className="task-icon" />
                    <span className="task-text">{task.text}</span>
                  </div>
                  <div className="task-right">
                    {task.completed ? (
                      <div className="task-completed">
                        <span>✓ Выполнено</span>
                      </div>
                    ) : (
                      <div className="task-reward">
                        <img src={currencyIcon} alt="Coin" className="coin-icon" />
                        <span>+{task.reward}</span>
                      </div>
                    )}
                    <div className="task-arrow">›</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Уведомление */}
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
    </div>
  );
};

export default Game;
