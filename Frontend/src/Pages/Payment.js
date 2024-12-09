import React, { useState, useEffect } from "react";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate, useLocation } from 'react-router-dom';
import API from "../services/api";
import Spinner from "../components/common/Spinner";
import "../Styles/Payment.css";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const PaymentForm = ({ amount, userId, events }) => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [unpaidEvents, setUnpaidEvents] = useState([]);

    useEffect(() => {
        const fetchPaymentHistory = async () => {
            try {
                const response = await API.get(`/payment/history/${userId}`);
                console.log('Raw payment history:', response.data);
                
                // Get paid event IDs
                const paidEventIds = [];
                if (response.data.payments) {
                    Object.values(response.data.payments).forEach(payment => {
                        if (payment.status === 'succeeded') {
                            paidEventIds.push(payment.event_id);
                        }
                    });
                }
                
                console.log('Paid event IDs:', paidEventIds);
                
                // Filter out paid events
                const unpaid = events.filter(event => 
                    !paidEventIds.includes(event.event_id)
                );
                
                console.log('Unpaid events:', unpaid);
                setUnpaidEvents(unpaid);
            } catch (error) {
                console.error('Error fetching payment history:', error);
                setUnpaidEvents([]);
            }
        };

        if (events?.length > 0) {
            fetchPaymentHistory();
        }
    }, [userId, events]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/payment-success`,
            },
        });

        if (error) {
            setPaymentError(error.message);
            setIsProcessing(false);
        }
    };

    return (
        <div className="payment-form-container">
            <div className="payment-summary">
                <h2>Payment Summary</h2>
                <div className="events-list">
                    {unpaidEvents.map(event => (
                        <div key={event.event_id} className="event-item">
                            <span className="event-name">{event.name}</span>
                            <span className="event-fee">${parseFloat(event.fee).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="total-amount">
                        <strong>Total Amount Due:</strong>
                        <strong>${amount.toFixed(2)}</strong>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="payment-form">
                <PaymentElement 
                    options={{
                        layout: "tabs",
                        defaultValues: {
                            billingDetails: {
                                name: 'John Doe',
                                email: 'john@example.com',
                                address: {
                                    country: 'CA',
                                }
                            }
                        }
                    }}
                />
                {paymentError && <div className="payment-error">{paymentError}</div>}
                <button 
                    className="payment-button"
                    disabled={isProcessing || !stripe || !elements} 
                    type="submit"
                >
                    {isProcessing ? <Spinner size="small" /> : `Pay CAD $${amount.toFixed(2)}`}
                </button>
            </form>
        </div>
    );
};

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [clientSecret, setClientSecret] = useState("");
    const [paymentData, setPaymentData] = useState(null);

    useEffect(() => {
        if (!location.state?.amount) {
            navigate('/profile');
            return;
        }

        const initializePayment = async () => {
            try {
                const { data } = await API.post("/payment/create-intent", {
                    amount: location.state.amount,
                    userId: location.state.userId
                });
                setClientSecret(data.clientSecret);
                setPaymentData({
                    amount: location.state.amount,
                    userId: location.state.userId,
                    events: Array.from(
                        new Set(location.state.events.map(event => event.event_id))
                    ).map(id => location.state.events.find(event => event.event_id === id))
                });
            } catch (err) {
                console.error("Error initializing payment:", err);
                navigate('/profile');
            }
        };

        initializePayment();
    }, [location.state, navigate]);

    if (!clientSecret || !paymentData) {
        return (
            <div className="payment-loading">
                <Spinner size="large" />
                <p>Initializing payment...</p>
            </div>
        );
    }

    const stripeOptions = {
        clientSecret,
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#0570de',
                colorBackground: '#ffffff',
                colorText: '#30313d',
                colorDanger: '#df1b41',
                fontFamily: 'Ideal Sans, system-ui, sans-serif',
                spacingUnit: '2px',
                borderRadius: '4px',
            },
        },
    };

    return (
        <div className="payment-page">
            <div className="payment-container">
                <h1>Complete Your Payment</h1>
                <Elements 
                    stripe={stripePromise} 
                    options={stripeOptions}
                >
                    <PaymentForm 
                        amount={paymentData.amount} 
                        userId={paymentData.userId}
                        events={paymentData.events}
                    />
                </Elements>
            </div>
        </div>
    );
};

export default PaymentPage; 