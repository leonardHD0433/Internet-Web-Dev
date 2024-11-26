import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import StatusButton from './components/StatusButton'
import LoginForm from './components/LoginForm'
import Logo from './components/Logo'
import CreateAccountButton from './components/CreateAccountButton'
import CreateAccountPage from './pages/CreateAccountPage'
import ConnectionTest from './pages/ConnectionTest'
import MainLayout from './components/MainLayout'
import ActorRanking from './pages/ActorDashboard'
import AboutUs from './pages/AboutUs';
import './App.css'
import './styles/index.css'


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
      setIsLoading(true)
      setError(null)
      
      const url = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_LOGIN_PATH}?email=${credentials.email}&password=${credentials.password}`
      console.info('Login request URL:', url)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      console.info('Response status:', response.status)

      if (!response.ok) {
        throw new Error('Invalid credentials')
      }
  
      const data = await response.json()
      localStorage.setItem('user', JSON.stringify(data))
      setIsAuthenticated(true)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false) 
    }
  }

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
            <StatusButton status={connectionStatus} onClick={handleStatusClick} /> {/* Keep StatusButton here */}
            <Logo />
            <LoginForm onSubmit={handleLogin} />
            <CreateAccountButton />
          </div>
        } />
        <Route path="/register" element={
          <div className="main-content">
            <StatusButton status={connectionStatus} onClick={handleStatusClick} /> {/* Keep StatusButton here */}
            <CreateAccountPage />
          </div>
        } />
        <Route path="/dashboard" element={
          isAuthenticated ? (
            <MainLayout connectionStatus={connectionStatus} handleStatusClick={handleStatusClick}>
              <div>Dashboard Page</div>
            </MainLayout>
          ) : (
            <Navigate to="/" replace />
          )
        } />

<Route path="/about-us" element={<AboutUs connectionStatus={connectionStatus} handleStatusClick={handleStatusClick} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/actor-ranking" element={<ActorRanking connectionStatus={connectionStatus} handleStatusClick={handleStatusClick} />} />
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