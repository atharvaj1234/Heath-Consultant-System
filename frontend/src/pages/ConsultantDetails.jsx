import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getConsultantById } from '../utils/api';

const ConsultantDetails = () => {
  const { id } = useParams();
  const [consultant, setConsultant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConsultant = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getConsultantById(id);
        setConsultant(data);
      } catch (err) {
        setError('Failed to retrieve consultant details. Please try again.');
        setConsultant(null);
        console.error('Failed to fetch consultant:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultant();
  }, [id]);

  if (loading) {
    return <div className="text-center">Loading consultant details...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!consultant) {
    return <div className="text-center">Consultant not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      {/* Consultant Details */}
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Consultant Image */}
        <img
          className="w-full h-96 object-cover"
          src={consultant.imageUrl || "https://placehold.co/800x600"}
          alt={consultant.specialty}
        />

        <div className="p-8">
          {/* Consultant Name and Specialty */}
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {consultant.specialty}
          </h2>
          <p className="text-xl text-gray-700 mb-4">
            Specialty: {consultant.specialty}
          </p>

          {/* Consultant Bio */}
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              About
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {consultant.qualifications}
            </p>
          </div>

          {/* Availability */}
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              Availability
            </h3>
            <p className="text-gray-700">
              {consultant.availability}
            </p>
          </div>

          {/* Book Appointment Button */}
          <Link
            to={`/booking/${consultant.id}`}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors duration-300 inline-block"
          >
            Book Appointment
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ConsultantDetails;