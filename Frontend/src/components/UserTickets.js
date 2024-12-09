import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import API from '../services/api';
import '../Styles/UserTickets.css';

const UserTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTickets = async () => {
            // Get userId from localStorage or wherever you store it after login
            const userId = localStorage.getItem('userId');

            if (!userId) {
                setError('Please log in to view your tickets');
                setLoading(false);
                return;
            }

            try {
                const { data } = await API.get(`/user/tickets/${userId}`);
                setTickets(data.tickets);
            } catch (error) {
                console.error('Error fetching tickets:', error);
                setError('Failed to load tickets');
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    if (loading) return <div>Loading tickets...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="user-tickets">
            <h2>Your Tickets</h2>
            {tickets.length === 0 ? (
                <p>No tickets found.</p>
            ) : (
                <div className="tickets-grid">
                    {tickets.map((ticket) => (
                        <div key={`${ticket.id}-${ticket.eventName}`} className="ticket-card">
                            <h3>{ticket.eventName}</h3>
                            <p className="event-date">
                                {new Date(ticket.eventDate).toLocaleDateString()}
                            </p>
                            <p className="event-type">{ticket.eventType}</p>
                            <div className="qr-code">
                                <QRCodeSVG value={`EVT-${ticket.attendee_event_id}-${ticket.eventName}`} />
                            </div>
                            <div className="ticket-details">
                                <p>Status: <span className={`status ${ticket.paymentStatus}`}>
                                    {ticket.paymentStatus}
                                </span></p>
                                {ticket.paymentDate && (
                                    <p>Paid on: {new Date(ticket.paymentDate).toLocaleDateString()}</p>
                                )}
                                {ticket.paidAmount > 0 && (
                                    <p>Amount: ${ticket.paidAmount.toFixed(2)}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserTickets; 