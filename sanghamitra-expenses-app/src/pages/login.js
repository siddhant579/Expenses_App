// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Eye, EyeOff } from 'lucide-react';

const API_URL = 'https://expenses-app-server-one.vercel.app/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Login successful
      login(data.user, data.token);
      
      // Navigate based on role
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient" 
         style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <div className="card shadow-lg border-0 rounded-3" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                 style={{ width: '64px', height: '64px' }}>
              <Wallet size={32} className="text-white" />
            </div>
            <h2 className="fw-bold">Welcome Back</h2>
            <p className="text-muted">Sign in to your account</p>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <div className="input-group">                              
                <input
                  type={showPassword ? "text" : "password"}              
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button                                                  
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}         
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="text-end mt-2">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="btn btn-link text-decoration-none p-0 small"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
            

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-muted mb-0">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary fw-semibold text-decoration-none">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default LoginPage;


