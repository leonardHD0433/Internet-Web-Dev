import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import MainLayout from '../../components/MainLayout';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    // Call logout API here
    setLoading(false);
    navigate('/login');
  };

  return (
    <MainLayout>
        <div className="compare-container">
            <div className="compare-content"></div>
            <div className="compare-content"></div>
        </div>
    </MainLayout>
  );
}

export default DashboardPage;
