import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import '../Styles/AdminDashboard.css';
import UserAvatar from '../components/UserAvatar';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [activeSection, setActiveSection] = useState('dashboard');
    const [editingEvent, setEditingEvent] = useState(null);
    const [registrationFees, setRegistrationFees] = useState({
        author: { base_fee: 0, fee_id: null, event_fee: 0 },
        regular: { base_fee: 0, fee_id: null, event_fee: 0 }
    });
    const [userName, setUserName] = useState('');
    const [editingFees, setEditingFees] = useState({
        author: 0,
        regular: 0,
        author_event: 0,
        regular_event: 0
    });
    

    const fetchData = async () => {
        try {
            setLoading(true);
            const [feesResponse, eventsResponse] = await Promise.all([
                API.get('/fees'),
                API.get('/events')
            ]);

            // Debug logs
            console.log('Fees Response:', feesResponse.data);
            console.log('Events Response:', eventsResponse.data);

            // Handle fees - separate author and regular fees
            if (feesResponse.data?.fees) {
                const feesArray = feesResponse.data.fees;
                console.log('Fees array:', feesArray);
                
                // Find author and regular fees from the array
                const authorFee = feesArray.find(fee => fee.role === 'Author') || {};
                const regularFee = feesArray.find(fee => fee.role === 'Regular Attendee') || {};
                
                console.log('Found author fee:', authorFee);
                console.log('Found regular fee:', regularFee);

                setRegistrationFees({
                    author: {
                        base_fee: Number(authorFee.base_fee) || 0,
                        fee_id: authorFee.fee_id,
                        event_fee: Number(authorFee.event_fee) || 0
                    },
                    regular: {
                        base_fee: Number(regularFee.base_fee) || 0,
                        fee_id: regularFee.fee_id,
                        event_fee: Number(regularFee.event_fee) || 0
                    }
                });
            }

            // Handle events - using the exact structure from the API
            if (eventsResponse.data?.events) {
                const mappedEvents = eventsResponse.data.events.map(event => ({
                    event_id: event.event_id,
                    name: event.name,
                    description: event.description,
                    Date: event.Date,
                    event_type: event.event_type,
                    optional_fee: event.optional_fee || 0  // Use optional_fee instead of fee
                }));
                setEvents(mappedEvents);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const userId = localStorage.getItem('userId');
                if (userId) {
                    const response = await API.get(`/users/${userId}`);
                    if (response.data && response.data.user) {
                        setUserName(response.data.user.name || 'Admin');
                    }
                }
            } catch (err) {
                console.error('Error fetching user name:', err);
                setUserName('Admin');
            }
        };

        fetchUserName();
    }, []);

    const handleFeeUpdate = async (role, newFee) => {
        const roleMapping = {
            'author': 'Author',
            'regular': 'Regular Attendee'
        };

        const feeData = {
            fee_id: registrationFees[role].fee_id,
            role: roleMapping[role],
            base_fee: Number(newFee)
        };

        try {
            return await API.put(`/fees/${feeData.fee_id}`, feeData);
        } catch (err) {
            throw new Error(`Failed to update ${role} fee: ${err.message}`);
        }
    };

    const handleFeeSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            setError(null);

            const authorFee = Number(editingFees.author);
            const regularFee = Number(editingFees.regular);

            if (isNaN(authorFee) || isNaN(regularFee) || authorFee < 0 || regularFee < 0) {
                throw new Error('Invalid fee amounts');
            }

            await handleFeeUpdate('author', authorFee);
            await handleFeeUpdate('regular', regularFee);
            
            await fetchData();
            setSuccessMessage('Registration fees updated successfully!');
            setActiveSection('dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitEvent = async (e) => {
        e.preventDefault();
        if (!editingEvent) return;

        try {
            const eventData = {
                name: editingEvent.name?.trim(),
                description: editingEvent.description?.trim(),
                event_type: editingEvent.event_type,
                fee: editingEvent.event_type === 'optional' ? Number(editingEvent.optional_fee) : 0,
                Date: editingEvent.Date
            };

            if (editingEvent.event_id) {
                await API.put(`/events/${editingEvent.event_id}`, eventData);
            } else {
                await API.post('/events', eventData);
            }
            
            setSuccessMessage('Event saved successfully!');
            setActiveSection('dashboard');
            setEditingEvent(null);
            await fetchData();
        } catch (err) {
            setError(`Failed to save event: ${err.message}`);
        }
    };

    const handleEditEvent = (event) => {
        // Format the date for datetime-local input if it exists
        let formattedDate = '';
        if (event.Date) {
            // Create date object and adjust for local timezone
            const eventDate = new Date(event.Date);
            
            // Format date to YYYY-MM-DDThh:mm
            formattedDate = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16);
        }

        setEditingEvent({
            ...event,
            Date: formattedDate
        });
        setActiveSection('editForm');
    };

    const handleDeleteEvent = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await API.delete(`/events/${eventId}`);
                setSuccessMessage('Event deleted successfully!');
                await fetchData();
            } catch (err) {
                setError(`Failed to delete event: ${err.message}`);
            }
        }
    };

    const handleEditCoreFees = () => {
        setEditingFees({
            author: registrationFees.author.base_fee,
            regular: registrationFees.regular.base_fee
        });
        setActiveSection('editCoreFees');
    };

    const renderEventCard = (event) => (
        <div key={event.event_id} className="event-card-glass-card">
            <h3>{event.name || 'Unnamed Event'}</h3>
            <p>{event.description || 'No description available'}</p>
            {event.event_type === 'optional' && (
                <p>
                    <strong>Fee:</strong> ${Number(event.optional_fee || 0).toFixed(2)}
                </p>
            )}
            <p><strong>Date:</strong> {event.Date ? new Date(event.Date).toLocaleString() : 'TBA'}</p>
            <div className="event-actions">
                <button onClick={() => handleEditEvent(event)}>Edit</button>
                <button onClick={() => handleDeleteEvent(event.event_id)}>Delete</button>
            </div>
        </div>
    );

    const renderFeeForm = () => (
        <div className="edit-form-container-glass-card">
            <form onSubmit={handleFeeSubmit} className="fee-form">
                <h2>Edit Core Registration Fees</h2>
                <div className="fee-note">
                    <p>Note: These registration fees apply to all core events.</p>
                </div>

                {['author', 'regular'].map(role => (
                    <div key={role} className="fee-input-group">
                        <label>{role === 'author' ? 'Author' : 'Regular Attendee'} Registration Fee ($)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editingFees[role]}
                            onChange={(e) => setEditingFees(prev => ({
                                ...prev,
                                [role]: e.target.value
                            }))}
                            disabled={isSubmitting}
                            required
                        />
                    </div>
                ))}

                <div className="form-actions">
                    <button type="submit" className="primary-button" disabled={isSubmitting}>
                        Update Fees
                    </button>
                    <button type="button" onClick={() => setActiveSection('dashboard')} disabled={isSubmitting}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );

    const renderEditForm = () => (
        <div className="edit-form-container glass-card">
            <form onSubmit={handleSubmitEvent} className="event-form">
                <h2>{editingEvent?.event_id ? 'Edit Event' : 'Add New Event'}</h2>
                
                <div className="event-type-note">
                    <p>Note: Core events will use the standard registration fees. Optional events can have custom fees.</p>
                </div>

                <div className="form-group">
                    <label>Event Name</label>
                    <input
                        type="text"
                        value={editingEvent?.name || ''}
                        onChange={(e) => setEditingEvent(prev => ({
                            ...prev,
                            name: e.target.value
                        }))}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        value={editingEvent?.description || ''}
                        onChange={(e) => setEditingEvent(prev => ({
                            ...prev,
                            description: e.target.value
                        }))}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Event Type</label>
                    <select
                        value={editingEvent?.event_type || 'core'}
                        onChange={(e) => setEditingEvent(prev => ({
                            ...prev,
                            event_type: e.target.value,
                            optional_fee: e.target.value === 'core' ? null : prev.optional_fee
                        }))}
                        required
                    >
                        <option value="core">Core Event</option>
                        <option value="optional">Optional Event</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Date</label>
                    <input
                        type="datetime-local"
                        value={editingEvent?.Date || ''}
                        onChange={(e) => setEditingEvent(prev => ({
                            ...prev,
                            Date: e.target.value
                        }))}
                        required
                    />
                </div>

                {editingEvent?.event_type === 'optional' && (
                    <div className="form-group">
                        <label>Event Fee ($)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editingEvent?.optional_fee || ''}
                            onChange={(e) => setEditingEvent(prev => ({
                                ...prev,
                                optional_fee: e.target.value
                            }))}
                            required
                        />
                        <small className="fee-hint">
                            Note: Optional events can have custom fees.
                        </small>
                    </div>
                )}

                <div className="form-actions">
                    <button type="submit" className="primary-button" disabled={isSubmitting}>
                        Save Event
                    </button>
                    <button type="button" onClick={() => setActiveSection('dashboard')} disabled={isSubmitting}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="admin-dashboard">
            <div className="user-info-glass-card">
                <UserAvatar role="Admin" name= {userName} />
                <div className="user-details">
                    <h1>Admin Dashboard</h1>
                    <div className="welcome-message">
                        Welcome back, <span className="user-name">{userName}</span>
                    </div>
                    <div className="admin-controls">
                        <button onClick={() => navigate('/profile')}>Profile</button>
                        <button onClick={() => handleEditEvent({})}>Add Event</button>
                        
                    </div>
                </div>
            </div>

            {error && <div className="error-message glass-card">{error}</div>}
            {successMessage && <div className="success-message glass-card">{successMessage}</div>}

            {activeSection === 'editCoreFees' && renderFeeForm()}
            {activeSection === 'editForm' && renderEditForm()}
            
            {activeSection === 'dashboard' && (
                <>
                    <div className="events-section-glass-card">
                        <h2>Core Conference Events</h2>
                        <div className="fee-summary">
                            <div className="fee-summary-content">
                                <p>Current Registration Fees</p>
                                <ul>
                                    <li>Authors: <span className="fee-amount">${registrationFees.author.base_fee}</span></li>
                                    <li>Regular Attendees: <span className="fee-amount">${registrationFees.regular.base_fee}</span></li>
                                </ul>
                            </div>
                            <button onClick={() => handleEditCoreFees()}>Edit Fees</button>
                        </div>
                        <div className="events-grid">
                            {events.filter(e => e.event_type === 'core').map(renderEventCard)}
                        </div>
                        <h2>Optional  Events</h2>
                        <div className="events-grid">
                            {events.filter(e => e.event_type === 'optional').map(renderEventCard)}
                        </div>
                    </div>

                
                </>
            )}
        </div>
    );
};

export default AdminDashboard; 