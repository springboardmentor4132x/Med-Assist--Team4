
import React, { useState } from 'react';
import './App.css';
import Login from './Login.jsx';

function App() {
  const [showLogin, setShowLogin] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    contact: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.age ||
      !formData.gender
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (
      Number(formData.age) <= 0 ||
      !Number.isInteger(Number(formData.age))
    ) {
      setError('Please enter a valid age.');
      return;
    }

    if (
      formData.contact &&
      !/^\+?[0-9\s-]{7,15}$/.test(formData.contact)
    ) {
      setError('Please enter a valid contact number.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Send registration details to FastAPI
      const response = await fetch(
        'http://127.0.0.1:8000/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            full_name: formData.fullName,
            email: formData.email,
            password: formData.password,
            age: Number(formData.age),
            gender: formData.gender,
            contact: formData.contact || null
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || 'Registration failed.'
        );
      }

      setSuccess('Registration successful! Your account has been created.');

      console.log('Registered user ID:', data.user_id);

    } catch (error) {
      setError(
        error.message === 'Failed to fetch'
          ? 'Unable to connect to the server. Please try again.'
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // Show Login page
  if (showLogin) {
    return (
      <Login
        onCreateAccount={() => setShowLogin(false)}
      />
    );
  }

  // Show Registration page
  return (
    <div className="page-container">
      <div className="registration-card">

        <div className="brand">
          <div className="brand-icon">✚</div>
          <h1>MedAssist <span>AI</span></h1>
        </div>

        <div className="form-heading">
          <h2>Create Your Account</h2>
          <p>Register to get started with MedAssist AI</p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">

            <div className="input-group">
              <label>Age *</label>
              <input
                type="number"
                name="age"
                placeholder="Enter your age"
                value={formData.age}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">
                  Prefer not to say
                </option>
              </select>
            </div>

          </div>

          <div className="input-group">
            <label>
              Contact Number <span>(Optional)</span>
            </label>
            <input
              type="tel"
              name="contact"
              placeholder="Enter your contact number"
              value={formData.contact}
              onChange={handleChange}
            />
          </div>

          {error && (
            <p className="error-message">{error}</p>
          )}

          {success && (
            <p className="success-message">{success}</p>
          )}

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button type="button" className="google-button">
          <img
            src="/src/assets/google-logo.svg"
            alt="Google"
            className="google-icon"
          />
          Sign in with Google
        </button>

        <p className="login-text">
          Already have an account?{' '}
          <span onClick={() => setShowLogin(true)}>
            Login
          </span>
        </p>

        <p className="footer-text">
          © 2026 MedAssist AI. All rights reserved.
        </p>

      </div>
    </div>
  );
}

export default App;
