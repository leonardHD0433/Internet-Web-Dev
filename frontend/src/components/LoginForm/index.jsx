import { useState } from 'react'
import './styles.css'

const LoginForm = ({ onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.info('Sending credentials:', formData)
    onSubmit(formData)
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      <input 
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        className="login-input"
        required
        disabled={isLoading}
      />
      <input 
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password" 
        className="login-input"
        required
        disabled={isLoading}
      />
      <button 
        type="submit" 
        className="login-button"
        disabled={isLoading}
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}

export default LoginForm