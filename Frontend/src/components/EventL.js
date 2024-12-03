import React, { useEffect, useState } from 'react';
import API from '../services/api';

const EventList = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        // Fetch events from the backend
        const fetchEvents = async () => {
            try {
                const response = await API.get('/events');
                setEvents(response.data.events);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
    }, []);

    return (
        <div>
            <h2>Event List</h2>
            <ul>
                {events.map((event) => (
                    <li key={event.event_id}>
                        <h3>{event.name}</h3>
                        <p>{event.description}</p>
                        <p>Fee: ${event.fee}</p>
                        <p>Created at: {event.created_at}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EventList;
