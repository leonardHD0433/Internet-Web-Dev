import { useState } from 'react'
import StatusButton from './components/StatusButton'
import ConnectionTest from './pages/ConnectionTest'
import LoginForm from './components/LoginForm'
import Logo from './components/Logo'
import CreateAccountButton from './components/CreateAccountButton'
import CreateAccountPage from './pages/CreateAccountPage'
import './App.css'

function App() {
  const [showTest, setShowTest] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('checking')
  const [showCreateAccountPage, setShowCreateAccountPage] = useState(false)

  const handleStatusClick = () => setShowTest(!showTest)
  const handleClose = () => setShowTest(false)
  const handleLogin = () => { /* Add login logic */ }
  const handleCreateAccount = () => setShowCreateAccountPage(true)
  const handleRegister = (event) => {
    event.preventDefault()
    // Add registration logic here
    setShowCreateAccountPage(false)
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
      {showCreateAccountPage ? (
        <CreateAccountPage onRegister={handleRegister} />
      ) : (
        <div className="main-content">
          <Logo />
          <LoginForm onSubmit={handleLogin} />
          <CreateAccountButton onClick={handleCreateAccount} />
        </div>
      )}
      {showTest && (
        <div className="test-overlay">
          <ConnectionTest onStatusUpdate={handleStatusUpdate} onClose={handleClose} />
        </div>
      )}
    </div>
  )
}

export default App