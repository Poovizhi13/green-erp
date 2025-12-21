// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const quickLogin = async (demoUsername, demoPassword) => {
    setError('');
    setLoading(true);
    const result = await login(demoUsername, demoPassword);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Green-ERP</h1>
        <p className="subtitle">Sustainability Monitoring & Procurement</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn-login">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="demo-section">
          <h3>Demo Accounts</h3>
          <div className="demo-buttons">
            <button
              type="button"
              onClick={() => quickLogin('admin', 'admin123')}
              disabled={loading}
              className="btn-demo"
            >
              Admin<br/><small>Full access</small>
            </button>

            <button
              type="button"
              onClick={() => quickLogin('proc_mgr', 'proc123')}
              disabled={loading}
              className="btn-demo"
            >
              Proc Manager<br/><small>Manage items & orders</small>
            </button>

            <button
              type="button"
              onClick={() => quickLogin('sust_mgr', 'sust123')}
              disabled={loading}
              className="btn-demo"
            >
              Sust Manager<br/><small>View reports</small>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
