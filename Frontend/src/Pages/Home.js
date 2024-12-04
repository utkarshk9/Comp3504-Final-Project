import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/home.css';
import { FaCalendarAlt, FaUserPlus } from 'react-icons/fa'; // Import icons

const Home = () => {
    return (
        <div className="home-container">
            <div className="hero">
                <h1>Welcome to AlphaCons - Conference Registration</h1>
                <p>
                    AlphaCons provides a complete and simplified experience for managing conferences. Whether you're attending, presenting, or hosting, our platform is designed to streamline registration and help you manage your conference journey effortlessly.
                </p>
                <p>
                    Register as an attendee or presenter, manage your schedule, and explore additional events – all from one place.
                </p>
            </div>
            <div className="cta-buttons">
                <Link to="/events" className="cta-button">
                    <FaCalendarAlt className="cta-icon" /> Explore Events
                </Link>
                <Link to="/register" className="cta-button">
                    <FaUserPlus className="cta-icon" /> Register Now
                </Link>
            </div>
        </div>
    );
};

export default Home;
