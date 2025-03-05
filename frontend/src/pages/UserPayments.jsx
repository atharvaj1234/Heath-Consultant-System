import React, { useState, useEffect } from "react";
import { getUserPayments } from "../utils/api";
import { CreditCard } from "lucide-react";

const UserPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required. Please login.");
          return;
        }

        const data = await getUserPayments(token);
        setPayments(data);
      } catch (err) {
        setError("Failed to retrieve payments. Please try again.");
        setPayments([]);
        console.error("Failed to fetch payments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    // Split the time string into hours and minutes
    const [hours, minutes] = timeString.split(":");
    // Convert to 12-hour format
    let period = "AM";
    let hour = parseInt(hours);
    if (hour >= 12) {
      period = "PM";
      hour = hour === 12 ? hour : hour - 12; // Noon should be 12 PM
    }
    if (hour === 0) {
      hour = 12; // Midnight should be 12 AM
    }
    return `${hour}:${minutes} ${period}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="px-6 py-8 bg-gradient-to-r from-blue-400 to-purple-500 ">
          <h2 className="text-3xl font-semibold text-white text-center">
            My Payment History
          </h2>
        </div>

        {loading && <p className="text-center py-4">Loading payments...</p>}
        {error && <p className="text-center text-red-500 py-4">{error}</p>}

        {!loading && !error && payments.length === 0 && (
          <p className="text-center py-4">No payment history found.</p>
        )}

        {!loading && !error && payments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <CreditCard className="inline-block h-4 w-4 mr-1" />
                    Payment ID
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Booking Date/Time
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Refund Amount
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Final Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-5 py-3 border-b border-gray-200 text-sm">
                      {payment.id}
                    </td>
                    <td className="px-5 py-3 border-b border-gray-200 text-sm">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="px-5 py-3 border-b border-gray-200 text-sm">
                      {formatDate(payment.bookingDate)}/{formatTime(payment.bookingTime)}
                    </td>
                    <td className="px-5 py-3 border-b border-gray-200 text-sm">
                      ${payment.amount}
                    </td>
                    <td className="px-5 py-3 border-b border-gray-200 text-sm">
                      {payment.status}
                    </td>
                     <td className="px-5 py-3 border-b border-gray-200 text-sm">
                      {payment.refundAmount ? `$${payment.refundAmount}` : "-"}
                    </td>
                    <td className="px-5 py-3 border-b border-gray-200 text-sm">
                      ${payment.finalAmount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPayments;