
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Homepage from './pages/Homepage';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import ConsultantProfile from './pages/ConsultantProfile';
import ConsultantSearch from './pages/ConsultantSearch';
import ConsultantDetails from './pages/ConsultantDetails';
import Booking from './pages/Booking';
import ConsultationDashboard from './pages/ConsultationDashboard';
import HealthRecords from './pages/HealthRecords';
import Messaging from './pages/Messaging';
import Payment from './pages/Payment';
import Review from './pages/Review';
import AdminDashboard from './pages/AdminDashboard';
import ConsultantDashboardPage from './pages/ConsultantDashboardPage';
import './App.css';
import './index.css'; //Importing index.css to solve global styling issues

function App() {
  // Use state to manage login status, user role, and consultant status
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('guest');
  const [isConsultant, setIsConsultant] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

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

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} userRole={userRole} isConsultant={isConsultant} />
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/termsofservice" element={<TermsOfService />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} setIsConsultant={setIsConsultant} setIsApproved={setIsApproved} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/userprofile" element={<UserProfile />} />
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

          {isLoggedIn && userRole === 'consultant' && isApproved === true && (
            <>
              <Route path="/consultantdashboard" element={<ConsultantDashboardPage />} />
              <Route path="/consultantprofile" element={<ConsultantProfile />} />
            </>
          )}
          <Route path="/consultantprofile" element={<ConsultantProfile />} />
            <Route path="/consultantdashboard" element={<ConsultantDashboardPage />} />

          <Route path="/admindashboard" element={<AdminDashboard />} />
          {isLoggedIn && userRole === 'admin' && (
            <Route path="/admindashboard" element={<AdminDashboard />} />
          )}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
      {isLoggedIn && userRole === 'admin' && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/admindashboard" style={{
            backgroundColor: '#4CAF50',
            border: 'none',
            color: 'white',
            padding: '15px 32px',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '16px',
            margin: '4px 2px',
            cursor: 'pointer',
            borderRadius: '5px'
          }}>Admin Dashboard</Link>
        </div>
      )}
    </Router>
  );
}

export default App;


