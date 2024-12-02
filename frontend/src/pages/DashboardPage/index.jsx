import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MultilineGraph from '../../components/MultilineGraph';
import UsersGraph from '../../components/UsersGraph';
import RatingBox from '../../components/RatingBox';
import WordCloud from '../../components/WordCloud';
import './styles.css';

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Year');
  const [graphData, setGraphData] = useState([]);
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [commonGenres, setCommonGenres] = useState([]);

  const options = ['Language', 'Year'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_MULTILINE_PATH}?filterType=${selectedOption}`);
        const data = await response.json();
        setGraphData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedOption]);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_RATING_PATH}`);
        const data = await response.json();
        console.log('🎬 Movies:', data);
        const sortedMovies = [...data].sort((a, b) => {
          const dateA = new Date(a.date_released.split('-').reverse().join('-'));
          const dateB = new Date(b.date_released.split('-').reverse().join('-'));
          return dateB - dateA; // Most recent first
        });
        setMovies(sortedMovies);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const fetchCommonGenres = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_COMMON_GENRES_PATH}`);
        const data = await response.json();
        console.log('🎬 Common genres:', data);
        setCommonGenres(data);
      } catch (error) {
        console.error('Error fetching common genres:', error);
      }
    };

    fetchCommonGenres();
  }, []);

  // Add Dropdown component inside DashboardPage
  const Dropdown = ({ value, onChange, options }) => (
    <select 
      className="dashboard-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map(option => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const handlePrevious = () => {
    if (currentIndex > 2) {
      setCurrentIndex(currentIndex - 3);
    }
    console.log(currentIndex);
  };

  const handleNext = () => {
    if (currentIndex < movies.length - 3) {
      setCurrentIndex(currentIndex + 3);
    }
    console.log(currentIndex);
  };

  const passDetails = (index) => {
    if (movies[index]) {
      return {
        title: movies[index].title,
        director: movies[index].director,
        starring: movies[index].starring,
        genre: movies[index].genre,
        imdbRating: movies[index].imdbRating,
        popularity: movies[index].popularity,
        date_released: movies[index].date_released
      };
    }
    return {};
  };


  return (
    <div className="dashboard-container">
        <div className="dashboard-header">
            <div className="dashboard-header-title">New Releases</div>
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
              <RatingBox
                {...passDetails(currentIndex)}
              />
            </div>
            <div className="dashboard-rating">
              <RatingBox
                {...passDetails(currentIndex + 1)}
              />
            </div>
            <div className="dashboard-rating">
              <RatingBox
                {...passDetails(currentIndex + 2)}
              />
            </div>
        </div>
        <div className="dashboard-multiline-graph-container">
            <div className="dashboard-multiline-graph-header">
                <div className="dashboard-multiline-title">Movie Releases by</div>
                <Dropdown 
                    value={selectedOption}
                    onChange={setSelectedOption}
                    options={options}
                />
            </div>
            <div className="dashboard-multiline-graph">
                {loading ? (
                <p>Loading...</p>
              ) : (
                <MultilineGraph 
                  data={graphData} 
                  filterType={selectedOption}
                />
              )}
            </div>
        </div> 
        <div className="dashboard-more-graph-container">
            <div className="dashboard-more-graph-header">
                <div className="dashboard-more-usertitle">Number of users joining the platform every year</div>
                <div className="dashboard-more-commontitle">Most Common Movie Genres</div>
            </div>
            <div className="dashboard-more-graph">
                <div className="dashboard-users-graph">
                    <UsersGraph />
                </div>
                <div className="dashboard-common-graph">
                    <WordCloud data={commonGenres} />
                </div>
            </div>
        </div>
        <div className="pad"></div>      
    </div>
  );
}

export default DashboardPage;