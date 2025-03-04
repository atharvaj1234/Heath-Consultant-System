import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Phone, User, LogOut, Calendar, File, User as Tool, CreditCard } from 'lucide-react';

const Navbar = ({ isLoggedIn, userRole, isConsultant, handleLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    //const isLoggedIn = localStorage.getItem('token') !== null;

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="bg-gradient-to-r from-blue-200 to-purple-200 shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0">
                            <img
                                className="h-8 w-auto"
                                src="https://placehold.co/40x40"
                                alt="Health Consultant Logo"
                            />
                        </Link>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link to="/" className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                    <Home className="inline-block h-5 w-5 mr-1" />
                                    Home
                                </Link>
                                <Link to="/aboutus" className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                    About Us
                                </Link>
                                <Link to="/contactus" className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                    <Phone className="inline-block h-5 w-5 mr-1" />
                                    Contact Us
                                </Link>
                                {isLoggedIn && userRole === 'user' && (
                                    <Link to="/consultantsearch" className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                        Find a Consultant
                                    </Link>
                                )}
                                {isLoggedIn && (
                                    <>
                                        {isLoggedIn && userRole === 'user' && (<>
                                        <Link to="/consultationdashboard" className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                            <Calendar className="inline-block h-5 w-5 mr-1" />
                                            My Appointments
                                        </Link>
                                            <Link to="/healthrecords" className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                                <File className="inline-block h-5 w-5 mr-1" />
                                                Health Records
                                            </Link>
                                            <Link to="/userpayments" className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                              UserPayments
                                            </Link>
                                            </>
                                        )}
                                        {isLoggedIn && userRole === 'consultant' && (<>
                                            <Link to="/consultantprofile" className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                                <Tool className="inline-block h-5 w-5 mr-1" />
                                                My Profile
                                            </Link>
                                            <Link to="/consultantdashboard" className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                                Consultant Dashboard
                                            </Link><>
                                               <Link to="/consultantearnings" className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                                  ConsultantEarnings
                                                 </Link>
                                            </>
                                            </>
                                        )}
                                        {isLoggedIn && userRole === 'admin' && ( // Added Admin Dashboard Link
                                            <Link to="/admindashboard" className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                                Admin Dashboard
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                            {isLoggedIn ? (
                                <div className="flex items-center space-x-4">
                                    <Link to="/userprofile" className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                        <User className="inline-block h-5 w-5 mr-1" />
                                        Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        <LogOut className="inline-block h-5 w-5 mr-1" />
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link to="/login" className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                        Login
                                    </Link>
                                    <Link to="/register" className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={toggleMenu}
                            type="button"
                            className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg
                                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <svg
                                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className={`${isMenuOpen ? 'block' : 'none'} md:hidden`} id="mobile-menu">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <Link to="/" className="text-gray-600 hover:bg-blue-400 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                        <Home className="inline-block h-5 w-5 mr-1" />
                        Home
                    </Link>
                    <Link to="/aboutus" className="text-gray-600 hover:bg-blue-400 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                        About Us
                    </Link>
                    <Link to="/contactus" className="text-gray-600 hover:bg-blue-400 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                        <Phone className="inline-block h-5 w-5 mr-1" />
                        Contact Us
                    </Link>
                    {isLoggedIn && userRole === 'user' && (
                        <Link to="/consultantsearch" className="text-gray-600 hover:bg-blue-400 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                            Find a Consultant
                        </Link>
                    )}
                    {isLoggedIn && (
                        <>
                            <Link to="/userprofile" className="text-gray-600 hover:bg-blue-400 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                                <User className="inline-block h-5 w-5 mr-1" />
                                Profile
                            </Link>
                            <Link to="/consultationdashboard" className="text-gray-600 hover:bg-blue-400 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                                <Calendar className="inline-block h-5 w-5 mr-1" />
                                My Appointments
                            </Link>
                            {isLoggedIn && userRole === 'user' && (
                                <Link to="/healthrecords" className="text-gray-600 hover:bg-blue-400 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                                    <File className="inline-block h-5 w-5 mr-1" />
                                    Health Records
                                </Link>
                            )}
                            {isLoggedIn && userRole === 'consultant' && (
                                <Link to="/consultantprofile" className="text-gray-600 hover:bg-blue-400 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                                    <Tool className="inline-block h-5 w-5 mr-1" />
                                    My Profile
                                </Link>
                            )}
                            {isLoggedIn && userRole === 'admin' && ( // Added Admin Dashboard Link
                                <Link to="/admindashboard" className="text-gray-600 hover:bg-blue-400 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                                    Admin Dashboard
                                </Link>
                            )}
                            {isLoggedIn && userRole === 'consultant' && ( // Added Consultant Dashboard Link
                                <Link to="/consultantdashboard" className="text-gray-600 hover:bg-blue-400 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                                    Consultant Dashboard
                                </Link>
                            )}
                             {isLoggedIn && userRole === 'user' && (
                                <Link to="/userpayments" className="text-gray-600 hover:bg-blue-400 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                                  UserPayments
                                </Link>
                              )}
                              {isLoggedIn && userRole === 'consultant' && (
                                <Link to="/consultantearnings" className="text-gray-600 hover:bg-blue-400 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                                  ConsultantEarnings
                                </Link>
                              )}
                            <button
                                onClick={handleLogout}
                                className="text-gray-600 hover:bg-blue-400 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                            >
                                <LogOut className="inline-block h-5 w-5 mr-1" />
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;