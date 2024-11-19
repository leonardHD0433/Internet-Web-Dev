import { useState, useEffect } from 'react'
import CloseButton from '../../components/CloseButton'
import './styles.css'

function ConnectionTest({ onStatusUpdate, onClose }) { 
  const [apiStatus, setApiStatus] = useState('checking...')
  const [dbStatus, setDbStatus] = useState('checking...')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true)
        const apiResponse = await fetch(
          `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_HEALTH_PATH}`
        )
        const apiData = await apiResponse.json()
        setApiStatus(apiData.status)

        const dbResponse = await fetch(
          `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_DB_CHECK_PATH}`
        )
        const dbData = await dbResponse.json()
        setDbStatus(dbData.status)
        
        onStatusUpdate(apiData.status, dbData.status)
      } catch (error) {
        console.error('Connection error:', error)
        setApiStatus('failed')
        setDbStatus('failed')
        onStatusUpdate('failed', 'failed')
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [onStatusUpdate])

  return (
    <div className="connection-test">
      <CloseButton onClick={onClose} />
      <h1>Connection Test</h1>
      <div className="status-container">
        <div className="status-card">
          <h2>API Status</h2>
          <p className={`status ${apiStatus === 'healthy' ? 'success' : 'error'}`}>
            {isLoading ? 'Checking...' : apiStatus}
          </p>
        </div>
        <div className="status-card">
          <h2>Database Status</h2>
          <p className={`status ${dbStatus === 'connected' ? 'success' : 'error'}`}>
            {isLoading ? 'Checking...' : dbStatus}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ConnectionTest