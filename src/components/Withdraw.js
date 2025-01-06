import React, { useState, useEffect } from 'react';
import './Withdraw.css';

const WithdrawOption = ({ gems, amount, onWithdraw, disabled }) => (
  <div className="withdraw-option">
    <div className="gems-stack">
      <img src="/gems.png" alt={`${gems} gems`} className="gems-icon" />
    </div>
    <span className="gems-amount">{gems} гемов</span>
    <button 
      className={`withdraw-button ${disabled ? 'disabled' : ''}`}
      onClick={() => !disabled && onWithdraw(gems, amount)}
      disabled={disabled}
    >
      {amount}
    </button>
  </div>
);

const Withdraw = ({ userData }) => {
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [referralProgress, setReferralProgress] = useState(0);
  
  const withdrawOptions = [
    { gems: 30, amount: '500.0K' },
    { gems: 170, amount: '750.0K' },
    { gems: 360, amount: '1.0M' },
    { gems: 960, amount: '1.5M' },
    { gems: 2000, amount: '2.0M' },
  ];

  useEffect(() => {
    if (userData?.referrals) {
      setReferralProgress(Math.min(userData.referrals.length, 10));
    }
  }, [userData]);

  const handleWithdraw = (gems, amount) => {
    if (!userData?.referrals || userData.referrals.length < 10) {
      setShowVerificationModal(true);
      return;
    }
    // Здесь будет логика вывода средств
  };

  return (
    <div className="withdraw-container">
      {withdrawOptions.map((option) => (
        <WithdrawOption
          key={option.gems}
          gems={option.gems}
          amount={option.amount}
          onWithdraw={handleWithdraw}
          disabled={!userData?.gems || userData.gems < option.gems}
        />
      ))}

      {showVerificationModal && (
        <div className="verification-modal">
          <div className="modal-content">
            <h3>Верификация не пройдена ❌</h3>
            <p>Чтобы сделать вывод, нужно пройти проверку, что вы не робот.</p>
            <p>Пригласите 10 друзей, чтобы вам открылась возможность выводить.</p>
            
            <div className="referral-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(referralProgress / 10) * 100}%` }}
                />
              </div>
              <span className="progress-text">{referralProgress}/10 друзей</span>
            </div>

            <button 
              className="close-button"
              onClick={() => setShowVerificationModal(false)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdraw;
