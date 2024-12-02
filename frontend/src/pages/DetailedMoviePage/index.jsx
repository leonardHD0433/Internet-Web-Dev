import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TextLooper from '../../components/ChangingWords'; 
import Meter from '../../components/RatingMeterMovie';
import './styles.css';

const DetailedMoviePage = () => {
  const { id } = useParams();
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showRemoveMessage, setShowRemoveMessage] = useState(false); // New state variable
  const userId = JSON.parse(localStorage.getItem('user')).userId;

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_SEARCH_MOVIE_ID_PATH}/${id}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch movie details');
        }

        const data = await response.json();
        setMovieDetails(data);

        // Check if the movie is in the user's watchlist
        const watchlistResponse = await fetch(
          `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_GET_WATCHLIST_PATH}?user_id=${userId}&movie_id=${id}`
        );
        const watchlistData = await watchlistResponse.json();
        setInWatchlist(watchlistData.in_watchlist);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id, userId]);

  const handleAddToWatchlist = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_ADD_TO_WATCHLIST_PATH}?user_id=${userId}&movie_id=${id}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add movie to watchlist');
      }

      const data = await response.json();
      if (data.success) {
        setInWatchlist(true);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000); // Hide success message after 3 seconds
      }
    } catch (err) {
      console.error('Error adding movie to watchlist:', err);
    }
  };

  const handleRemoveFromWatchlist = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_DELETE_WATCHLIST_PATH}?user_id=${userId}&movie_id=${id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to remove movie from watchlist');
      }

      const data = await response.json();
      if (data.success) {
        setInWatchlist(false);
        setShowRemoveMessage(true);
        setTimeout(() => setShowRemoveMessage(false), 3000); // Hide remove message after 3 seconds
      }
    } catch (err) {
      console.error('Error removing movie from watchlist:', err);
    }
  };

  if (loading) {
    return <div className="detail-movie">Loading...</div>;
  }

  if (error) {
    return <div className="detail-movie">Error: {error}</div>;
  }

  if (!movieDetails) {
    return <div className="detail-movie">No movie details available</div>;
  }

  const genreTexts = movieDetails.genres;
  const actorTexts = movieDetails.actors;
  const writerTexts = movieDetails.writers;
  const directorTexts = movieDetails.directors;

  return (
    <div className="detail-movie">
      <div className="row">
        <div className="movie-details">
          <h1 className="movie-title">{movieDetails.title}</h1>
          <div className="movie-info">
            <p><strong>Status:</strong> {movieDetails.status || 'N/A'}</p>
            <p><strong>Release Date:</strong> {movieDetails.release_date || 'N/A'}</p>
            <p><strong>Runtime:</strong> {movieDetails.runtime ? `${movieDetails.runtime} minutes` : 'N/A'}</p>
            <p><strong>Language:</strong> {movieDetails.original_language || 'N/A'}</p>
            <p><strong>Budget:</strong> {movieDetails.budget ? `$${movieDetails.budget.toLocaleString()}` : 'N/A'}</p>
            <p><strong>Genre:</strong> <TextLooper texts={genreTexts} interval={3000} /></p>
            <p><strong>Actor:</strong> <TextLooper texts={actorTexts} interval={3000} /></p>
            <p><strong>Writer:</strong> <TextLooper texts={writerTexts} interval={3000} /></p>
            <p><strong>Director:</strong> <TextLooper texts={directorTexts} interval={3000} /></p>
          </div>
          <p className="movie-overview"><strong>Overview:</strong><br/> {movieDetails.overview || 'No overview available.'}</p>
          {!inWatchlist ? (
            <div className="watchlist-button">
              <button onClick={handleAddToWatchlist}>Add to Watchlist</button>
            </div>
          ) : (
            <div className="watchlist-button">
              <button onClick={handleRemoveFromWatchlist}>Remove from Watchlist</button>
            </div>
          )}
          {showSuccessMessage && (
            <div className="success-message">Movie added to watchlist!</div>
          )}
          {showRemoveMessage && (
            <div className="remove-message">Movie removed from watchlist!</div>
          )}
        </div>
      </div>
      <div className="movie-stats">
        <div className="rating-box-movie">
            <div className="rating-box-imdb">
                <Meter value={movieDetails.imdb_rating} />
                <div className="rating-box-label">IMDB Rating</div>
            </div>
            <div className="rating-box-popular">
                <Meter value={movieDetails.popularity} />
                <div className="rating-box-label">Popularity</div>
            </div>
        </div>
        <div className="similar-movie">Similar Movies</div>
      </div>
    </div>
  );
};

export default DetailedMoviePage;