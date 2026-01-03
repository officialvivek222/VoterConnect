import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../services/AuthService";

const Navbar = () => {
    const [currentUser, setCurrentUser] = useState(undefined);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
        }
    }, []);

    const logOut = () => {
        AuthService.logout();
        setCurrentUser(undefined);
        navigate("/login");
        window.location.reload();
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto">
                <div className="flex justify-between items-center">
                    <Link to="/" className="text-white text-xl font-bold">
                        VoterConnect
                    </Link>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={toggleMenu} className="text-gray-300 hover:text-white focus:outline-none">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-4 items-center">
                        {currentUser ? (
                            <>
                                {currentUser.roles.includes("ADMIN") && (
                                    <Link to="/admin" className="text-gray-300 hover:text-white">
                                        Admin
                                    </Link>
                                )}
                                {(currentUser.roles.includes("VOTER") || currentUser.roles.includes("ADMIN")) && (
                                    <Link to="/voter" className="text-gray-300 hover:text-white">
                                        Vote
                                    </Link>
                                )}
                                <span className="text-gray-300 text-sm">Hi, {currentUser.username}</span>
                                <button
                                    onClick={logOut}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition"
                                >
                                    LogOut
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-300 hover:text-white">
                                    Login
                                </Link>
                                <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isOpen && (
                    <div className="md:hidden mt-4 flex flex-col space-y-2 pb-4 border-t border-gray-700 pt-4">
                        {currentUser ? (
                            <>
                                <span className="text-gray-400 text-sm px-2">Signed in as {currentUser.username}</span>
                                {currentUser.roles.includes("ADMIN") && (
                                    <Link to="/admin" className="text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-gray-700" onClick={() => setIsOpen(false)}>
                                        Admin Dashboard
                                    </Link>
                                )}
                                {(currentUser.roles.includes("VOTER") || currentUser.roles.includes("ADMIN")) && (
                                    <Link to="/voter" className="text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-gray-700" onClick={() => setIsOpen(false)}>
                                        Voter Dashboard
                                    </Link>
                                )}
                                <button
                                    onClick={logOut}
                                    className="text-left text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-gray-700 font-semibold"
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-gray-700" onClick={() => setIsOpen(false)}>
                                    Login
                                </Link>
                                <Link to="/signup" className="text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-gray-700" onClick={() => setIsOpen(false)}>
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
