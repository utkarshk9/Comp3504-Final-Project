import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import API from '../services/api';
import Spinner from '../components/common/Spinner';
import '../Styles/PaymentSuccess.css';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('');
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkPaymentStatus = async () => {
            setIsLoading(true);
            const clientSecret = new URLSearchParams(window.location.search).get('payment_intent_client_secret');

            if (!clientSecret) {
                setStatus('error');
                setMessage('Payment verification failed: Missing payment information.');
                setIsLoading(false);
                return;
            }

            try {
                const { data } = await API.post('/payments/confirm', { clientSecret });

                if (data.success) {
                    setTickets(data.tickets || []);
                    setStatus('success');
                    setMessage('Payment successful! Your tickets have been sent to your email.');
                } else {
                    throw new Error(data.error || 'Payment verification failed.');
                }
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.error || 'An error occurred during payment processing.');
            } finally {
                setIsLoading(false);
            }
        };

        checkPaymentStatus();
    }, []);

    return (
        <div className="payment-success-page">
            <div className="payment-success-container">
                {isLoading ? (
                    <div className="processing">
                        <Spinner />
                        <h2>Processing Payment...</h2>
                    </div>
                ) : (
                    <div className="result">
                        <h1>{status === 'success' ? 'Payment Successful!' : 'Payment Failed'}</h1>
                        <p>{message}</p>
                        {status === 'success' && tickets.length > 0 && (
                            <div className="tickets">
                                <h2>Your Tickets</h2>
                                {tickets.map((ticket, index) => (
                                    <div key={index} className="ticket">
                                        <h3>{ticket.eventName}</h3>
                                        <p>Date: {new Date(ticket.eventDate).toLocaleDateString()}</p>
                                        <div className="qr-code">
                                            <QRCodeSVG value={ticket.ticketId || 'Invalid Ticket'} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button 
                            onClick={() => navigate('/profile')}
                            className="back-button"
                        >
                            Back to Profile
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
