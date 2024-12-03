import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <h1>Welcome to the Conference Registration System</h1>
            <p>Explore events and register as an attendee or author.</p>
            <Link to="/events">Go to Events</Link>
            <Link to="/register">Register for the Event</Link>
        </div>
        
    );
};

export default Home;
