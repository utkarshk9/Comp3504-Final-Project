import React, { useState, useEffect } from 'react';
import Spinner from '../common/Spinner';

const PageTransition = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    const pageStyle = {
        opacity: isLoading ? 0 : 1,
        transition: 'opacity 0.3s ease-in-out',
    };

    return (
        <>
            {isLoading && <Spinner />}
            <div style={pageStyle}>
                {children}
            </div>
        </>
    );
};

export default PageTransition; 