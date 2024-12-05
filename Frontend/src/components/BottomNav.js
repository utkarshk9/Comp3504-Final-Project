// src/components/BottomNav.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaCog } from 'react-icons/fa';
import '../Styles/bottomNav.css'; // Create a separate CSS file for this component's styles.

const BottomNav = () => {
    return (
        <div className="bottom-nav">
            <Link to="/" className="nav-item">
                <FaHome className="nav-icon" />
                <span className="nav-label">Home</span>
            </Link>
            <Link to="/events" className="nav-item">
                <FaCalendarAlt className="nav-icon" />
                <span className="nav-label">Events</span>
            </Link>
            <Link to="/settings" className="nav-item">
                <FaCog className="nav-icon" />
                <span className="nav-label">Settings</span>
            </Link>
        </div>
    );
};

export default BottomNav;
