import React from 'react';
import '../Styles/UserProfile.css';
import UserAvatar from './UserAvatar';


const UserProfile = ({ user }) => {
    return (
        <div className="profile-details">
            <div className="profile-info-item">
                <strong>NAME</strong>
                <p>{user.name}</p>
            </div>
            
            <div className="profile-info-item">
                <strong>EMAIL</strong>
                <p>{user.email}</p>
            </div>

            <div className="profile-info-item">
                <strong>ROLE</strong>
                <p>{user.role}</p>
            </div>

            <div className="profile-info-item">
                <strong>PRONOUNS</strong>
                <p>{user.pronouns || 'Not specified'}</p>
            </div>

            <div className="profile-info-item">
                <strong>DIETARY RESTRICTIONS</strong>
                <p>{user.dietaryRestrictions || 'none'}</p>
            </div>
        </div>
    );
};

export default UserProfile;
