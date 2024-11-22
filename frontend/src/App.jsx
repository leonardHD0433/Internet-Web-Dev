import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import StatusButton from './components/StatusButton'
import LoginForm from './components/LoginForm'
import Logo from './components/Logo'
import CreateAccountButton from './components/CreateAccountButton'
import CreateAccountPage from './pages/CreateAccountPage'
import ConnectionTest from './pages/ConnectionTest'
import './App.css'
import ActorRanking from './pages/ActorDashboard'

function App() {
  const [showTest, setShowTest] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('checking')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  const handleStatusClick = () => setShowTest(!showTest)
  const handleClose = () => setShowTest(false)

  const handleLogin = () => { 
    setIsAuthenticated(true)
    navigate('/dashboard')
  }

  const handleRegister = (event) => {
    event.preventDefault()
    // Add registration logic here
    navigate('/')
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
      <StatusButton status={connectionStatus} onClick={handleStatusClick} />
      <Routes>
        <Route path="/" element={
          <div className="main-content">
            <Logo />
            <LoginForm onSubmit={handleLogin} />
            <CreateAccountButton />
          </div>
        } />
        <Route path="/register" element={
          <CreateAccountPage onRegister={handleRegister} />
        } />
        <Route path="/dashboard" element={
          isAuthenticated ? (
            <div>Dashboard Page</div>
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/actor-ranking" element={<ActorRanking />} />
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