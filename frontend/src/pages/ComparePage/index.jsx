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
  const [openDialog, setOpenDialog] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [compareData, setCompareData] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleCompareData = (leftMovie, rightMovie) => {
    if (!leftMovie || !rightMovie) return [];

    // Process leftMovie
    leftMovie.numGenres = leftMovie.genre.filter(g => g !== "Unknown").length;
    leftMovie.numActors = leftMovie.starring.filter(a => a !== "Unknown").length;
    leftMovie.numDirectors = leftMovie.director.filter(d => d !== "Unknown").length;
    leftMovie.imdbRating = leftMovie.imdbRating === -1 ? 0 : leftMovie.imdbRating;

    // Process rightMovie
    rightMovie.numGenres = rightMovie.genre.filter(g => g !== "Unknown").length;
    rightMovie.numActors = rightMovie.starring.filter(a => a !== "Unknown").length;
    rightMovie.numDirectors = rightMovie.director.filter(d => d !== "Unknown").length;
    rightMovie.imdbRating = rightMovie.imdbRating === -1 ? 0 : rightMovie.imdbRating;

    const attributes = [
      { key: 'imdbRating', label: 'IMDb Rating' },
      { key: 'popularity', label: 'Popularity' },
      { key: 'numGenres', label: 'Number of Genres' },
      { key: 'numActors', label: 'Number of Actors' },
      { key: 'numDirectors', label: 'Number of Directors' },
      // Add more attributes if needed
    ];

    const maxValues = {
      imdbRating: 100,
      popularity: 100,
      numGenres: Math.max(leftMovie.numGenres, rightMovie.numGenres),
      numActors: Math.max(leftMovie.numActors, rightMovie.numActors),
      numDirectors: Math.max(leftMovie.numDirectors, rightMovie.numDirectors),
    };
  
    const data = attributes.map(attr => ({
      subject: attr.label,
      [leftMovie.title]: (leftMovie[attr.key] / maxValues[attr.key]) * 10,
      [rightMovie.title]: (rightMovie[attr.key] / maxValues[attr.key]) * 10,
    }));
  
    return data;
  };

  useEffect(() => {
    if (leftMovie && rightMovie) {
      const data = handleCompareData(leftMovie, rightMovie);
      setCompareData(data);
    }
  }, [leftMovie, rightMovie]);

  useEffect(() => {
    console.log('Left Movie:', leftMovie);
    console.log('Right Movie:', rightMovie);
    console.log('Type of Left Movie:', typeof leftMovie);
    console.log('Type of Right Movie:', typeof rightMovie);
  }, [leftMovie, rightMovie]);

  useEffect(() => {
    console.log('Left Movie:', leftMovie);
    console.log('Right Movie:', rightMovie);
  }, [leftMovie, rightMovie]);

return (
    <div className="compare-container">
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
      <div className="compare-graph">
        {leftMovie && rightMovie ? (
          <RadarChartCompare data={compareData} />
        ) : (
          <div className="compare-graph-comment">
            Please select two movies to compare.
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
