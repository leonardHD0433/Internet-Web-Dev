import React from 'react';
import './styles.css';
import logo from '../../assets/CinerateLogo2.png';
import textImg from '../../assets/CinerateText.png';
import homeIcon from '../../assets/Home.svg';
import moviesIcon from '../../assets/Film.svg';
import actorsIcon from '../../assets/Award.svg';
import directorsIcon from '../../assets/Video.svg';
import compareIcon from '../../assets/Chat.svg';
import profileIcon from '../../assets/Category.svg';
import logoutIcon from '../../assets/Logout.svg';
import StatusButton from '../StatusButton'; 
import { useNavigate } from 'react-router-dom';

const SidePanel = ({ connectionStatus, handleStatusClick }) => {
  const navigate = useNavigate();

  const handleHome = () => {
    navigate('/dashboard');
  };

  const handleCompare = () => {
    navigate('/dashboard/compare');
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="side-panel">
      <div className="panel-content">
        <div className="panel-header">
          <img src={logo} alt="Logo" className="logo" />
          <img src={textImg} alt="Text" className="text-img" />
        </div>
        <div className="panel-options">
          <div className="panel-item" onClick={handleHome}>
            <img src={homeIcon} alt="Home" className="icon home-icon" />
            <div className="label">Home</div>
          </div>
          <div className="panel-item" onClick={() => console.log('Movies clicked')}>
            <img src={moviesIcon} alt="Movie" className="icon movies-icon" />
            <div className="label">Movies</div>
          </div>
          <div className="panel-item" onClick={() => console.log('Actors clicked')}>
            <img src={actorsIcon} alt="Actor" className="icon actors-icon" />
            <div className="label">Actors</div>
          </div>
          <div className="panel-item" onClick={() => console.log('Directors clicked')}>
            <img src={directorsIcon} alt="Director" className="icon directors-icon" />
            <div className="label">Directors</div>
          </div>
          <div className="panel-item" onClick={handleCompare}>
            <img src={compareIcon} alt="Compare" className="icon compare-icon" />
            <div className="label">Compare</div>
          </div>
          <div className="panel-item" onClick={() => console.log('Profile clicked')}>
            <img src={profileIcon} alt="Profile" className="icon profile-icon" />
            <div className="label">Profile</div>
          </div>
        </div>
        <div className="panel-exit">
            <div><StatusButton status={connectionStatus} onClick={handleStatusClick} /></div>
            <div className="panel-item" onClick={handleLogout}>
                <img src={logoutIcon} alt="Logout" className="icon logout-icon" />
            <div className="label">Logout</div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default SidePanel;