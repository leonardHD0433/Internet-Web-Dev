import React, { useState, useEffect, useRef } from 'react';
import './styles.css';
import TextField from "@mui/material/TextField";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';

function SearchBar() {
    const [searchValue, setSearchValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const debounceTimeout = useRef(null);

    useEffect(() => {
      const fetchSuggestions = async () => {
          if (searchValue.length < 2) {
              setSuggestions([]);
              return;
          }

          setLoading(true);
          setError(null);

          try {
              const response = await fetch(
                  `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_COMMON_SEARCH_PATH}?query=${encodeURIComponent(searchValue)}`
              );
              
              if (!response.ok) {
                  throw new Error('Search failed');
              }

              const data = await response.json();
              setSuggestions(data);
          } catch (err) {
              setError(err.message);
              setSuggestions([]);
          } finally {
              setLoading(false);
          }
      };

      // Debounce search requests
      if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(fetchSuggestions, 300);

      return () => {
          if (debounceTimeout.current) {
              clearTimeout(debounceTimeout.current);
          }
      };
    }, [searchValue]);

    const handleSuggestionClick = (suggestion) => {
        setSearchValue(suggestion.name);
        setSuggestions([]);
        console.log('Selected:', suggestion);
    };
  
    return (
      <div className="search-container" 
      style={{ 
        marginTop: suggestions.length > 0 
          ? `${Math.min(suggestions.length * 52 + 20, 260)}px` 
          : '0px' 
      }}
      >
          <TextField
              id="search-input"
              variant="outlined"
              fullWidth
              placeholder="Search movies, actors, directors..."
              slotProps={{
                  inputLabel: { shrink: false },
                  input: {
                      endAdornment: loading && (
                          <CircularProgress color="inherit" size={20} />
                      )
                  }
              }}
              label=""
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="custom-textfield"
          />
          {suggestions.length > 0 && (
              <List className="suggestions-list">
                  {suggestions.map((suggestion) => (
                      <ListItem
                          key={`${suggestion.type}-${suggestion.id}`}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="suggestion-item"
                          button
                      >
                          <ListItemText
                              primary={`${suggestion.name} (${suggestion.type})`}
                          />
                      </ListItem>
                  ))}
              </List>
            )}
      </div>
    );
  }

export default SearchBar;