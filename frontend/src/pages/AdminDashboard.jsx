
import React, { useState, useEffect } from 'react';
import { getAdminUsers, getAdminConsultants, getAdminBookings, acceptBooking, approveConsultant, getHealthRecords } from '../utils/api';
import { User, Calendar as CalendarIcon, User as Tool, CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [healthRecords, setHealthRecords] = useState(null);
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
      // setUsers(users.map(user =>
      //   user.id === userId ? { ...user, isApproved: 1 } : user
      // ));

      // Update the consultants state to reflect the approval (if needed)
      setConsultants(consultants.map(consultant =>
        consultant.userId === userId ? { ...consultant, isApproved: 1 } : consultant
      ));

    } catch (err) {
      setError('Failed to approve consultant. Please try again.');
      console.error('Failed to approve consultant:', err);
    }
  };

  const getDetails = async (userId) => {
    try {
            const token = localStorage.getItem('token');
            if (!token) {
              setError('Authentication required. Please login.');
              return;
            }
    
            const data = await getHealthRecords(token, userId);
            setHealthRecords(data[0]);
          } catch (err) {
            setError('Failed to retrieve health records. Please try again.');
            setHealthRecords([]);
            console.error('Failed to fetch health records:', err);
          }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
    {healthRecords && (
      <div
        className="absolute top-0 bottom-0 left-0 right-0 flex justify-center items-center min-w-screen"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={() => setHealthRecords(null)}
      >
        <div className="rounded-lg bg-gradient-to-r from-blue-500 via-teal-400 to-green-300 p-1">
          <div className="flex justify-center items-center">
            <div className="max-w-6xl bg-white rounded-lg shadow-2xl p-8 space-y-6 transform transition-all hover:shadow-xl w-[40vw]">
              {/* Profile Section */}
              <div className="flex items-center space-x-6">
                <img
                  src={
                    `http://localhost:5555/uploads/${users.find(user => user.id === healthRecords.userId)?.profilePicture}`}
                  alt="Profile Picture"
                  className="w-24 h-24 rounded-full object-cover shadow-md"
                />
                <div>
                  <h2 className="text-3xl font-semibold text-gray-800">
                    {users.filter((user) => user.id === healthRecords.userId)[0]?.fullName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {users.filter((user) => user.id === healthRecords.userId)[0]?.email}
                    <br />
                    {users.filter((user) => user.id === healthRecords.userId)[0]?.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    Blood Group:{" "}
                    <span className="font-bold">
                      {users.filter((user) => user.id === healthRecords.userId)[0]?.bloodGroup}
                    </span>
                  </p>
                </div>
              </div>
              {/* Current Prescriptions Section */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-700">
                  Current Prescriptions
                </h3>
                <p className="text-gray-600">
                  {users.filter((user) => user.id === healthRecords.userId)[0]?.currentPrescriptions}
                </p>
              </div>

              {/* Medical History Section */}
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-700">
                  Medical History
                </h3>
                <p className="text-gray-600">{users.filter((user) => user.id === healthRecords.userId)[0]?.medicalHistory}</p>
              </div>

              {/* Health Records Section */}
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-700">
                  Health Records
                </h3>
                {/* Check if healthRecords exist */}
                {healthRecords && healthRecords.length > 0 ? (
                  <div className="space-y-6 overflow-auto h-[250px]">
                    {/* Loop through each health record */}
                    {healthRecords.map((record, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-4 rounded-lg shadow-md"
                      >
                        <h4 className="text-lg font-medium text-gray-600">
                          Medical History
                        </h4>
                        <p className="text-gray-500">
                          {record.medicalHistory ||
                            "No medical history available"}
                        </p>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-lg font-medium text-gray-600">
                              Ongoing Treatments
                            </h4>
                            <p className="text-gray-500">
                              {record.ongoingTreatments ||
                                "No ongoing treatments"}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-lg font-medium text-gray-600">
                              Prescriptions
                            </h4>
                            <p className="text-gray-500">
                              {record.prescriptions ||
                                "No current prescriptions"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No health records available.
                  </p>
                )}
              </div>

              {/* Health Medical History Section
          <div>
            <h3 className="text-2xl font-semibold text-gray-700">
              Health Medical History
            </h3>
            <p className="text-gray-600">{details.user.medicalHistory}</p>
          </div> */}
            </div>
          </div>
        </div>
      </div>
    )}
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
                        Health Records
                      </th>
                      {/* <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        isApproved
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        Actions
                      </th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{user.id}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{user.fullName}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{user.email}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{user.role}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{                            <button
                              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                              onClick={() => getDetails(user.id)}
                            >
                              Get Records
                            </button>}</td>
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
                        Name
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        Email
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        Bio
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        Expertise
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        Speciality
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        Qualification
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        Bank Account
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        Documents
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
                    {consultants.map((consultant) => (
                      <tr key={consultant.id}>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{consultant.id}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{consultant.fullName}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{consultant.email}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{consultant.bio.length > 10 ? consultant.bio.slice(0, 10) + "..." : consultant.bio}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{consultant.areasOfExpertise}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{consultant.speciality}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{consultant.qualification}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{consultant.bankAccount}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{consultant.documents}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">{consultant.isApproved ? 'Yes' : 'No'}</td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {consultant.isConsultant && !consultant.isApproved && (
                            <button
                              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                              onClick={() => handleApproveConsultant(consultant.id)}
                            >
                              Approve
                            </button>
                          )}
                          {consultant.isApproved ? <CheckCircle className="inline-block h-5 w-5 text-green-500" /> : ''}
                        </td>
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
                      {/* <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                        Actions
                      </th> */}
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
                        {/* <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {booking.status === 'pending' && (
                            <button
                              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                              onClick={() => handleAcceptBooking(booking.id)}
                            >
                              Accept
                            </button>
                          )}
                        </td> */}
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




