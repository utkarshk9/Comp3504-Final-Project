import React, { useEffect, useState } from 'react';
import API from '../services/api'; // Assuming your API service is set up

const UserProfile = ({ userId }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await API.get(`/users/${userId}`);
                setUserData(response.data.user);
                setLoading(false);
            } catch (err) {
                setError('Error fetching user data.');
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="user-profile">
            <h1>{userData.name}'s Profile</h1>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Pronouns:</strong> {userData.pronouns || 'Not provided'}</p>
            <p><strong>Dietary Restrictions:</strong> {userData.dietary_restrictions || 'None'}</p>
            <p><strong>Role:</strong> {userData.role}</p>
            <p><strong>Account Created:</strong> {new Date(userData.created_at).toLocaleDateString()}</p>
        </div>
    );
};

export default UserProfile;
