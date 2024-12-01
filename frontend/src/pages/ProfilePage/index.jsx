import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import './styles.css'; // Import the CSS file for styling

const Profile = () => {
  const { connectionStatus, handleStatusClick, setIsAuthenticated } = useOutletContext();
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [watchlistStats, setWatchlistStats] = useState({});
  const userId = JSON.parse(localStorage.getItem('user')).userId;

  useEffect(() => {
    const fetchWatchlistStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/watchlistStats?user_id=${userId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const watchlistStatsData = await response.json();
        setWatchlistStats(watchlistStatsData);
        console.log(watchlistStatsData);
      } catch (error) {
        console.error('Error Watchlist Stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchWatchlistStats();
  }, []);

  return (
    <div className="profile-Dashboard">
      <div className="profile-header">Profile</div>
      {watchlistStats.user_name && (
        <div className="welcome-message">
          Hi there {watchlistStats.user_name}, here are some of your watchlist statistics:
        </div>
      )}
      <div className="stats-container">
        <div className="stat-box avg-rating">Average IMDB Rating: <br/>{watchlistStats.average_rating}</div>
        <div className="stat-box avg-popularity">Average Popularity: <br/>{watchlistStats.average_popularity}</div>
        <div className="stat-box screentime">Total Runtime: <br/>{watchlistStats.total_runtime}</div>
        <div className="stat-box word-cloud">Box 4</div>
        <div className="stat-box actors">Box 5</div>
        <div className="stat-box watchlist">Box 6</div>
      </div>
    </div>
  );
};

export default Profile;