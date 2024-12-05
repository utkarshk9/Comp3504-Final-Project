// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/home.css';
import { FaCalendarAlt, FaUserPlus } from 'react-icons/fa'; // Import only the needed icons
import image from '../Styles/imgs/photo-1651464223423-e04796c246b8.avif'; // Import image
import BottomNav from '../components/BottomNav'; // Import the BottomNav component

const Home = () => {
    return (
        <div className="home-container">
            <div className="content-area">
                <div className="text-image-container">
                    <div className="text-content">
                        <h1 className="app-title">Welcome to AlphaCons</h1>
                        <p className="app-description">
                            A modern conference management app designed to help you effortlessly register, manage schedules, and explore events. Whether you're attending, presenting, or hosting, we simplify your conference journey.
                        </p>
                        <div className="cta-buttons">
                            <Link to="/events" className="cta-button">
                                <FaCalendarAlt className="cta-icon" /> Explore Events
                            </Link>
                            <Link to="/register" className="cta-button">
                                <FaUserPlus className="cta-icon" /> Register Now
                            </Link>
                        </div>
                    </div>
                    <div className="image-container">
                        <img src={image} alt="Conference Community" className="home-image" />
                    </div>
                </div>
            </div>

            {/* Upcoming Events Section */}
            <div className="upcoming-events">
                <h2>Upcoming Events</h2>
                <p>Stay ahead of the game by discovering upcoming conferences and seminars. Click below to check them out!</p>
                <Link to="/events" className="cta-button">
                    <FaCalendarAlt className="cta-icon" /> View Events
                </Link>
            </div>

            {/* Features Overview Section */}
            <div className="features-overview">
                <div className="feature">
                    <h3>Easy Registration</h3>
                    <p>Sign up in minutes and be ready to attend the event.</p>
                </div>
                <div className="feature">
                    <h3>Schedule Management</h3>
                    <p>Track all your sessions and events in one place.</p>
                </div>
                <div className="feature">
                    <h3>Networking</h3>
                    <p>Connect with other attendees, speakers, and sponsors.</p>
                </div>
            </div>

            {/* Bottom Navigation Menu */}
            <BottomNav /> {/* Use the BottomNav component here */}
        </div>
    );
};

export default Home;

