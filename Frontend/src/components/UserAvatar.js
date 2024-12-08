import React from 'react';

const UserAvatar = ({ role, name }) => {
    // Generate a unique seed based on the name
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Generate a DiceBear avatar URL based on role
    const getAvatarUrl = () => {
        const roleLower = role.toLowerCase();
        
        // Define avatar style based on role
        let style = 'avataaars'; // default style
        
        switch(roleLower) {
            case 'admin':
                style = 'pixel-art'; // 8-bit style for admins
                break;
            case 'author':
                style = 'personas'; // professional style for authors
                break;
            case 'regular attendee':
                style = 'avataaars'; // friendly human style for regular attendees
                break;
            default:
                style = 'avataaars'; // default style for any other role
        }
        
        return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=ffffff`;
    };

    // Get role-specific class for styling
    const getRoleClass = () => {
        const roleLower = role.toLowerCase();
        switch(roleLower) {
            case 'admin':
                return 'admin';
            case 'author':
                return 'author';
            case 'regular attendee':
                return 'regular';
            default:
                return 'regular';
        }
    };

    return (
        <div className="profile-avatar-section">
            <div className={`profile-avatar-container ${getRoleClass()}`}>
                <img 
                    src={getAvatarUrl()} 
                    alt={`${name}'s avatar`} 
                    className="profile-avatar-image"
                />
            </div>
            <span className="profile-role-badge">{role}</span>
        </div>
    );
};

export default UserAvatar; 