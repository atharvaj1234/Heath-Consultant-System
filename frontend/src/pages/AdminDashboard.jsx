import React, { useState, useEffect } from 'react';
import { getAdminUsers, getAdminConsultants, getAdminBookings } from '../utils/api';
import { User, User as Tool, Calendar } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required. Please login as an admin.');
          return;
        }

        const usersData = await getAdminUsers(token);
        setUsers(usersData);

        const consultantsData = await getAdminConsultants(token);
        setConsultants(consultantsData);

        const bookingsData = await getAdminBookings(token);
        setBookings(bookingsData);

      } catch (err) {
        setError('Failed to retrieve data. Please ensure you are logged in as admin and try again.');
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <section className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          Admin Dashboard
        </h2>

        {loading && <p className="text-center">Loading data...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            {/* User Management */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                User Management
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr className="bg-gray-100 font-semibold">
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        <User className="inline-block h-4 w-4 mr-1" />
                        ID
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        Full Name
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        Email
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        Role
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{user.id}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{user.fullName}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{user.email}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{user.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Consultant Management */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Consultant Management
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr className="bg-gray-100 font-semibold">
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        <Tool className="inline-block h-4 w-4 mr-1" />
                        ID
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        Specialty
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        Qualifications
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        Availability
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultants.map((consultant) => (
                      <tr key={consultant.id}>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{consultant.id}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{consultant.specialty}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{consultant.qualifications}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{consultant.availability}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Consultation Monitoring */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Consultation Monitoring
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr className="bg-gray-100 font-semibold">
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        <Calendar className="inline-block h-4 w-4 mr-1" />
                        ID
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        User ID
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        Consultant ID
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        Date
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        Time
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{booking.id}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{booking.userId}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{booking.consultantId}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{booking.date}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{booking.time}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{booking.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;