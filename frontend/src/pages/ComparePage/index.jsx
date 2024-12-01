import { useEffect, useState } from 'react';
import RatingBox from '../../components/RatingBox';
import RadarChartCompare from '../../components/RadarChartCompare';
import TextField from "@mui/material/TextField";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import './styles.css';

const ComparePage = () => {
  const [leftMovie, setLeftMovie] = useState(null);
  const [rightMovie, setRightMovie] = useState(null);
  const [leftData, setLeftData] = useState(null);
  const [rightData, setRightData] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [compareData, setCompareData] = useState([]);
  const [loading, setLoading] = useState(false);
  // Add state for checkboxes
  const [selectedMetrics, setSelectedMetrics] = useState([
    'IMDb Rating',
    'Popularity',
    'Number of Genres',
    'Number of Actors',
    'Number of Directors',
  ]);

  const containerStyle = {
    marginTop: selectedMetrics.length === 5 && leftMovie && rightMovie ? '220px' : '200px',
  };

  const metricsOptions = [
    'IMDb Rating',
    'Popularity',
    'Number of Genres',
    'Number of Actors',
    'Number of Directors',
    'Number of Writers',
    'Runtime',
  ];

  const handleMetricChange = (metric) => {
    setSelectedMetrics((prevSelected) => {
      if (prevSelected.includes(metric)) {
        return prevSelected.filter((m) => m !== metric);
      } else {
        return [...prevSelected, metric];
      }
    });
  };

  const getMetricValue = (movie, metric) => {
    switch (metric) {
      case 'IMDb Rating':
        return movie.imdb_rating ? parseFloat(movie.imdb_rating) : 0;
      case 'Popularity':
        return movie.popularity ? parseFloat(movie.popularity) : 0;
      case 'Number of Genres':
        return movie.genres ? movie.genres.length : 0;
      case 'Number of Actors':
        return movie.actors ? movie.actors.length : 0;
      case 'Number of Directors':
        return movie.directors ? movie.directors.length : 0;
      case 'Number of Writers':
        return movie.writers ? movie.writers.length : 0;
      case 'Runtime':
        return movie.runtime || 0;
      default:
        return 0;
    }
  };

  const handleAddMovie = (position) => {
    setActiveButton(position);
    setOpenDialog(true);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearch = async (query) => {
    // Don't search if query is too short
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_COMMON_SEARCH_MOVIE_PATH}?query=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setSearchResults(data);
      console.log('Search Results:', data);
      
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieSelect = async (movie) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_COMMON_SEARCH_MOVIE_PATH}/${movie.id}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch movie details');
      
      const data = await response.json();
      console.log('Selected Movie Data:', data);
      
      // Transform data to match RatingBox props
      const movieDetails = {
        id: data.id,
        title: data.title,
        director: data.directors,
        starring: data.actors,
        genre: data.genres,
        imdbRating: data.imdb_rating,
        popularity: data.popularity,
        date_released : data.date_released
      };
      
      if (activeButton === 'left') {
        setLeftMovie(movieDetails);
      } else {
        setRightMovie(movieDetails);
      }
      
      setOpenDialog(false);
      
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  const getCompareData = async (movie_id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_GET_MOVIE_GRAPH_PATH}/${movie_id}`
      );
      
      if (!response.ok) {
        throw new Error('Fetch failed');
      }
      
      const data = await response.json();
      console.log('Compare Data for Movie ID', movie_id, ':', data);
      return data;
      
    } catch (error) {
      console.error('Fetch error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleCompareData = () => {
    if (!leftData || !rightData) return;
  
    const data = selectedMetrics.map((metric) => {
      const leftValue = parseFloat(getMetricValue(leftData, metric));
      const rightValue = parseFloat(getMetricValue(rightData, metric));
  
      // Avoid division by zero
      const maxValue = Math.max(leftValue, rightValue, 1);
  
      const leftResult = ((leftValue / maxValue) * 10).toFixed(2);
      const rightResult = ((rightValue / maxValue) * 10).toFixed(2);
  
      return {
        subject: metric,
        [leftData.title]: parseFloat(leftResult),
        [rightData.title]: parseFloat(rightResult),
      };
    });
  
    console.log('Compare Data:', data);
    setCompareData(data);
  };

  useEffect(() => {
    const fetchCompareData = async () => {
      if (leftMovie && rightMovie) {
        const left_data = await getCompareData(leftMovie.id);
        const right_data = await getCompareData(rightMovie.id);
        setLeftData(left_data);
        setRightData(right_data);
      }
    };
  
    fetchCompareData();
  }, [leftMovie, rightMovie]);

  useEffect(() => {
    console.log('Left Movie:', leftMovie);
    console.log('Right Movie:', rightMovie);
  }, [leftMovie, rightMovie]);

  useEffect(() => {
    console.log('Selected Metrics:', selectedMetrics);
  }, [selectedMetrics]);

  useEffect(() => {
    if (leftData && rightData) {
      handleCompareData();
    }
    console.log('Left Data:', leftData);
    console.log('Right Data:', rightData);
  }, [selectedMetrics, leftData, rightData]);

  useEffect(() => {
    if (leftData && rightData) {
      handleCompareData();
    }
    console.log('Left Data:', leftData);
    console.log('Right Data:', rightData);
  }, [selectedMetrics, leftMovie, rightMovie]);

  return (
    <div className="compare-container" style={containerStyle}>
      <div className="compare-space">
        <div className="compare-content">
          {leftMovie ? (
            <div className="movie-selection">
              <RatingBox {...leftMovie} />
              <button
                  className="change-movie-button"
                  onClick={() => handleAddMovie('left')}
                  aria-label="Change first movie"
                >
                  Change Movie
              </button>
            </div>
          ) : (
            <button 
              className="add-movie-button"
              onClick={() => handleAddMovie('left')}
              aria-label="Add first movie"
            >
              <span className="plus-icon">+</span>
            </button>
          )}
        </div>
        <div className="compare-content">
          {rightMovie ? (
            <div className="movie-selection">
              <RatingBox {...rightMovie} />
              <button
                className="change-movie-button"
                onClick={() => handleAddMovie('right')}
                aria-label="Change second movie"
              >
                Change Movie
              </button>
            </div>
          ) : (
            <button 
              className="add-movie-button"
              onClick={() => handleAddMovie('right')}
              aria-label="Add second movie"
            >
              <span className="plus-icon">+</span>
            </button>
          )}
        </div>
      </div>
      <div className="compare-graph-section">
        {leftMovie && rightMovie ? (
          <>
            <div className="compare-graph">
              {selectedMetrics.length === 5 ? (
                <RadarChartCompare data={compareData} />
              ) : selectedMetrics.length === 0 ? (
                <div>
                  Please tick 5 metrics to display the comparison.
                </div>
              ) : selectedMetrics.length < 5 ? (
                <div>
                  Insufficient metrics selected. Please select 5 metrics.
                </div>
              ) : (
                <div>
                  Only 5 metrics can be selected.
                </div>
              )}
            </div>
            <div className="metrics-checkboxes">
              {metricsOptions.map((metric) => (
                <div key={metric}>
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric)}
                    onChange={() => handleMetricChange(metric)}
                  />
                  <label>{metric}</label>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="compare-graph">
            <div>
              Please select two movies to compare.
            </div>
          </div>
        )}
      </div>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search movies"
            type="text"
            fullWidth
            variant="outlined"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
          />
          <List>
            {searchResults.map((movie) => (
              <ListItem 
                button 
                key={movie.id}
                onClick={() => handleMovieSelect(movie)}
              >
                <ListItemText 
                  primary={movie.name} 
                  secondary={movie.year} 
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ComparePage;