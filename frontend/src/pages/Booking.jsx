import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getConsultantById, createBooking } from '../utils/api';

const Booking = () => {
  const { id } = useParams();
  const [consultant, setConsultant] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [paymentInfo, setPaymentInfo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setBookingSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login.');
        return;
      }

      await createBooking(token, id, date, time);
      setBookingSuccess(true);
    } catch (err) {
      setError('Failed to create booking. Please try again.');
      console.error('Booking creation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading booking information...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!consultant) {
    return <div className="text-center">Consultant not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      {/* Consultant Information */}
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-2">
          Booking Appointment with {consultant.specialty}
        </h2>
        <p className="text-xl text-gray-700">
          {consultant.specialty}
        </p>
      </section>

      {/* Booking Form */}
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <form onSubmit={handleSubmit}>
          {/* Date and Time Selection */}
          <div className="mb-6">
            <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">
              Select Date:
            </label>
            <input
              type="date"
              id="date"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="time" className="block text-gray-700 text-sm font-bold mb-2">
              Select Time:
            </label>
            <select
              id="time"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            >
              <option value="">Select a time</option>
              <option value="09:00">9:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="14:00">2:00 PM</option>
              <option value="15:00">3:00 PM</option>
              <option value="16:00">4:00 PM</option>
            </select>
          </div>

          {/* Payment Information (Simplified) */}
          <div className="mb-6">
            <label htmlFor="paymentInfo" className="block text-gray-700 text-sm font-bold mb-2">
              Payment Information:
            </label>
            <input
              type="text"
              id="paymentInfo"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter Credit Card Number"
              value={paymentInfo}
              onChange={(e) => setPaymentInfo(e.target.value)}
              required
            />
          </div>

          {/* Confirmation Button */}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors duration-300"
          >
            Confirm Booking
          </button>
        </form>

        {bookingSuccess && (
          <div className="mt-4 text-green-500">
            Booking created successfully!
          </div>
        )}
      </section>
    </div>
  );
};

export default Booking;