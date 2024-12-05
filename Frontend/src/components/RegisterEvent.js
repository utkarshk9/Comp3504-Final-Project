import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import API from '../services/api';
import '../Styles/RegisterEvent.css';

const RegisterEvent = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Regular Attendee', // Default role corrected
        pronouns: '',
        dietary_restrictions: '',
    });

    const navigate = useNavigate(); // Initialize navigate

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('http://localhost:8080/api/registeruser', formData);
            alert('Registration successful!');
            navigate('/'); // Redirect to the home page
        } catch (error) {
            console.error('Error registering user:', error);
            alert('Failed to register.');
        }
    };

    return (
        <div className="register-event">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name:</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                        placeholder="Your Full Name" 
                    />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        placeholder="Your Email Address" 
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                        placeholder="Your Password" 
                    />
                </div>
                <div className="form-group">
                    <label>Pronouns:</label>
                    <input 
                        type="text" 
                        name="pronouns" 
                        value={formData.pronouns} 
                        onChange={handleChange} 
                        placeholder="Your Pronouns (e.g., they/them)" 
                    />
                </div>
                <div className="form-group">
                    <label>Dietary Restrictions:</label>
                    <input 
                        type="text" 
                        name="dietary_restrictions" 
                        value={formData.dietary_restrictions} 
                        onChange={handleChange} 
                        placeholder="Any Dietary Restrictions?" 
                    />
                </div>
                <div className="form-group">
                    <label>Role:</label>
                    <select name="role" value={formData.role} onChange={handleChange}>
                        <option value="Regular Attendee">Regular Attendee</option>
                        <option value="Author">Author</option>
                    </select>
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default RegisterEvent;
