import { useState } from 'react';
import './styles.css';
import Logo from '../../components/Logo';

const CreateAccountPage = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Call the onRegister prop from App.jsx
    onRegister(e);
  };

  return (
    <div className="create-account-page">
      <Logo />
      <h1>Sign up for the best movie stats at your fingertips</h1>
      {error && <p className="error-message">{error}</p>}
      <form className="create-account-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input 
            type="text" 
            name="name" 
            value={formData.name}
            onChange={handleChange}
            required 
          />
        </label>
        <label>
          Email Address
          <input 
            type="email" 
            name="email" 
            value={formData.email}
            onChange={handleChange}
            required 
          />
        </label>
        <label>
          Username
          <input 
            type="text" 
            name="username" 
            value={formData.username}
            onChange={handleChange}
            required 
          />
        </label>
        <label>
          Password
          <input 
            type="password" 
            name="password" 
            value={formData.password}
            onChange={handleChange}
            required 
          />
        </label>
        <label>
          Confirm Password
          <input 
            type="password" 
            name="confirmPassword" 
            value={formData.confirmPassword}
            onChange={handleChange}
            required 
          />
        </label>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default CreateAccountPage;