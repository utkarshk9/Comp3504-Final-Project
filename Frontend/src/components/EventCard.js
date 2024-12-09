import '../Styles/Eventcard.css';
import API from '../services/api';
import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from '../components/common/AuthContext';
import { useNavigate } from 'react-router-dom';
import { EVENT_IMAGES, getEventImage } from '../components/common/eventImages';

const EventCard = ({ event }) => {
    const [isRegistered, setIsRegistered] = React.useState(false);
    const { userId, isLoggedIn, userRole } = useAuth();
    const navigate = useNavigate();

    const getUserFee = () => {
        if (event.event_type === 'optional') return event.optional_fee;
        if (userRole === 'author') return event.author_fee;
        return event.regular_fee;
    };

    React.useEffect(() => {
        console.log('Current userId:', userId);
        console.log('Current event:', event);

        if (userId) {
            API.get(`/attendee_events/${userId}`)
                .then(response => {
                    console.log('Registration check response:', response.data);
                    const isEventRegistered = response.data.events.some(
                        registeredEvent => registeredEvent.event_id === event.event_id
                    );
                    setIsRegistered(isEventRegistered);
                })
                .catch(error => {
                    if (error.response?.status === 404) {
                        setIsRegistered(false);
                    } else {
                        console.error('Error checking registration status:', error);
                    }
                });
        }
    }, [event.event_id, userId]);

    const handleRegistration = () => {
        if (!isLoggedIn || !userId) {
            navigate('/login');
            return;
        }
        
        if (isRegistered) {
            alert('You are already registered for this event');
            return;
        }

        API.post('/attendee_events', {
            attendee_id: userId,
            event_id: event.event_id
        })
        .then(response => {
            if (response.data.success) {
                setIsRegistered(true);
                alert('Successfully registered for the event! Redirecting to profile for payment...');
                // Add a small delay before redirecting to allow the alert to be seen
                setTimeout(() => {
                    navigate('/profile');
                }, 1500);
            }
        })
        .catch(error => {
            if (error.response?.status === 400) {
                setIsRegistered(true);
                alert('You are already registered for this event');
            } else {
                console.error('Registration error:', error);
                alert('Failed to register for event. Please try again.');
            }
        });
    };

    return (
        <div className="event-card">
            {/* Image Section */}
            <div className="event-image-container">
                <img 
                    src={event.imageUrl || getEventImage(event.name)} 
                    alt={event.name}
                    className="event-image"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = EVENT_IMAGES[0];
                    }}
                />
                {event.isCore && <div className="star-icon">★</div>}
            </div>

            {/* Info Section */}
            <div className="event-info-container">
                <h3 className="event-title">{event.name}</h3>
                <p className="event-description">{event.description}</p>
                <p className="event-date">
                    Date: {event.Date ? new Date(event.Date).toLocaleDateString() : "TBA"}
                </p>
                <div className="event-fees">
                    <h4>Registration Fees:</h4>
                    {event.event_type === 'optional' ? (
                        <p className="highlighted-fee">
                            <strong>Event Fee:</strong> ${getUserFee()}
                            {isLoggedIn && <span className="your-fee"> (Your Fee)</span>}
                        </p>
                    ) : (
                        <>
                            <p className={userRole === 'author' ? 'highlighted-fee' : ''}>
                                <strong>Author Fee:</strong> ${event.author_fee}
                                {userRole === 'author' && <span className="your-fee"> (Your Fee)</span>}
                            </p>
                            <p className={userRole === 'regular' ? 'highlighted-fee' : ''}>
                                <strong>Regular Attendee:</strong> ${event.regular_fee}
                                {userRole === 'regular' && <span className="your-fee"> (Your Fee)</span>}
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Register Button Section */}
            <div className="register-button-container">
                <button 
                    className={`register-btn ${isRegistered ? 'registered' : ''}`}
                    disabled={isRegistered}
                    onClick={handleRegistration}
                >
                    {isRegistered ? 'Already Registered' : 'Register Now'}
                </button>
            </div>
        </div>
    );
};

export default EventCard;
