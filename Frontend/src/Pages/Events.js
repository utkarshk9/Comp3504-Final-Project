import React, { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import EventCard from "../components/EventCard";
import Spinner from "../components/common/Spinner";
import PageTransition from "../components/layout/PageTransition";
import "../Styles/Events.css";

const Events = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEvents = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await API.get("/events");
            setEvents(response.data.events);
            setError(null); // Clear any previous errors
        } catch (error) {
            console.error("Failed to fetch events:", error);
            setError("Failed to load events. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const renderEventSection = (title, description, eventList) => {
        
        return (
            <section className="events-section">
                <h2>{title}</h2>
                {description && <p className="section-description">{description}</p>}
                <div className="event-list">
                    {eventList.map((event) => {
                        console.log('Individual event:', event);
                        return <EventCard key={event.event_id} event={event} />;
                    })}
                </div>
            </section>
        );
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <Spinner size="medium" />
                <p>Loading events...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <button className="retry-button" onClick={fetchEvents}>
                    Retry
                </button>
            </div>
        );
    }

    const coreEvents = events.filter((event) => event.event_type === "core");
    const optionalEvents = events.filter((event) => event.event_type === "optional");

    console.log("Events data:", events);

    return (
        <PageTransition>
            <div className="events-page">
                <h1>Conference Events</h1>

                {renderEventSection("Core Conference Events", "", coreEvents)}

                {renderEventSection(
                    "Optional Conference Events",
                    "Additional fees apply for these events.",
                    optionalEvents
                )}
            </div>
        </PageTransition>
    );
};

export default Events;
