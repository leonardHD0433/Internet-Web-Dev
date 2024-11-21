import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import Logo from '../../components/Logo';

const CreateAccountPage = () => {
  const navigate = useNavigate();
  
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

  const handleSubmit = async (e) => {
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

    const queryParams = new URLSearchParams({
      name: formData.name,
      email: formData.email,
      username: formData.username,
      password: formData.password,
    });
  
    try {
      const url = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_REGISTER_PATH}?${queryParams.toString()}`
      console.info('Register request URL:', url) // For debugging
      
      const response = await fetch(url, {
        method: 'GET',
      });
      const data = await response.json();
      if (data.success) {
        alert('Registered Successfully');
        navigate('/');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred');
    }
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