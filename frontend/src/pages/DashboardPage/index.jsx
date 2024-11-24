import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MultilineGraph from '../../components/MultilineGraph';
import UsersGraph from '../../components/UsersGraph';
import './styles.css';

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Language');
  const [graphData, setGraphData] = useState([]);

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

  const handlePrevious = () => {};

  const handleNext = () => {};

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
            <div className="dashboard-rating"></div>
            <div className="dashboard-rating"></div>
            <div className="dashboard-rating"></div>
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
                <div className="dashboard-more-usertitle">Users</div>
                <div className="dashboard-more-commontitle">Common</div>
            </div>
            <div className="dashboard-more-graph">
                <div className="dashboard-users-graph">
                    <UsersGraph />
                </div>
                <div className="dashboard-common-graph"></div>
            </div>
        </div>
        <div className="pad"></div>      
    </div>
  );
}

export default DashboardPage;
