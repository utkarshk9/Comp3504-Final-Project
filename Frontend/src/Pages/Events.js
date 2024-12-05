// src/pages/Events.js
import React, { useEffect, useState } from 'react';
import API from '../services/api';
import Nav from '../components/BottomNav';  // Import Nav component
import '../Styles/event.css';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await API.get('/events');
                setEvents(response.data.events);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching events:', error);
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return (
        <div className="events-page">
            <Nav />  {/* Add the navigation bar here */}
            
            {loading ? (
                <div className="loading">
                    Please wait, fetching exciting events for you...
                </div>
            ) : (
                <>
                    <h1 className="events-title">
                        Upcoming Events
                    </h1>
                    <p className="intro-text">
                        Dive into a world of opportunities! Stay engaged, stay informed, and get involved with events that can transform your career and your life. Time waits for no one.
                    </p>
                    <div className="event-list">
                        {events.length === 0 ? (
                            <p className="no-events">
                                No events found. Don’t worry, more are coming soon. Stay tuned!
                            </p>
                        ) : (
                            events.map((event) => (
                                <div key={event.event_id} className="event-item">
                                    <div className="event-content">
                                        <h3 className="event-title">{event.title}</h3>
                                        <p className="event-description">{event.description}</p>
                                        <p className="event-date">
                                            <strong>Date:</strong> {new Date(event.created_at).toLocaleDateString()}
                                        </p>
                                        <p className="event-fee">
                                            <strong>Fee:</strong> ${event.fee}
                                        </p>
                                    </div>
                                    <div className="event-footer">
                                        <p className="event-location">Location: {event.location}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Events;
