import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "../../Styles/Navbar.css";
import logo from "../../images/Applogo.webp";

const Navbar = () => {
    const { isLoggedIn, userRole, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        logout(); // Call the `logout` function from `AuthContext`
        setIsMenuOpen(false); // Close the menu if open
        navigate("/", { replace: true }); // Navigate to home page
    };

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={closeMenu}>
                    <img src={logo} alt="AlphaCons Logo" className="logo-image" />
                    AlphaCons
                </Link>
                <button
                    className={`menu-toggle ${isMenuOpen ? "active" : ""}`}
                    onClick={toggleMenu}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
                    <Link to="/" className="nav-link" onClick={closeMenu}>
                        Home
                    </Link>
                    <Link to="/events" className="nav-link" onClick={closeMenu}>
                        Events
                    </Link>
                    {isLoggedIn ? (
                        <>
                            <Link to="/profile" className="nav-link" onClick={closeMenu}>
                                Profile
                            </Link>
                            <button className="nav-button logout" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="nav-button login" onClick={closeMenu}>
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="nav-button register"
                                onClick={closeMenu}
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
