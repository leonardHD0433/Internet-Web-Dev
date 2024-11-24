import { useEffect, useState } from 'react';
import RatingBox from '../../components/RatingBox';
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
        title: data.title,
        director: data.directors,
        starring: data.actors,
        genre: data.genres,
        imdbRating: data.imdb_rating,
        popularity: data.popularity
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

  useEffect(() => {
    console.log('Left Movie:', leftMovie);
    console.log('Right Movie:', rightMovie);
  }, [leftMovie, rightMovie]);

return (
    <div className="compare-container">
      <div className="compare-space">
        <div className="compare-content">
          {leftMovie ? (
            <RatingBox {...leftMovie} />
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
            <RatingBox {...rightMovie} />
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
        <div className="compare-graph-comment"></div>
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
