import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Homepage from './pages/Homepage';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register.jsx'; // Corrected import path and extension
import UserProfile from './pages/UserProfile.jsx'; // Corrected import path and extension
import ConsultantProfile from './pages/ConsultantProfile';
import ConsultantSearch from './pages/ConsultantSearch';
import ConsultantDetails from './pages/ConsultantDetails';
import Booking from './pages/Booking';
import ConsultationDashboard from './pages/ConsultationDashboard';
import HealthRecords from './pages/HealthRecords';
import Messaging from './pages/Messaging';
import Payment from './pages/Payment';
import Review from './pages/Review';
import AdminDashboard from './pages/AdminDashboard.jsx'; // Corrected import path and extension
import ConsultantDashboardPage from './pages/ConsultantDashboardPage.jsx'; // Corrected import path and extension
import './App.css';
import './index.css'; //Importing index.css to solve global styling issues

function App() {
    // Use state to manage login status, user role, and consultant status
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState('guest');
    const [isConsultant, setIsConsultant] = useState(() => { // Initialize with boolean
        const storedValue = localStorage.getItem('isConsultant');
        return storedValue === 'true'; // Convert string to boolean
    });
    const [isApproved, setIsApproved] = useState(false);
    const [profilePicture, setProfilePicture] = useState(''); // State to store profile picture

    // Function to update state from localStorage
    const updateStateFromLocalStorage = useCallback(() => {
        setIsLoggedIn(localStorage.getItem('token') !== null);
        setUserRole(localStorage.getItem('userRole') || 'guest');
        setIsConsultant(localStorage.getItem('isConsultant') === 'true');
        setIsApproved(localStorage.getItem('isApproved') === 'true');
    }, []);

    useEffect(() => {
        // Call the function on component mount
        updateStateFromLocalStorage();

        // Set up a listener for localStorage changes
        window.addEventListener('storage', updateStateFromLocalStorage);

        // Clean up the listener when the component unmounts
        return () => {
            window.removeEventListener('storage', updateStateFromLocalStorage);
        };
    }, [updateStateFromLocalStorage]);

    // Callback function to update login state and user info
    const handleLoginSuccess = useCallback((role, isConsultant, isApproved, profilePicture) => {
        setIsLoggedIn(true);
        setUserRole(role);
        setIsConsultant(isConsultant); // Ensure boolean value
        setIsApproved(Boolean(isApproved));   // Ensure boolean value
        setProfilePicture(profilePicture);
    }, []);

    // Callback function to handle logout
    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('isConsultant');
        localStorage.removeItem('isApproved');
        setIsLoggedIn(false);
        setUserRole('guest');
        setIsConsultant(false);
        setIsApproved(false);
        setProfilePicture(''); // Clear profile picture on logout
    }, []);

    return (
        <Router>
            <Navbar isLoggedIn={isLoggedIn} userRole={userRole} isConsultant={isConsultant} handleLogout={handleLogout} profilePicture={profilePicture} />
            <div className="min-h-screen">
                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/aboutus" element={<AboutUs />} />
                    <Route path="/contactus" element={<ContactUs />} />
                    <Route path="/privacypolicy" element={<PrivacyPolicy />} />
                    <Route path="/termsofservice" element={<TermsOfService />} />
                    <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} setIsConsultant={setIsConsultant} setIsApproved={setIsApproved} onLoginSuccess={handleLoginSuccess} setProfilePicture={setProfilePicture} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/userprofile" element={<UserProfile setProfilePicture={setProfilePicture} />} />

                    {/* User routes, require login and user role */}
                    {isLoggedIn && userRole === 'user' && (
                        <>
                            <Route path="/consultantsearch" element={<ConsultantSearch />} />
                            <Route path="/consultantdetails/:id" element={<ConsultantDetails />} />
                            <Route path="/booking/:id" element={<Booking />} />
                            <Route path="/consultationdashboard" element={<ConsultationDashboard />} />
                            <Route path="/healthrecords" element={<HealthRecords />} />
                            <Route path="/messaging" element={<Messaging />} />
                            <Route path="/payment" element={<Payment />} />
                            <Route path="/review/:id" element={<Review />} />
                        </>
                    )}

                    {/* Consultant profile and dashboard only accessible if logged in as consultant, and approved*/}
                    {isLoggedIn && userRole === 'consultant' && isApproved ? (
                        <>
                            <Route path="/consultantprofile" element={<ConsultantProfile />} />
                            <Route path="/consultantdashboard" element={<ConsultantDashboardPage />} />
                        </>
                    ) : (isLoggedIn && userRole === 'consultant') ? (
                        <Route path="/consultantprofile" element={<Navigate to="/" />} />
                    ) : null}

                    {/* Admin dashboard route, require login and admin role */}
                    {isLoggedIn && userRole === 'admin' ? (
                        <Route path="/admindashboard" element={<AdminDashboard />} />
                    ) : (
                        // Redirect to login page if not an admin or not logged in
                        <Route path="/admindashboard" element={<Navigate to="/login" />} />
                    )}

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
            <Footer />
        </Router>
    );
}

export default App;