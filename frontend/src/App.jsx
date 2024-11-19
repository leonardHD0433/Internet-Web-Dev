import { useState } from 'react'
import StatusButton from './components/StatusButton'
import ConnectionTest from './pages/ConnectionTest'
import './App.css'

function App() {
  const [showTest, setShowTest] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('checking')

  const handleStatusClick = () => {
    setShowTest(!showTest)
  }

  const handleClose = () => {
    setShowTest(false)
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
      <StatusButton 
        status={connectionStatus} 
        onClick={handleStatusClick}
      />
      {showTest && (
        <div className="test-overlay">
          <ConnectionTest 
            onStatusUpdate={handleStatusUpdate} 
            onClose={handleClose}
          />
        </div>
      )}
    </div>
  )
}

export default App