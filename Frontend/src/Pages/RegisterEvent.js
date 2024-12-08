import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import Spinner from '../components/common/Spinner';
import '../Styles/Register.css';
import '../components/common/Navbar';
import PageTransition from '../components/layout/PageTransition';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        pronouns: '',
        dietary_restrictions: '',
        role: 'Regular Attendee',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Checking if email exists...');
            
            const checkEmailResponse = await API.post('/checkUser', { email: formData.email });
            
            if (checkEmailResponse.data.exists) {
                setError('An account with this email already exists. Redirecting you to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
                return;
            }

            // Rest of the registration process continues if email doesn't exist
            console.log('Starting registration process...');
            const registerResponse = await API.post('/registeruser', formData);
            console.log('Registration response:', registerResponse.data);

            if (!registerResponse.data.success) {
                throw new Error('Registration failed');
            }

            // Then immediately log in to get the user ID
            console.log('Registration successful, attempting login...');
            const loginResponse = await API.post('/login', {
                email: formData.email,
                password: formData.password
            });

            console.log('Login response:', loginResponse.data);

            if (!loginResponse.data.success || !loginResponse.data.userId) {
                throw new Error('Login failed after registration');
            }

            // Store user data
            const userData = {
                userId: loginResponse.data.userId.toString(),
                role: loginResponse.data.role || formData.role,
                email: formData.email,
                name: formData.name
            };

            console.log('About to store user data:', userData);

            // Clear and set localStorage
            localStorage.clear();
            
            // Set each item individually and verify
            Object.entries(userData).forEach(([key, value]) => {
                if (value) {  // Only store non-null values
                    localStorage.setItem(key, value);
                    const stored = localStorage.getItem(key);
                    console.log(`Setting ${key}: ${value} (stored: ${stored})`);
                }
            });

            localStorage.setItem('user', JSON.stringify(userData));

            // Trigger storage event manually since it doesn't fire in the same window
            window.dispatchEvent(new Event('storage'));

            // Verify all data is stored
            console.log('Final localStorage check:', {
                userId: localStorage.getItem('userId'),
                role: localStorage.getItem('role'),
                email: localStorage.getItem('email'),
                name: localStorage.getItem('name'),
                user: localStorage.getItem('user')
            });

            // Add a delay and verify before navigation
            setTimeout(() => {
                const finalCheck = localStorage.getItem('userId');
                console.log('Final userId check before navigation:', finalCheck);
                
                if (finalCheck) {
                    console.log('Navigating to events page...');
                    window.location.href = '/events';
                } else {
                    throw new Error('UserId not set in localStorage before navigation');
                }
            }, 1000);

        } catch (error) {
            console.error('Registration/Login error:', error);
            setError(error.response?.data?.message || error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="register-container">
                <div className="register-card">
                    <div className="register-header">
                        <h1>Create Account</h1>
                        <p>Join us for the conference</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Create a password"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="pronouns">Pronouns</label>
                                <input
                                    type="text"
                                    id="pronouns"
                                    name="pronouns"
                                    value={formData.pronouns}
                                    onChange={handleChange}
                                    placeholder="Optional"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="dietary_restrictions">Dietary Restrictions</label>
                                <input
                                    type="text"
                                    id="dietary_restrictions"
                                    name="dietary_restrictions"
                                    value={formData.dietary_restrictions}
                                    onChange={handleChange}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="role">Role</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="Regular Attendee">Regular Attendee</option>
                                <option value="Author">Author</option>
                            </select>
                        </div>

                        <button 
                            type="submit" 
                            className="register-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="button-content">
                                    <Spinner size="small" color="white" />
                                    <span>Creating Account...</span>
                                </div>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="register-footer">
                        <p>Already have an account? <Link to="/login">Sign in</Link></p>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Register;