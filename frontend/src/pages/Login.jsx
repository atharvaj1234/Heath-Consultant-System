import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, ShieldCheck } from 'lucide-react';
import { loginUser } from '../utils/api';

const Login = ({ setIsLoggedIn, setUserRole, setIsConsultant, setIsApproved, onLoginSuccess, setProfilePicture }) => {
    const [activeTab, setActiveTab] = useState('user');
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const validateEmail = (email) => {
        // Basic email validation regex
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        try {
            const data = await loginUser(email, password);

            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('isConsultant', data.isConsultant);
            localStorage.setItem('isApproved', String(data.isApproved));
            localStorage.setItem('userId', String(data.userId));

            setIsLoggedIn(true);
            setUserRole(data.role);
            setIsConsultant(data.isConsultant === 1 || data.isConsultant === true);
            setIsApproved(Boolean(data.isApproved));
            setProfilePicture(data.profilePicture);

            onLoginSuccess(data.role, data.isConsultant, data.isApproved);

            if (data.role === 'consultant') {
                navigate('/consultantdashboard');
            } else if (data.role === 'admin') {
                navigate('/admindashboard');
            } else {
                navigate('/consultationdashboard');
            }
        } catch (err) {
            setError('Invalid email or password. Please try again.');
            console.error('Login failed:', err);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setEmail('');
        setPassword('');
        setError('');
    };

    const toggleAdminLogin = () => {
        setShowAdminLogin(!showAdminLogin);
        setEmail('');
        setPassword('');
        setError('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-200 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-lg overflow-hidden">
                <div className={`py-6 px-8 text-white ${showAdminLogin ? 'bg-purple-600' : 'bg-blue-600'}`}>
                    <h2 className="mt-6 text-center text-3xl font-extrabold">
                        {showAdminLogin ? 'Admin Login' : 'Welcome back!'}
                    </h2>
                    <p className="mt-2 text-center text-md">
                        {showAdminLogin ? 'Enter your credentials' : 'Login to access your account.'}
                    </p>
                </div>

                <div className="p-8">
                    {/* Tabs (Conditional Rendering) */}
                    {!showAdminLogin && (
                        <div className="flex border-b border-gray-200 mb-6">
                            <button
                                className={`py-2 px-4 font-semibold focus:outline-none ${activeTab === 'user'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                onClick={() => handleTabChange('user')}
                            >
                                <User className="inline-block w-4 h-4 mr-1" />
                                User
                            </button>
                            <button
                                className={`py-2 px-4 font-semibold focus:outline-none ${activeTab === 'consultant'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                onClick={() => handleTabChange('consultant')}
                            >
                                <Briefcase className="inline-block w-4 h-4 mr-1" />
                                Consultant
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="********"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${showAdminLogin ? 'bg-purple-600 focus:ring-purple-500 hover:bg-purple-700 ' : 'bg-blue-600 focus:ring-blue-500 hover:bg-blue-700 '}`}
                            >
                                Sign in
                            </button>
                        </div>
                    </form>

                    {/* Admin Login Toggle */}
                    {!showAdminLogin ? (
                        <div className="text-center mt-4">
                            <button
                                onClick={toggleAdminLogin}
                                className="text-sm text-blue-500 hover:text-blue-700 focus:outline-none"
                            >
                                Admin Login
                            </button>
                        </div>
                    ) : (
                        <div className="text-center mt-4">
                            <button
                                onClick={toggleAdminLogin}
                                className="text-sm text-blue-500 hover:text-blue-700 focus:outline-none"
                            >
                                Back to User/Consultant Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;