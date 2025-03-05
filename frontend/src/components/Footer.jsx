
import { Home, Phone, Mail, Link } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-200 to-purple-200 py-12">
      <div className="max-w-6xl mx-auto text-gray-800">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-sm">
              Your trusted health consultant platform, connecting you with qualified professionals for personalized advice and care.
            </p>
          </div>

          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <p className="text-sm flex items-center mb-2">
              <Phone className="mr-2 h-4 w-4" />
              +1 (555) 123-4567
            </p>
            <p className="text-sm flex items-center mb-2">
              <Mail className="mr-2 h-4 w-4" />
              info@healthconsultant.com
            </p>
            <p className="text-sm flex items-center">
              <Home className="mr-2 h-4 w-4" />
              123 Health Street, Cityville
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="list-none p-0">
              <li className="mb-2">
                <RouterLink to="/" className="text-sm hover:text-blue-600 flex items-center">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </RouterLink>
              </li>
              <li className="mb-2">
                <RouterLink to="/aboutus" className="text-sm hover:text-blue-600 flex items-center">
                  About Us
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/contactus" className="text-sm hover:text-blue-600 flex items-center">
                  Contact Us
                </RouterLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Health Consultant. All rights reserved.</p>
          <p>
            <RouterLink to="/privacypolicy" className="hover:text-blue-600 mr-4">
              Privacy Policy
            </RouterLink>
            <RouterLink to="/termsofservice" className="hover:text-blue-600">
              Terms of Service
            </RouterLink>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;