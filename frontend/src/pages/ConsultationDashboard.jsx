import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBookings, getConsultantBookings } from '../utils/api';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';

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
        <div className="min-h-screen bg-gradient-to-br from-blue-300 to-purple-400 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Upcoming Consultations */}
                <section className="p-8">
                    <h2 className="text-3xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
                        <Calendar className="h-7 w-7 text-blue-500" />
                        <span>Upcoming Consultations</span>
                    </h2>

                    {loading && <p className="text-center text-gray-500">Loading upcoming consultations...</p>}
                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {upcomingConsultations.length === 0 && !loading && !error ? (
                        <p className="text-center text-gray-500">No upcoming consultations found.</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {upcomingConsultations.map((consultation) => (
                                <li key={consultation.id} className="py-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                        <div>
                                            <p className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
                                                <Calendar className="h-5 w-5 text-blue-400" />
                                                <span>{new Date(consultation.date).toLocaleDateString()}</span>
                                            </p>
                                            <p className="text-gray-600 flex items-center space-x-2">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span>Time: {consultation.time}</span>
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
                <section className="p-8 bg-gray-50">
                    <h2 className="text-3xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
                        <Calendar className="h-7 w-7 text-blue-500" />
                        <span>Past Consultations</span>
                    </h2>

                    {loading && <p className="text-center text-gray-500">Loading past consultations...</p>}
                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {pastConsultations.length === 0 && !loading && !error ? (
                        <p className="text-center text-gray-500">No past consultations found.</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {pastConsultations.map((consultation) => (
                                <li key={consultation.id} className="py-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                        <div>
                                            <p className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
                                                <Calendar className="h-5 w-5 text-blue-400" />
                                                <span>{new Date(consultation.date).toLocaleDateString()}</span>
                                            </p>
                                            <p className="text-gray-600 flex items-center space-x-2">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span>Time: {consultation.time}</span>
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
        </div>
    );
};

export default ConsultationDashboard;