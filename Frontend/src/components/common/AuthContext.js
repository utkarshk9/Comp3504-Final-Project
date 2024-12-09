import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("userId"));
    const [userRole, setUserRole] = useState(localStorage.getItem("role") || "");
    const [userId, setUserId] = useState(localStorage.getItem("userId") || null);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        const role = localStorage.getItem("role");
        setIsLoggedIn(!!userId);
        setUserRole(role || "");
        setUserId(userId);
    }, []);

    const logout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        setUserRole("");
        setUserId(null);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, userRole, userId, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
