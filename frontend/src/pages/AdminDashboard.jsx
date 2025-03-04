
import React, { useState, useEffect } from 'react';
import { getAdminUsers, getAdminConsultants, getAdminBookings, acceptBooking, approveConsultant } from '../utils/api';
import { User, Calendar as CalendarIcon, User as Tool, CheckCircle } from 'lucide-react';

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

  const handleAcceptBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login as an admin.');
        return;
      }

      await acceptBooking(token, bookingId);

      // Update the bookings state to reflect the accepted booking
      setBookings(bookings.map(booking =>
        booking.id === bookingId ? { ...booking, status: 'accepted' } : booking
      ));
    } catch (err) {
      setError('Failed to accept booking. Please try again.');
      console.error('Failed to accept booking:', err);
    }
  };

  const handleApproveConsultant = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login as an admin.');
        return;
      }

      await approveConsultant(token, userId);

      // Update the users state to reflect the approved consultant
      setUsers(users.map(user =>
        user.id === userId ? { ...user, isApproved: 1 } : user
      ));

      // Update the consultants state to reflect the approval (if needed)
      setConsultants(consultants.map(consultant =>
        consultant.userId === userId ? { ...consultant, isApproved: 1 } : consultant
      ));

    } catch (err) {
      setError('Failed to approve consultant. Please try again.');
      console.error('Failed to approve consultant:', err);
    }
  };

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
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        isConsultant
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        isApproved
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        Actions
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
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{user.isConsultant ? 'Yes' : 'No'}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{user.isApproved ? 'Yes' : 'No'}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {user.isConsultant && !user.isApproved && (
                            <button
                              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                              onClick={() => handleApproveConsultant(user.id)}
                            >
                              Approve
                            </button>
                          )}
                          {user.isApproved ? <CheckCircle className="inline-block h-5 w-5 text-green-500" /> : null}
                        </td>
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
                        <CalendarIcon className="inline-block h-4 w-4 mr-1" />
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
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        Actions
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
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {booking.status === 'pending' && (
                            <button
                              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                              onClick={() => handleAcceptBooking(booking.id)}
                            >
                              Accept
                            </button>
                          )}
                        </td>
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




