import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/common/AuthContext";
import API from "../services/api";
import UserAvatar from "../components/UserAvatar";
import Spinner from "../components/common/Spinner";
import "../Styles/User.css";
import { loadStripe } from '@stripe/stripe-js';

import { QRCodeSVG } from 'qrcode.react';
import { getEventImage } from '../components/common/eventImages';

// Initialize Stripe (put this outside the component)
const stripePromise = loadStripe('pk_test_51QTc1pCh4dy76T98r8PovtjmjyPMPfemD3v55WvG02Ag11iXYXks6TO9RK5dY5d6xLPu1RDfaFNIqpVBY43wdNA600qDiBvFgL');
/*
Test Card Numbers:
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Authentication Required: 4000 0027 6000 3184

Use any future date for expiry (MM/YY)
Use any 3 digits for CVC
Use any 5 digits for postal code
*/
 const Profile = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [unpaidAmount, setUnpaidAmount] = useState(0);
    const [paidAmount, setPaidAmount] = useState(0);
    const [flippedCards, setFlippedCards] = useState({});
    const [showUpdateForm, setShowUpdateForm] = useState(false);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            logout(); // Call centralized logout function
            setUser(null); // Reset local user state
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Logout error:", error);
            setError("Failed to log out. Please try again.");
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleUpdateClick = () => {
        setShowUpdateForm(true);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const updateUser = async () => {
        const userId = localStorage.getItem("userId");
        try {
            await API.put(`/users/${userId}`, formData);
            setError('');
            setShowUpdateForm(false); // Close form after successful update
            // Refresh user data
            const response = await API.get(`/users/${userId}`);
            setUser(response.data.user);
        } catch (err) {
            console.error('Error updating user:', err);
            setError(err?.response?.status === 400 
                ? "Invalid request. Please check your input and try again."
                : "Failed to update user. Please try again later."
            );
        }
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            const userId = localStorage.getItem("userId");
            
            try {
                const [userResponse, eventsResponse, ticketsResponse] = await Promise.all([
                    API.get(`/users/${userId}`),
                    API.get(`/attendee_events/${userId}`),
                    API.get(`/user/tickets/${userId}`),
                    
                ]);

                const userData = userResponse?.data?.user || null;
                const events = eventsResponse?.data?.events || [];
                const fetchedTickets = ticketsResponse?.data?.tickets || [];
                
                setUser(userData);
                setRegisteredEvents(events);
                setTickets(fetchedTickets);
                
                const { paid, unpaid } = events.reduce((acc, event) => {
                    const ticket = fetchedTickets.find(t => t.eventName === event.name);
                    const eventFee = parseFloat(event.fee || 0);
                    
                    if (ticket && ticket.paymentStatus === 'succeeded') {
                        acc.paid += eventFee;
                    } else if (eventFee > 0) {
                        acc.unpaid += eventFee;
                    }
                    return acc;
                }, { paid: 0, unpaid: 0 });

                setPaidAmount(paid);
                setUnpaidAmount(unpaid);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError("Failed to load profile or events.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, []);
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        email: '',
        pronouns: '',
        dietary_restrictions: '',
        role: ''
    });

    // Update formData when user data is loaded
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                password: user.password || '',  // typically don't pre-fill password
                email: user.email || '',
                pronouns: user.pronouns || '',
                dietary_restrictions: user.dietary_restrictions || '',
                role: user.role || ''
            });
        }
    }, [user]);

    const calculateTotalFees = () => {
        const coreEvents = registeredEvents.filter(
            (event) => event?.event_type?.toLowerCase() === "core"
        );
        const nonCoreEvents = registeredEvents.filter(
            (event) => event?.event_type?.toLowerCase() !== "core"
        );

        const baseRegistrationFee = coreEvents.reduce(
            (sum, event) => sum + parseFloat(event.fee || 0),
            0
        );
        const additionalEventFees = nonCoreEvents.reduce(
            (sum, event) => sum + parseFloat(event.fee || 0),
            0
        );

        return {
            baseRegistrationFee,
            additionalEventFees,
            totalFee: baseRegistrationFee + additionalEventFees,
        };
    };

    const { baseRegistrationFee, additionalEventFees, totalFee } = calculateTotalFees();

    if (isLoading) {
        return (
            <div className="profile-loading-container">
                <Spinner size="medium" />
                <p>Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <button onClick={() => navigate("/login")}>Go to Login</button>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="user-profile-page">
                {user && (
                    <div className="profile-info">
                        <UserAvatar role={user.role} name={user.name} />
                        <h1>{user.name}</h1>
                        <p>Email: {user.email}</p>
                        <p>Role: {user.role}</p>
                        <p>Pronouns: {user.pronouns || "Not provided"}</p>
                        <p>Dietary Restrictions: {user.dietary_restrictions || "None"}</p>
                        <div className="action-buttons">
                            <button
                                className="primary-button"
                                onClick={() => navigate("/events")}
                            >
                                Go to Events
                            </button>
                            <button
                                className="secondary-button"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                            >
                                {isLoggingOut ? <Spinner size="small" /> : "Logout"}
                            </button>
                            <button
                                className="secondary-button"
                                onClick={handleUpdateClick}
                            >
                                Update Profile
                            </button>
                            {user.role === "Admin" && (
                                <button
                                    className="admin-button"
                                    onClick={() => navigate("/admin/dashboard")}
                                >
                                    Admin Dashboard
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="profile-main">
                    <div className="registration-info">
                        <h2>Registration Information</h2>
                        <div className="fee-details">
                            <div className="fee-item">
                                <span>Base Registration Fee:</span>
                                <span>${baseRegistrationFee.toFixed(2)}</span>
                            </div>
                            <div className="fee-item">
                                <span>Additional Event Fees:</span>
                                <span>${additionalEventFees.toFixed(2)}</span>
                            </div>
                            <div className="fee-item total">
                                <span>Total Fee:</span>
                                <span>${totalFee.toFixed(2)}</span>
                            </div>
                        </div>

                        {paidAmount > 0 && (
                            <div className="payment-section paid">
                                <h3>Amount Paid</h3>
                                <p className="paid-amount">
                                    You have paid: CAD ${paidAmount.toFixed(2)}
                                </p>
                            </div>
                        )}

                        {totalFee > paidAmount ? (
                            <div className="payment-section unpaid">
                                <h3>Payment Required</h3>
                                <p className="unpaid-amount">
                                    Total unpaid amount: CAD ${(totalFee - paidAmount).toFixed(2)}
                                </p>
                                <button 
                                    className="primary-button"
                                    onClick={() => navigate('/payment', {
                                        state: {
                                            amount: totalFee - paidAmount,
                                            userId: localStorage.getItem("userId"),
                                            events: registeredEvents
                                        }
                                    })}
                                >
                                    Pay Unpaid Balance
                                </button>
                            </div>
                        ) : (
                            <div className="payment-section paid">
                                <p className="no-payment-required">
                                    No payment required - All fees have been paid
                                </p>
                            </div>
                        )}
                    </div>
                    
                    <div className="registered-events">
                        <h2>Registered Events</h2>
                        {registeredEvents.length > 0 ? (
                            <div className="events-grid">
                                {registeredEvents.map((event) => {
                                    const ticket = tickets.find(t => t.eventName === event.name);
                                    
                                    const handleClick = () => {
                                        if (ticket?.paymentStatus === 'succeeded') {
                                            setFlippedCards(prev => ({
                                                ...prev,
                                                [event.event_id]: !prev[event.event_id]
                                            }));
                                        }
                                    };

                                    return (
                                        <div 
                                            key={event.event_id}
                                            className={`event-card ${flippedCards[event.event_id] ? 'flipped' : ''} ${ticket?.paymentStatus === 'succeeded' ? 'paid' : 'unpaid'}`} 
                                            onClick={handleClick}
                                        >
                                            <div className="event-card-inner">
                                                <div className="event-card-front">
                                                    <h3>{event.name}</h3>
                                                    <div className="event-image">
                                                        <img 
                                                            src={getEventImage(event.name) || '/default-event.jpg'} 
                                                            alt={event.name}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = '/default-event.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="event-details">
                                                        <p>Date: {new Date(event.date).toLocaleDateString()}</p>
                                                        <p>Fee: ${parseFloat(event.fee || 0).toFixed(2)}</p>
                                                        <p className="payment-status">
                                                            {ticket?.paymentStatus === 'succeeded' ? (
                                                                'Status: Paid'
                                                            ) : (
                                                                <>
                                                                    Status: Unpaid
                                                                    <br />
                                                                    <small>
                                                                        Payment Required: ${parseFloat(event.fee || 0).toFixed(2)}
                                                                    </small>
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <span className="flip-instruction">
                                                        {ticket?.paymentStatus === 'succeeded' 
                                                            ? 'Click to view ticket' 
                                                            : `Payment of $${parseFloat(event.fee || 0).toFixed(2)} required`}
                                                    </span>
                                                </div>
                                                {ticket?.paymentStatus === 'succeeded' && (
                                                    <div className="event-card-back">
                                                        <div className="qr-code-container">
                                                            <QRCodeSVG 
                                                                value={`EVT-${event.event_id}-ATT-${ticket?.id || 'pending'}`}
                                                                size={150}
                                                            />
                                                        </div>
                                                        <p>Scan for entry</p>
                                                        <span className="flip-instruction">Click to view event details</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p>No registered events found.</p>
                        )}
                    </div>
                </div>
            </div>
            {showUpdateForm && (
                <div className="update-form-overlay">
                    <div className="update-form">
                        <h2>Update Profile</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            updateUser();
                        }}>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Name"
                            />
                            <input
                                type="text"
                                name="pronouns"
                                value={formData.pronouns}
                                onChange={handleChange}
                                placeholder="Pronouns"
                            />
                            <input
                                type="text"
                                name="dietary_restrictions"
                                value={formData.dietary_restrictions}
                                onChange={handleChange}
                                placeholder="Dietary Restrictions"
                            />
                            <button type="submit">Update</button>
                            <button onClick={() => setShowUpdateForm(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
