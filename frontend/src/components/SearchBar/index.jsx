// index.jsx
import React, { useState } from 'react';
import './styles.css';
import TextField from "@mui/material/TextField";

function SearchBar() {
    const [searchValue, setSearchValue] = useState('');
  
    return (
      <div className="search-container">
        <TextField
          id="outlined-basic"
          variant="outlined"
          fullWidth
          placeholder="Search"
          InputLabelProps={{ shrink: false }}
          label=""
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="custom-textfield"
        />
      </div>
    );
  }

export default SearchBar;