import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Spinner from '../components/common/Spinner';
import '../Styles/Home.css';

const eventImages = [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&auto=format&fit=crop&q=60'
];

const Home = () => {
    const navigate = useNavigate();
    const [featuredEvents, setFeaturedEvents] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await API.get('/events');
                console.log('API Response:', response);
                const events = response.data.events || [];
                const processedEvents = events.map(event => ({
                    id: event.event_id,
                    name: event.name,
                    description: event.description,
                    Date: event.Date,
                    event_type: event.event_type
                }));
                console.log('Processed Events:', processedEvents);
                setFeaturedEvents(processedEvents);
            } catch (error) {
                console.error('Detailed fetch error:', error);
                setError('Failed to load events. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const tempEvents = [
        {
            id: 1,
            name: "Tech Conference 2024",
            description: "Join us for the biggest tech conference of the year",
            Date: "2024-06-15",
            event_type: "Conference"
        },
        {
            id: 2,
            name: "Web Development Workshop",
            description: "Learn the latest web development technologies",
            Date: "2024-07-01",
            event_type: "Workshop"
        }
    ];

    const handleRegister = (eventId) => {
        console.log('Attempting to register for event:', eventId);
        if (!eventId) {
            console.error('No event ID provided');
            return;
        }
        navigate('/register', { 
            state: { eventId: eventId }
        });
    };

    const getEventImage = (eventName) => {
        const index = eventName ? eventName.charCodeAt(0) % eventImages.length : 0;
        return eventImages[index];
    };

    const nextSlide = () => {
        setCurrentSlide(current => 
            current === featuredEvents.length - 1 ? 0 : current + 1
        );
    };

    const prevSlide = () => {
        setCurrentSlide(current => 
            current === 0 ? featuredEvents.length - 1 : current - 1
        );
    };

    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <h1>Welcome to AlphaCons Conference System</h1>
                <p> A modern conference management app designed to help you effortlessly register and explore events. Whether you're attending, presenting, or hosting, we simplify your conference journey.
                </p>
                <div className="hero-buttons">
                    <Link to="/register" className="cta-button">Register Now</Link>
                    <Link to="/events" className="cta-button secondary-button">Explore Events</Link>
                </div>
            </section>

            {/* Featured Events Slideshow */}
            <section className="featured-events-slideshow">
                <h2 className="section-title">Featured Events</h2>
                <div className="slideshow-container">
                    {isLoading ? (
                        <div className="loading-state">
                            <Spinner />
                            <p>Loading events...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <i className="fas fa-exclamation-circle"></i>
                            <p>{error}</p>
                        </div>
                    ) : (featuredEvents.length === 0 ? tempEvents : featuredEvents).length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-calendar-times"></i>
                            <p>No events found</p>
                        </div>
                    ) : (
                        <>
                            <button className="slide-arrow prev" onClick={prevSlide}>❮</button>
                            <button className="slide-arrow next" onClick={nextSlide}>❯</button>
                            
                            <div className="slides-wrapper">
                                {(featuredEvents.length === 0 ? tempEvents : featuredEvents).map((event, index) => (
                                    <div 
                                        key={event.id || index} 
                                        className="slide"
                                        style={{
                                            transform: `translateX(-${currentSlide * 100}%)`,
                                            transition: 'transform 0.5s ease-in-out'
                                        }}
                                    >
                                        <div className="event-card">
                                            <div className="event-image-container">
                                                <img 
                                                    src={event.imageUrl || getEventImage(event.name)} 
                                                    alt={event.name}
                                                    className="event-image"
                                                />
                                            </div>
                                            <h3>{event.name}</h3>
                                            <p className="event-description">
                                                {event.description || 'No description available'}
                                            </p>
                                            <span className="event-date">
                                                <i className="far fa-calendar-alt"></i>
                                                {event.Date && !isNaN(new Date(event.Date)) ? 
                                                    new Date(event.Date).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    }) : 'TBA'}
                                            </span>
                                            <button 
                                                className="register-btn"
                                                onClick={() => handleRegister(event.id)}
                                            >
                                                Register Now
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Info Section */}
            <section className="info-section">
                <h2 className="section-title">Why Choose AlphaCons?</h2>
                <div className="info-grid">
                    <div className="info-card">
                        <i className="fas fa-user-plus icon"></i>
                        <h3>Easy Registration</h3>
                        <p>Effortlessly register for conferences with our streamlined registration process.</p>
                    </div>
                    <div className="info-card">
                        <i className="fas fa-calendar-check icon"></i>
                        <h3>Schedule Management</h3>
                        <p>Keep track of your conference schedules and never miss an important session.</p>
                    </div>
                    <div className="info-card">
                        <i className="fas fa-compass icon"></i>
                        <h3>Event Discovery</h3>
                        <p>Explore and find the perfect conferences that match your interests and goals.</p>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="newsletter-section">
                <h2 className="section-title">Stay Updated</h2>
                <p>Subscribe to our newsletter for conference updates and announcements.</p>
                <form className="newsletter-form">
                    <input type="email" placeholder="Enter your email address" />
                    <button type="submit" className="cta-button">Subscribe</button>
                </form>
            </section>

            {/* Footer */}
            <footer className="footer">
                <p>© 2024 Conference Registration System. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;