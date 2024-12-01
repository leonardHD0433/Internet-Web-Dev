import { Outlet } from 'react-router-dom';
import React, { useState } from 'react';
import './styles.css';
import SidePanel from '../SidePanel';
import SearchBar from '../SearchBar';
import NotificationButton from '../NotificationButton';
import SettingsButton from '../SettingsButton';

const MainLayout = ({ connectionStatus, handleStatusClick, setIsAuthenticated }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    console.log('Search query:', e.target.value); // Debug log
  };

  return (
    <div className="main-layout">
      <SidePanel connectionStatus={connectionStatus} handleStatusClick={handleStatusClick} setIsAuthenticated={setIsAuthenticated} />
      <div className="main-content">
        <div className="nav-box">
          <div className="search-bar">
            <SearchBar />
          </div>
          <div className="bell">
            <NotificationButton />
          </div>
          <div className="settings">
            <SettingsButton />
          </div>
        </div>
        <Outlet context={{ connectionStatus, handleStatusClick, setIsAuthenticated }} />
      </div>
    </div>
  );
};

export default MainLayout;