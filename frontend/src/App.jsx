import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import StatusButton from './components/StatusButton'
import LoginForm from './components/LoginForm'
import Logo from './components/Logo'
import CreateAccountButton from './components/CreateAccountButton'
import CreateAccountPage from './pages/CreateAccountPage'
import ConnectionTest from './pages/ConnectionTest'
import DashBoard from './pages/DashboardPage'
import MainLayout from './components/MainLayout'
import ComparePage from './pages/ComparePage';
import './App.css'

function App() {
  const [showTest, setShowTest] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('checking')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleStatusClick = () => setShowTest(!showTest)
  const handleClose = () => setShowTest(false)

  const handleLogin = async (credentials) => { 
    try {
      setIsLoading(true);
      setError(null);
      
      const url = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_LOGIN_PATH}?email=${encodeURIComponent(credentials.email)}&password=${encodeURIComponent(credentials.password)}`;
      console.info('Login request URL:', url);
  
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        const errorMsg = data.detail || 'Login failed'; // Get error message from API response
        setError(errorMsg);
        alert(errorMsg); // Show alert with API error message
        setIsAuthenticated(false);
        throw new Error(errorMsg);
      }
  
      if (data.success) {
        // Store user data matching backend response
        const userData = {
          userId: data.user_id,
          userName: data.user_name,
          email: data.email
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        navigate('/dashboard');
      } else {
        throw new Error('Login failed');
      }
  
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = (apiStatus, dbStatus) => {
    if (apiStatus === 'healthy' && dbStatus === 'connected') {
      setConnectionStatus('healthy')
    } else if (apiStatus === 'failed' || dbStatus === 'disconnected') {
      setConnectionStatus('failed')
    } else {
      setConnectionStatus('checking')
    }
  }

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={
          <div className="main-content">
            <StatusButton status={connectionStatus} onClick={handleStatusClick} />
            <Logo />
            <LoginForm onSubmit={handleLogin} />
            <CreateAccountButton />
          </div>
        } />
        <Route path="/register" element={
          <div className="main-content">
            <StatusButton status={connectionStatus} onClick={handleStatusClick} />
            <CreateAccountPage />
          </div>
        } />
        {isAuthenticated ? (
          <Route
            path="/dashboard/*"
            element={
              <MainLayout
                connectionStatus={connectionStatus}
                handleStatusClick={handleStatusClick}
              />
            }
          >
            <Route index element={<DashBoard />}
            />
            <Route path="compare" element={<ComparePage />} />
          </Route>
        ) : (
          <Route path="/dashboard/*" element={<Navigate to="/" replace />} />
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showTest && (
        <div className="test-overlay">
          <ConnectionTest onStatusUpdate={handleStatusUpdate} onClose={handleClose} />
        </div>
      )}
    </div>
  )
}

export default App