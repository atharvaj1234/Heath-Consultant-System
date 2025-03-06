import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Phone,
  User,
  LogOut,
  Calendar,
  File,
  User as Tool,
  CreditCard,
  MessageCircle,
  LayoutDashboard,
  DollarSign,
  Search,
  Info
} from "lucide-react";
import logo from '../assets/logo.png'

const Navbar = ({ isLoggedIn, userRole, handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation(); // Get the current path

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-gradient-to-r from-blue-200 to-purple-200 shadow-md sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img
                className="h-10 w-auto"
                src={logo}
                alt="Logo"
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-6">
                <NavItem to="/" icon={<Home />} text="Home" location={location} />
                <NavItem to="/aboutus" text="About Us" icon={<Info />} location={location} />
                {/* <NavItem to="/contactus" icon={<Phone />} text="Contact Us" location={location} /> */}

                {isLoggedIn && userRole === "user" && (
                  <>
                    <NavItem to="/consultantsearch" text="Find a Consultant" icon={<Search />} location={location} />
                    <NavItem to="/consultationdashboard" icon={<Calendar />} text="My Appointments" location={location} />
                    <NavItem to="/healthrecords" icon={<File />} text="Health Records" location={location} />
                    <NavItem to="/userpayments" icon={<CreditCard />} text="Payments" location={location} />
                  </>
                )}

                {isLoggedIn && userRole === "consultant" && (
                  <>
                    <NavItem to="/consultantprofile" icon={<Tool />} text="My Profile" location={location} />
                    <NavItem to="/consultantdashboard" icon={<LayoutDashboard />} text="Dashboard" location={location} />
                    <NavItem to="/consultantearnings" icon={<DollarSign />} text="Earnings" location={location} />
                  </>
                )}

                {isLoggedIn && userRole === "admin" && (
                  <NavItem to="/admindashboard" icon={<LayoutDashboard />} text="Admin Dashboard" location={location} />
                )}
              </div>
            </div>
          </div>

          {/* User Profile / Logout */}
          <div className="hidden md:flex items-center space-x-4 ml-14">
            {isLoggedIn ? (
              <>
                {userRole !== "admin" && (<><NavItem to="/userprofile" icon={<User />} text="Profile" location={location} />
                <NavItem to="/messages" icon={<MessageCircle />} text="Chat" location={location} /></>)}
                <button
                  onClick={handleLogout}
                  className="text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md flex items-center transition"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <NavItem to="/login" text="Login" location={location} />
                <NavItem to="/register" text="Register" location={location} />
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden -mr-2">
            <button onClick={toggleMenu} className="hover:text-gray-300 focus:outline-none">
              <svg
                className={`h-6 w-6 ${isMenuOpen ? "hidden" : "block"}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`h-6 w-6 ${isMenuOpen ? "block" : "hidden"}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden bg-blue-700`}>
        <div className="px-4 py-3 space-y-2">
          <NavItem to="/" icon={<Home />} text="Home" location={location} mobile />
          <NavItem to="/aboutus" text="About Us" location={location} mobile />
          {/* <NavItem to="/contactus" icon={<Phone />} text="Contact Us" location={location} mobile /> */}

          {isLoggedIn && userRole === "user" && (
            <>
              <NavItem to="/consultantsearch" text="Find a Consultant" location={location} mobile />
              <NavItem to="/consultationdashboard" icon={<Calendar />} text="My Appointments" location={location} mobile />
              <NavItem to="/healthrecords" icon={<File />} text="Health Records" location={location} mobile />
              <NavItem to="/userpayments" icon={<CreditCard />} text="Payments" location={location} mobile />
              <NavItem to="/messages" icon={<MessageCircle />} text="Chat" location={location} mobile />
            </>
          )}

          {isLoggedIn && userRole === "consultant" && (
            <>
              <NavItem to="/consultantprofile" icon={<Tool />} text="My Profile" location={location} mobile />
              <NavItem to="/consultantdashboard" icon={<LayoutDashboard />} text="Dashboard" location={location} mobile />
              <NavItem to="/consultantearnings" icon={<DollarSign />} text="Earnings" location={location} mobile />
              <NavItem to="/messages" icon={<MessageCircle />} text="Chat" location={location} mobile />
            </>
          )}

          {isLoggedIn && userRole === "admin" && (
            <NavItem to="/admindashboard" icon={<LayoutDashboard />} text="Admin Dashboard" location={location} mobile />
          )}

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full text-left bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md flex items-center transition"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          ) : (
            <>
              <NavItem to="/login" text="Login" location={location} mobile />
              <NavItem to="/register" text="Register" location={location} mobile />
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// Reusable NavItem Component with active state styling
const NavItem = ({ to, icon, text, location, mobile }) => {
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition flex-row text-nowrap 
      ${isActive ? "underline scale-105 hover:scale-108" : "hover:scale-105"}
      ${mobile ? "hover:bg-blue-500" : ""}`}
    >
      {icon && <span className="h-5 w-5 mr-3">{icon}</span>}
      <span>{text}</span>
    </Link>
  );
};

export default Navbar;
