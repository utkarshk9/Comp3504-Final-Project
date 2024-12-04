import React from 'react';
import RegisterEvent from '../components/RegisterEvent';
import '../Styles/Register.css'; // Adding CSS file for the page style

const Register = () => {
    return (
        <div className="register-page">
            <div className="register-container">
                <h1>Register for the Event</h1>
                <RegisterEvent />
            </div>
        </div>
    );
};

export default Register;
