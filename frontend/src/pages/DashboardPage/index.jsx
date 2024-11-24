import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Options');

  const options = ['Language', 'Year'];

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
            <div className="dashboard-multiline-graph"></div>
        </div> 
        <div className="dashboard-more-graph-container">
            <div className="dashboard-more-graph-header">
                <div className="dashboard-more-usertitle">Users</div>
                <div className="dashboard-more-commontitle">Common</div>
            </div>
            <div className="dashboard-more-graph">
                <div className="dashboard-users-graph"></div>
                <div className="dashboard-common-graph"></div>
            </div>

        </div>      
    </div>
  );
}

export default DashboardPage;
