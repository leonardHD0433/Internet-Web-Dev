import React, { useState } from 'react';
import './styles.css';
import settingsIcon from '../../assets/Settings.svg';

function SettingsButton() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleClick = () => {
    console.log('Settings button clicked'); // Debug log
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <button 
      className="settings-button" 
      onClick={handleClick}
      aria-label="Settings"
    >
      <img src={settingsIcon} alt="Settings" className="settings-icon" />
    </button>
  );
}

export default SettingsButton;