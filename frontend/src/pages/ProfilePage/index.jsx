import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import DonutChart from '../../components/DonutChart';
import RatingBox from '../../components/RatingBox';
import './styles.css'; // Import the CSS file for styling

const Profile = () => {
  const { connectionStatus, handleStatusClick, setIsAuthenticated } = useOutletContext();
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [watchlistStats, setWatchlistStats] = useState({});
  const [commonActors, setCommonActors] = useState([]);
  const userId = JSON.parse(localStorage.getItem('user')).userId;
  const [loading, setLoading] = useState(false);
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  useEffect(() => {
    const fetchCommonActor = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/watchlist-actor-count?user_id=${userId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const commonActorsData = await response.json();
        setCommonActors(commonActorsData);
        console.log(commonActorsData);
      } catch (error) {
        console.error('Error Watchlist Stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchCommonActor();
  }, []);

  useEffect(() => {
    const fetchWatchlistMovies = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/watchlist-movies?user_id=${userId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const watchlistMoviesData = await response.json();
        setWatchlistMovies(watchlistMoviesData);
        console.log('Watchlist Movies:', watchlistMoviesData); // Add this line
      } catch (error) {
        console.error('Error fetching watchlist movies:', error);
      }
    };
    fetchWatchlistMovies();
  }, []);

  const passDetails = (index) => {
    if (watchlistMovies[index]) {
      return {
        title: watchlistMovies[index].title,
        director: watchlistMovies[index].director,
        starring: watchlistMovies[index].starring,
        genre: watchlistMovies[index].genre,
        imdbRating: watchlistMovies[index].imdbRating,
        popularity: watchlistMovies[index].popularity,
        date_released: watchlistMovies[index].date_released
      };
    }
    return {};
  };

  const handlePrevious = () => {
    if (currentIndex > 2) {
      setCurrentIndex(currentIndex - 3);
    }
    console.log(currentIndex);
  };

  const handleNext = () => {
    if (currentIndex < watchlistMovies.length - 3) {
      setCurrentIndex(currentIndex + 3);
    }
    console.log(currentIndex);
  };

  return (
    <div className="profile-Dashboard">
      {watchlistStats.user_name && (
        <div className="welcome-message">
          <h3>Hi there {watchlistStats.user_name}, here are some of your watchlist statistics:</h3>
        </div>
      )}
      <div className="stats-container top">
        <h2>Top Actors In Your Watchlist</h2>
        <div className="stat-box actors">
          <DonutChart data={commonActors} width={800} height={400} />
        </div>
      </div>
      <div className="stats-container bottom">
        <div className="stat-box avg-rating">Average IMDB Rating: <br />{watchlistStats.average_rating}</div>
        <div className="stat-box avg-popularity">Average Popularity: <br />{watchlistStats.average_popularity}</div>
        <div className="stat-box screentime">Total Runtime: <br />{watchlistStats.total_runtime} minutes</div>
      </div>

      <div className="watchlist">
        <div className="dashboard-header">
          <div className="dashboard-header-title">Your Watchlist</div>
          <div className="dashboard-header-button">
            <div className="dashboard-header-leftbutton">
              <button onClick={handlePrevious} disabled={loading}>
                &lt;
              </button>
            </div>
            <div className="dashboard-header-rightbutton">
              <button onClick={handleNext} disabled={loading}>
                &gt;
              </button>
            </div>
          </div>
        </div>
        <div className="dashboard-space-rating">
          <div className="dashboard-rating">
            <RatingBox {...passDetails(currentIndex)} />
          </div>
          <div className="dashboard-rating">
            <RatingBox {...passDetails(currentIndex + 1)} />
          </div>
          <div className="dashboard-rating">
            <RatingBox {...passDetails(currentIndex + 2)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;