import React, { useState } from 'react';
import './styles.css';
import bellIcon from '../../assets/Bell.svg';

function NotificationButton() {
    const [hasNotification, setHasNotification] = useState(false);
  
    const handleClick = () => {
      console.log('Notification button clicked'); // Debug log
      setHasNotification(false);
    };
  
    return (
      <button 
        className={`notification-button ${hasNotification ? 'has-notification' : ''}`}
        onClick={handleClick}
      >
        <img src={bellIcon} alt="" className="bell-icon" />
      </button>
    );
  }

export default NotificationButton;