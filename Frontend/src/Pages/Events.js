// pages/Events.js
import React, { useEffect, useState } from 'react';
import API from '../services/api';
import '../Styles/event.css';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true); // To handle loading state

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await API.get('/events'); // Fetching data from the backend
                setEvents(response.data.events); // Update the state with the events
                setLoading(false); // Data fetched, set loading to false
            } catch (error) {
                console.error('Error fetching events:', error);
                setLoading(false);
            }
        };

        fetchEvents();
    }, []); // Empty array ensures this effect runs only once on mount

    if (loading) {
        return <div>Loading events...</div>; // Show loading message while data is being fetched
    }

    return (
        <div className="events-container">
            <h1>Upcoming Events</h1>
            <ul className="event-list">
                {events.length === 0 ? (
                    <p>No events found.</p>
                ) : (
                    events.map((event) => (
                        <li key={event.event_id} className="event-item">
                            <h3>{event.title}</h3>
                            <p>{event.description}</p>
                            <p className="event-date">Date: {new Date(event.created_at).toLocaleDateString()}</p>
                            <p className="event-location">Fee: ${event.fee}</p>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default Events;