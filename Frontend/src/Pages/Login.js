import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import PageTransition from '../components/layout/PageTransition';
import '../Styles/Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await API.post('/login', credentials);
            
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.userId);
                localStorage.setItem('role', response.data.role);

                const redirectPath = response.data.role === 'Admin' 
                    ? '/admin/dashboard' 
                    : '/profile';

                navigate(redirectPath, { replace: true });
                setTimeout(() => {
                    window.location.href = redirectPath;
                }, 100);
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'An error occurred during login');
            localStorage.clear();
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h1>Welcome Back</h1>
                        <p>Sign in to your account</p>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={credentials.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button 
                            type="submit" 
                            className={`login-button ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="button-content">
                                    <div className="spinner"></div>
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Don't have an account? <Link to="/register">Sign up</Link></p>
                        <Link to="/forgot-password" className="forgot-password">
                            Forgot your password?
                        </Link>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Login;
