import React from 'react';
import './Friends.css';
import currencyIcon from '../assets/images/currency.png';

const Friends = () => {
  return (
    <div className="friends-container">
      <div className="friends-header">
        <h1>Пригласите друзей!</h1>
        <p>Вы и ваш друг получите бонусы!</p>
      </div>

      <div className="invite-card">
        <div className="gift-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FFB636" strokeWidth="2">
            <path d="M20 12v10H4V12"></path>
            <path d="M22 7H2v5h20V7z"></path>
            <path d="M12 22V7"></path>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
          </svg>
        </div>
        <div className="invite-info">
          <div className="invite-title">Пригласить друга</div>
          <div className="invite-bonus">
            +7.0K
            <img src={currencyIcon} alt="Coin" className="coin-icon" />
            <span>Для вас и вашего друга</span>
          </div>
        </div>
      </div>

      <div className="friends-list">
        <div className="friends-list-header">
          <span className="friends-list-title">Список ваших друзей</span>
          <button className="refresh-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
          </button>
        </div>
        <div className="empty-friends">
          Вы ещё никого не пригласили!
        </div>
      </div>

      <div className="action-buttons">
        <button className="invite-button">
          Пригласить друга
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <path d="M20 8v6M23 11h-6" />
          </svg>
        </button>
        <button className="copy-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Friends;
