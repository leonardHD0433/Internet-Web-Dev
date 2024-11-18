import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState('checking...')
  const [dbStatus, setDbStatus] = useState('checking...')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true)

        // Check API connection
        const apiResponse = await fetch('http://localhost:8000/api/health')
        const apiData = await apiResponse.json()
        setApiStatus(apiData.status)

        // Check DB connection
        const dbResponse = await fetch('http://localhost:8000/api/db-check')
        const dbData = await dbResponse.json()
        setDbStatus(dbData.status)
      } catch (error) {
        console.error('Connection error:', error)
        setApiStatus('failed')
        setDbStatus('failed')
      } finally {
        setIsLoading(false)
      }
    }

    //Initial check
    checkConnection()

    // Set up periodic checks
    const interval = setInterval(checkConnection, 30000)

    // Cleanup on unmount
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="app">
      <h1>Connection Test</h1>
      <div className="status-container">
        <div className="status-card">
          <h2>API Status</h2>
          <p className={`status ${apiStatus === 'healthy' ? 'success' : 'error'}`}>
            {apiStatus}
          </p>
        </div>
        <div className="status-card">
          <h2>Database Status</h2>
          <p className={`status ${dbStatus === 'connected' ? 'success' : 'error'}`}>
            {dbStatus}
          </p>
        </div>
      </div>
    </div>
  )
}

export default App