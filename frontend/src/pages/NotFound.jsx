import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-10 flex flex-col items-center justify-center">
      {/* Error Message */}
      <section className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          404 Not Found
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Oops! The page you are looking for could not be found.
        </p>
      </section>

      {/* Back to Home Button */}
      <Link
        to="/"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors duration-300 flex items-center"
      >
        <Home className="mr-2 h-5 w-5" />
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;