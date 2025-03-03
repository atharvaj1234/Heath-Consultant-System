import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBookings, getConsultantBookings } from '../utils/api';
import { Calendar } from 'lucide-react';

const ConsultationDashboard = () => {
  const [upcomingConsultations, setUpcomingConsultations] = useState([]);
  const [pastConsultations, setPastConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConsultant, setIsConsultant] = useState(localStorage.getItem('isConsultant') === 'true');

  useEffect(() => {
    const fetchConsultations = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required. Please login.');
          return;
        }

        let data;
        if (isConsultant === 'true') {
          data = await getConsultantBookings(token);
        } else {
          data = await getBookings(token);
        }

        // Filter consultations into upcoming and past
        const now = new Date();
        const upcoming = data.filter(booking => new Date(booking.date) >= now);
        const past = data.filter(booking => new Date(booking.date) < now);

        setUpcomingConsultations(upcoming);
        setPastConsultations(past);

      } catch (err) {
        setError('Failed to retrieve consultations. Please try again.');
        setUpcomingConsultations([]);
        setPastConsultations([]);
        console.error('Failed to fetch consultations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, [isConsultant]);

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      {/* Upcoming Consultations */}
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Upcoming Consultations
        </h2>

        {loading && <p className="text-center">Loading upcoming consultations...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {upcomingConsultations.length === 0 && !loading && !error ? (
          <p className="text-center">No upcoming consultations found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {upcomingConsultations.map((consultation) => (
              <li key={consultation.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-700">
                      <Calendar className="inline-block h-5 w-5 mr-1" />
                      {new Date(consultation.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      Time: {consultation.time}
                    </p>
                    <p className="text-gray-600">
                      Status: {consultation.status}
                    </p>
                  </div>
                  {/*<Link
                    to={`/consultantdetails/${consultation.consultantId}`}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    View Consultant
                  </Link>*/}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Past Consultations */}
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Past Consultations
        </h2>

        {loading && <p className="text-center">Loading past consultations...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {pastConsultations.length === 0 && !loading && !error ? (
          <p className="text-center">No past consultations found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {pastConsultations.map((consultation) => (
              <li key={consultation.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-700">
                      <Calendar className="inline-block h-5 w-5 mr-1" />
                      {new Date(consultation.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      Time: {consultation.time}
                    </p>
                    <p className="text-gray-600">
                      Status: {consultation.status}
                    </p>
                  </div>
                  {/* <Link
                    to={`/consultantdetails/${consultation.consultantId}`}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    View Consultant
                  </Link>*/}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ConsultationDashboard;