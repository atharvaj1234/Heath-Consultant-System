import React, { useState, useEffect } from "react";
import { getConsultantEarnings } from "../utils/api";
import { Coins } from "lucide-react";

const ConsultantEarnings = () => {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEarnings = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required. Please login.");
          return;
        }

        const data = await getConsultantEarnings(token);
        setEarnings(data);
      } catch (err) {
        setError("Failed to retrieve earnings. Please try again.");
        setEarnings([]);
        console.error("Failed to fetch earnings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-300 to-purple-400 py-12">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="px-6 py-8 bg-gradient-to-r from-blue-100 to-purple-100">
          <h2 className="text-3xl font-semibold text-gray-800 text-center">
            My Earnings
          </h2>
        </div>

        {loading && <p className="text-center py-4">Loading earnings...</p>}
        {error && <p className="text-center text-red-500 py-4">{error}</p>}

        {!loading && !error && earnings.length === 0 && (
          <p className="text-center py-4">No earnings found.</p>
        )}

        {!loading && !error && earnings.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <Coins className="inline-block h-4 w-4 mr-1" />
                    Payment ID
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Booking Date/Time
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((earning) => (
                  <tr key={earning.id}>
                    <td className="px-5 py-3 border-b border-gray-200 text-sm">
                      {earning.id}
                    </td>
                    <td className="px-5 py-3 border-b border-gray-200 text-sm">
                      {formatDate(earning.paymentDate)}
                    </td>
                    <td className="px-5 py-3 border-b border-gray-200 text-sm">
                      {formatDate(earning.bookingDate)}/{formatTime(earning.bookingTime)}
                    </td>
                    <td className="px-5 py-3 border-b border-gray-200 text-sm">
                      ${earning.amount}
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

export default ConsultantEarnings;