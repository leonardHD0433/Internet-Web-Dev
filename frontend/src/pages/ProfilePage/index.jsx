import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';


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
        <div className="avg-rating">Average Rating: {watchlistStats.average_rating}</div>
        <div className="avg-popularity">Average Popularity: {watchlistStats.average_popularity}</div>
        <div className="screentime">Total Runtime: {watchlistStats.total_runtime}</div>
        <div className="word-cloud">Box 4</div>
        <div className="actors">Box 5</div>
        <div className="watchlist">Box 6</div>
      </div>
    );
  };
  export default Profile;