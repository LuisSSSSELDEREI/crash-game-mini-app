import React from 'react';
import './Tasks.css';
import telegramIcon from '../assets/images/telegram.png';

const TaskItem = ({ icon, text, reward, onClick }) => (
  <div className="task-item" onClick={onClick}>
    <div className="task-content">
      <img src={icon} alt="Task" className="task-icon" />
      <span className="task-text">{text}</span>
    </div>
    <div className="task-right">
      <div className="task-reward">
        <img src={telegramIcon} alt="Coin" className="coin-icon" />
        <span>+{reward}</span>
      </div>
      <div className="task-arrow">›</div>
    </div>
  </div>
);

const Tasks = () => {
  const dailyTasks = [
    {
      icon: telegramIcon,
      text: 'Присоединяйся к Telegram каналу',
      reward: '5.0K',
      link: 'https://t.me/your_channel'
    },
    {
      icon: telegramIcon,
      text: 'Присоединяйся к Telegram каналу',
      reward: '5.0K',
      link: 'https://t.me/your_channel2'
    },
    {
      icon: telegramIcon,
      text: 'Присоединяйся к Telegram каналу',
      reward: '5.0K',
      link: 'https://t.me/your_channel3'
    }
  ];

  const otherTasks = [
    {
      icon: telegramIcon,
      text: 'Присоединяйся к Telegram каналу',
      reward: '5.0K',
      link: 'https://t.me/your_channel4'
    }
  ];

  const handleTaskClick = (link) => {
    window.open(link, '_blank');
  };

  return (
    <div className="tasks-container">
      <h1>Зарабатывай больше<br />Brawl Coin</h1>
      
      <div className="tasks-section">
        <h2>Ежедневные задания</h2>
        {dailyTasks.map((task, index) => (
          <TaskItem
            key={index}
            icon={task.icon}
            text={task.text}
            reward={task.reward}
            onClick={() => handleTaskClick(task.link)}
          />
        ))}
      </div>

      <div className="tasks-section">
        <h2>Список заданий</h2>
        {otherTasks.map((task, index) => (
          <TaskItem
            key={index}
            icon={task.icon}
            text={task.text}
            reward={task.reward}
            onClick={() => handleTaskClick(task.link)}
          />
        ))}
      </div>
    </div>
  );
};

export default Tasks;
