import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/common/AuthContext";
import API from "../services/api";
import UserAvatar from "../components/UserAvatar";
import Spinner from "../components/common/Spinner";
import "../Styles/User.css";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe (put this outside the component)
const stripePromise = loadStripe('your_publishable_key');

// Add this new component for the payment form
const PaymentForm = ({ amount, userId }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsProcessing(true);
        setPaymentError(null);

        try {
            // Create payment intent
            const { data: { clientSecret } } = await API.post('/payments/create-intent', {
                amount: amount * 100, // Convert to cents
                userId
            });

            // Confirm payment
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                }
            });

            if (error) {
                setPaymentError(error.message);
            } else if (paymentIntent.status === 'succeeded') {
                // Record payment in your database
                await API.post('/payments/record', {
                    userId,
                    amount,
                    transaction_id: paymentIntent.id,
                    payment_method: 'card',
                    status: 'succeeded'
                });
                
                // Refresh the page or update UI
                window.location.reload();
            }
        } catch (err) {
            setPaymentError('Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <CardElement className="card-element" />
            {paymentError && <div className="payment-error">{paymentError}</div>}
            <button 
                type="submit" 
                disabled={!stripe || isProcessing}
                className="payment-button"
            >
                {isProcessing ? <Spinner size="small" /> : `Pay $${amount.toFixed(2)}`}
            </button>
        </form>
    );
};

const Profile = () => {
    const { logout } = useAuth(); // Use logout from AuthContext
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

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


    useEffect(() => {
        const fetchProfileData = async () => {
            const userId = localStorage.getItem("userId");
            if (!userId) {
                navigate("/login", { replace: true });
                return;
            }

            try {
                const [userResponse, eventsResponse] = await Promise.all([
                    API.get(`/users/${userId}`),
                    API.get(`/attendee_events/${userId}`),
                ]);

                setUser(userResponse?.data?.user || null);
                setRegisteredEvents(eventsResponse?.data?.events || []);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load profile or events.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [navigate]);

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
        <div className="user-container">
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
                        {totalFee > 0 && (
                            <div className="payment-section">
                                <h3>Payment</h3>
                                <Elements stripe={stripePromise}>
                                    <PaymentForm 
                                        amount={totalFee} 
                                        userId={user.id}
                                    />
                                </Elements>
                            </div>
                        )}
                    </div>
                    <div className="registered-events">
                        <h2>Registered Events</h2>
                        {registeredEvents.length > 0 ? (
                            <div className="events-grid">
                                {registeredEvents.map((event) => (
                                    <div key={event.event_id} className="event-card">
                                        <h3>{event.name}</h3>
                                        <p>{event.description}</p>
                                        <div className="event-details">
                                            <p>Date: {new Date(event.date).toLocaleDateString()}</p>
                                            <p>Fee: ${parseFloat(event.fee || 0).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No registered events found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
