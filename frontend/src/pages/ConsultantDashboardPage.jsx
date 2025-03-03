
import React, { useState, useEffect } from 'react';
// import { getConsultantBookingsById } from '../utils/api';
import { Calendar } from 'lucide-react';

const ConsultantDashboardPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [consultantId, setConsultantId] = useState(null); // Ensure it's null initially

    useEffect(() => {
        // Function to fetch bookings
        const fetchBookings = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const storedConsultantId = localStorage.getItem('userId');

                if (!token) {
                    setError('Authentication required. Please login.');
                    return;
                }

                // Check if storedConsultantId exists and is a valid number
                if (!storedConsultantId || isNaN(parseInt(storedConsultantId, 10))) {
                    setError('Consultant ID not found or invalid. Please login again.');
                    return;
                }

                // Convert storedConsultantId to a number
                const parsedConsultantId = parseInt(storedConsultantId, 10);
                setConsultantId(parsedConsultantId);

                // const data = await getConsultantBookingsById(token, parsedConsultantId);
                setBookings([]);
            } catch (err) {
                setError('Failed to retrieve bookings. Please try again.');
                console.error('Failed to fetch bookings:', err);
            } finally {
                setLoading(false);
            }
        };

        // Call fetchBookings only if consultantId is valid
        if (localStorage.getItem('isConsultant') === 'true' && localStorage.getItem('userId')) {
            fetchBookings();
        }
        else{
            setError('You must be logged in as Consultant to access this page')
        }

    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-10">
            <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
                    Consultant Dashboard
                </h2>
                {loading && <p className="text-center">Loading bookings...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
                {!loading && !error && bookings.length === 0 && (
                    <p className="text-center">No bookings found.</p>
                )}
                {!loading && !error && bookings.length > 0 && (
                    <ul className="divide-y divide-gray-200">
                        {bookings.map((booking) => (
                            <li key={booking.id} className="py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-semibold text-gray-700">
                                            <Calendar className="inline-block h-5 w-5 mr-1" />
                                            {new Date(booking.date).toLocaleDateString()}
                                        </p>
                                        <p className="text-gray-600">
                                            Time: {booking.time}
                                        </p>
                                        <p className="text-gray-600">
                                            Status: {booking.status}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default ConsultantDashboardPage;

