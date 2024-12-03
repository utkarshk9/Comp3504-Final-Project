import React, { useState } from 'react';
import API from '../services/api';

const RegisterEvent = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Regular', // Default role
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/registeruser', formData);
            alert('Registration successful!');
        } catch (error) {
            console.error('Error registering user:', error);
            alert('Failed to register.');
        }
    };

    return (
        <div>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Name:
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </label>
                <label>
                    Email:
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </label>
                <label>
                    Password:
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                </label>
                <label>
                    Pronouns:
                    <input type="pronouns" name="pronouns" value={formData.pronouns} onChange={handleChange} />
                </label>
                <label>
                dietary_restrictions:
                    <input type="dietary_restrictions" name="dietary_restrictions" value={formData.dietary_restrictions} onChange={handleChange}/>
                </label>
                <label>
                    Role:
                    <select name="role" value={formData.role} onChange={handleChange}>
                        <option value="Regular Attendee">Regular Attendee</option>
                        <option value="Author">Author</option>
                    </select>
                </label>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default RegisterEvent;
