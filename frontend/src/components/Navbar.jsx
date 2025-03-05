import { useState } from "react";
import { Link } from "react-router-dom";
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

const Navbar = ({ isLoggedIn, userRole, handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                src="https://placehold.co/40x40"
                alt="Logo"
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-6">
                <NavItem to="/" icon={<Home />} text="Home" />
                <NavItem to="/aboutus" text="About Us" icon={<Info/>} />
                <NavItem to="/contactus" icon={<Phone />} text="Contact Us" />

                {isLoggedIn && userRole === "user" && (
                  <>
                    <NavItem
                      to="/consultantsearch"
                      text="Find a Consultant"
                      icon = {<Search/>}
                    />
                    <NavItem
                      to="/consultationdashboard"
                      icon={<Calendar />}
                      text="My Appointments"
                    />
                    <NavItem to="/healthrecords" icon={<File />} text="Health Records" />
                    <NavItem to="/userpayments" icon={<CreditCard />} text="Payments" />
                    
                  </>
                )}

                {isLoggedIn && userRole === "consultant" && (
                  <>
                    <NavItem to="/consultantprofile" icon={<Tool />} text="My Profile" />
                    <NavItem to="/consultantdashboard" icon={<LayoutDashboard />} text="Dashboard" />
                    <NavItem to="/consultantearnings" icon={<DollarSign />} text="Earnings" />

                  </>
                )}

                {isLoggedIn && userRole === "admin" && (
                  <NavItem to="/admindashboard" icon={<LayoutDashboard />} text="Admin Dashboard" />
                )}
              </div>
            </div>
          </div>

          {/* User Profile / Logout */}
          <div className="hidden md:flex items-center space-x-4 ml-14">
            {isLoggedIn ? (
              <>
                <NavItem to="/userprofile" icon={<User />} text="Profile" />
                <NavItem to="/messages" icon={<MessageCircle />} text="Chat" />
                <button
                  onClick={handleLogout}
                  className="text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md flex items-center transition"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <NavItem to="/login" text="Login" />
                <NavItem to="/register" text="Register" />
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden -mr-2">
            <button
              onClick={toggleMenu}
              className=" hover:text-gray-300 focus:outline-none"
            >
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
          <NavItem to="/" icon={<Home />} text="Home" mobile />
          <NavItem to="/aboutus" text="About Us" mobile />
          <NavItem to="/contactus" icon={<Phone />} text="Contact Us" mobile />

          {isLoggedIn && userRole === "user" && (
            <>
              <NavItem to="/consultantsearch" text="Find a Consultant" mobile />
              <NavItem to="/consultationdashboard" icon={<Calendar />} text="My Appointments" mobile />
              <NavItem to="/healthrecords" icon={<File />} text="Health Records" mobile />
              <NavItem to="/userpayments" icon={<CreditCard />} text="Payments" mobile />
              <NavItem to="/messages" icon={<MessageCircle />} text="Chat" mobile />
            </>
          )}

          {isLoggedIn && userRole === "consultant" && (
            <>
              <NavItem to="/consultantprofile" icon={<Tool />} text="My Profile" mobile />
              <NavItem to="/consultantdashboard" icon={<LayoutDashboard />} text="Dashboard" mobile />
              <NavItem to="/consultantearnings" icon={<DollarSign />} text="Earnings" mobile />
              <NavItem to="/messages" icon={<MessageCircle />} text="Chat" mobile />
            </>
          )}

          {isLoggedIn && userRole === "admin" && (
            <NavItem to="/admindashboard" icon={<LayoutDashboard />} text="Admin Dashboard" mobile />
          )}

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full text-left  bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md flex items-center transition"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          ) : (
            <>
              <NavItem to="/login" text="Login" mobile />
              <NavItem to="/register" text="Register" mobile />
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// Reusable NavItem Component
const NavItem = ({ to, icon, text, mobile }) => (
  <Link
    to={to}
    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition flex-row text-nowrap items-center
      ${mobile ? " hover:bg-blue-500" : " hover:scale-105"}`
    }
  >
    {icon && <span className="h-5 w-5 mr-3">{icon}</span>}
    <span>{text}</span>
  </Link>
);

export default Navbar;
