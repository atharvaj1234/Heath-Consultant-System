import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPayments } from '../utils/api';
import { CreditCard, Plus } from 'lucide-react';

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required. Please login.');
          return;
        }

        const data = await getPayments(token);
        setPayments(data);
      } catch (err) {
        setError('Failed to retrieve payments. Please try again.');
        setPayments([]);
        console.error('Failed to fetch payments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      {/* Payment History */}
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Payment History
        </h2>

        {loading && <p className="text-center">Loading payment history...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {payments.length === 0 && !loading && !error ? (
          <p className="text-center">No payment history found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <li key={payment.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-700">
                      <CreditCard className="inline-block h-5 w-5 mr-1" />
                      Payment ID: {payment.id}
                    </p>
                    <p className="text-gray-600">
                      Date: {payment.date}
                    </p>
                    <p className="text-gray-600">
                      Amount: ${payment.amount}
                    </p>
                    <p className="text-gray-600">
                      Status: {payment.status}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Payment Method (Placeholder) */}
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Payment Method
        </h2>
        <p className="text-gray-700">
          Visa ending in 4242
        </p>
      </section>

      {/* Add Payment Method Button */}
      <div className="max-w-4xl mx-auto text-center">
        <Link
          to="#"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors duration-300 inline-flex items-center"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add New Payment Method
        </Link>
      </div>
    </div>
  );
};

export default Payment;