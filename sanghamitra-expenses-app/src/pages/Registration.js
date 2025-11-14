// src/pages/RegistrationPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Eye, EyeOff } from 'lucide-react';

const API_URL = 'https://expenses-app-server-one.vercel.app/api';

const RegistrationPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [isAdmin, setIsAdmin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    organizationCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-fill organization code from URL parameter
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setFormData(prev => ({ ...prev, organizationCode: codeFromUrl.toUpperCase() }));
      setIsAdmin(false); // Switch to employee mode if code is provided
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isAdmin ? '/register-admin' : '/register-employee';
      const payload = isAdmin
        ? {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            organizationName: formData.organizationName
          }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            organizationCode: formData.organizationCode
          };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful
      login(data.user, data.token);

      // Navigate based on role
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient py-4"
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="card shadow-lg border-0 rounded-3" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                 style={{ width: '64px', height: '64px' }}>
              <Users size={32} className="text-white" />
            </div>
            <h2 className="fw-bold">Create Account</h2>
            <p className="text-muted">Join Sanghamitra Expense Tracker</p>
          </div>

          {/* Admin/Employee Toggle */}
          <div className="btn-group w-100 mb-4" role="group">
            <button
              type="button"
              className={`btn ${isAdmin ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setIsAdmin(true)}
            >
              Admin
            </button>
            <button
              type="button"
              className={`btn ${!isAdmin ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setIsAdmin(false)}
            >
              Employee
            </button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

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
            </div>

            {isAdmin ? (
              <div className="mb-4">
                <label className="form-label fw-semibold">Organization Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Acme Corp"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  required
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="form-label fw-semibold">Organization Code</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="ABC123"
                  value={formData.organizationCode}
                  onChange={(e) => setFormData({ ...formData, organizationCode: e.target.value.toUpperCase() })}
                  required
                />
                <small className="text-muted">
                  {formData.organizationCode ? '✓ Code entered' : 'Get this code from your admin'}
                </small>
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="btn btn-primary w-100 py-2 fw-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating Account...
                </>
              ) : (
                'Register'
              )}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-muted mb-0">
              Already have an account?{' '}
              <button 
                type="button"
                onClick={() => navigate('/login')} 
                className="btn btn-link text-primary fw-semibold text-decoration-none p-0"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default RegistrationPage;

