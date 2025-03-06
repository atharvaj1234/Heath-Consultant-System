import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Phone, User, LogOut } from 'lucide-react';

const Homepage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-10">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl shadow-xl p-8 md:p-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          Find the Best Health Consultant
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8">
          Connect with qualified health consultants and get personalized advice for a healthier life.
        </p>
        <Link
          to="/consultantsearch"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors duration-300"
        >
          Find a Consultant
        </Link>
      </section>

      {/* Features Section */}
      <section className="mt-16">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          Our Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <Home className="h-8 w-8 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Expert Consultants
            </h3>
            <p className="text-gray-600">
              Connect with experienced and qualified health consultants in various specialties.
            </p>
          </div>
          {/* Feature 2 */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <Phone className="h-8 w-8 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Personalized Advice
            </h3>
            <p className="text-gray-600">
              Receive tailored health advice and guidance based on your unique needs and concerns.
            </p>
          </div>
          {/* Feature 3 */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <User className="h-8 w-8 text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Secure Platform
            </h3>
            <p className="text-gray-600">
              Your health information is safe and secure with our encrypted platform.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mt-16">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          What Our Users Say
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Testimonial 1 */}
          <div className="bg-white rounded-2xl shadow-md p-6 w-full md:w-1/3">
            <img
              className="h-16 w-16 rounded-full mx-auto mb-4 object-cover"
              src="https://th.bing.com/th/id/OIP.R9hYj30Rzp2T3CukF6526AHaKS?rs=1&pid=ImgDetMain"
              alt="User Avatar"
            />
            <p className="text-gray-700 text-center mb-2">
              "This platform has been a game-changer for managing my health. I highly recommend it!"
            </p>
            <p className="text-gray-600 font-semibold text-center">
              - Sarah Johnson
            </p>
          </div>
          {/* Testimonial 2 */}
          <div className="bg-white rounded-2xl shadow-md p-6 w-full md:w-1/3">
            <img
              className="h-16 w-16 rounded-full mx-auto mb-4 object-cover"
              src="https://1.bp.blogspot.com/-4V0EbEiLcJ0/UZSd0RjBy1I/AAAAAAAAAIU/2nlA2EW2L8Y/s1600/AMBER-HEARD-34.jpg"
              alt="User Avatar"
            />
            <p className="text-gray-700 text-center mb-2">
              "I found the perfect consultant for my needs. The process was easy and efficient."
            </p>
            <p className="text-gray-600 font-semibold text-center">
              - Joulie Davis
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;