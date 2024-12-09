import React from 'react';

const Spinner = () => {
    const spinnerStyle = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000
    };

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(5px)',
        zIndex: 999
    };

    return (
        <>
            <div style={overlayStyle} />
            <div style={spinnerStyle}>
                <svg width="50" height="50" viewBox="0 0 50 50">
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="#0071e3"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="31.415, 31.415"
                        transform="rotate(0, 25, 25)"
                    >
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0, 25, 25"
                            to="360, 25, 25"
                            dur="1s"
                            repeatCount="indefinite"
                        />
                    </circle>
                </svg>
            </div>
        </>
    );
};

export default Spinner; 