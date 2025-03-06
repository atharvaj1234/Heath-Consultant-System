import React, { useState, useEffect } from "react";
import {
  getConsultantBookingsById,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  get_details,
} from "../utils/api"; // Import the missing function
import { Calendar, Eye, X, Check } from "lucide-react";
import { Navigate } from "react-router-dom";

const ConsultantDashboardPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [details, setDetails] = useState(null);
  const [consultantId, setConsultantId] = useState(null); // Ensure it's null initially
  const [isApproved, setIsApproved] = useState(false);

  const handleAcceptBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please login as an admin.");
        return;
      }

      await acceptBooking(token, bookingId);

      // Update the bookings state to reflect the accepted booking
      setBookings(
        bookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "accepted" }
            : booking
        )
      );
    } catch (err) {
      setError("Failed to accept booking. Please try again.");
      console.error("Failed to accept booking:", err);
    }
  };
  const getDetails = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please login as an admin.");
        return;
      }

      const data = await get_details(token, bookingId);
      console.log(data);
      setDetails(data);
      // Update the bookings state to reflect the accepted booking
      // setBookings(bookings.map(booking =>
      //     booking.id === bookingId ? { ...booking, status: 'accepted' } : booking
      // ));
    } catch (err) {
      setError("Can't click");
      console.error("Failed to accept booking:", err);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please login as an admin.");
        return;
      }

      const response = await rejectBooking(token, bookingId);

      // Update the bookings state to reflect the rejected booking
      setBookings(
        bookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "rejected" }
            : booking
        )
      );

      if (response && response.refundId) {
        // Handle success (e.g., display a message)
        console.log(`Booking rejected, refund initiated with ID: ${response.refundId}`);
      }
    } catch (err) {
      setError("Failed to reject booking. Please try again.");
      console.error("Failed to reject booking:", err);
    }
  };

  const handleCancelBooking = async (bookingId, bookingdate) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please login as an admin.");
        return;
      }

      const bookingDate = new Date(bookingdate); // Assuming booking.date is a valid date string
      const today = new Date();

      // Reset the time portion of both dates to midnight
      bookingDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (bookingDate < today) {
        console.log("Booking date is in the past.");
      } else {
        console.log("Booking date is in the future.");
        await cancelBooking(token, bookingId);
        // Update the bookings state to reflect the accepted booking
        setBookings(
          bookings.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: "canceled" }
              : booking
          )
        );
      }
    } catch (err) {
      setError("Failed to accept booking. Please try again.");
      console.error("Failed to accept booking:", err);
    }
  };

  useEffect(() => {
    // Function to fetch bookings
    console.log(localStorage.getItem("isConsultant"))
    const fetchBookings = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const storedConsultantId = localStorage.getItem("userId");
        const storedIsApproved = localStorage.getItem("isApproved");

        if (!token) {
          setError("Authentication required. Please login.");
          return;
        }

        // Check if storedConsultantId exists and is a valid number
        if (!storedConsultantId || isNaN(parseInt(storedConsultantId, 10))) {
          setError("Consultant ID not found or invalid. Please login again.");
          return;
        }

        // Convert storedConsultantId to a number
        const parsedConsultantId = parseInt(storedConsultantId, 10);
        setConsultantId(parsedConsultantId); // Set the consultantId state

        // Set isApproved state
        setIsApproved(storedIsApproved === "true");

        const data = await getConsultantBookingsById(token, parsedConsultantId);
        setBookings(data);
      } catch (err) {
        setError(err.response.data.message.toString());
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    // Call fetchBookings only if consultantId is valid
    if (
      localStorage.getItem("isConsultant") === "1" &&
      localStorage.getItem("userId")
    ) {
      fetchBookings();
    } else {
      setError("You must be logged in as Consultant to access this page");
    }
  }, []);

  // Redirect if consultant is not approved
  // if (
  //   localStorage.getItem("isConsultant") === "true" &&
  //   localStorage.getItem("isApproved") === "false"
  // ) {
  //   return <Navigate to="/" />;
  // }

  return (
    <div className="min-h-screen bg-gray-100">
      {details && (
        <div
          className="absolute top-0 bottom-0 left-0 right-0 flex justify-center items-center min-w-screen"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setDetails(null)}
        >
          <div className="rounded-lg bg-gradient-to-r from-blue-500 via-teal-400 to-green-300 p-1">
            <div className="flex justify-center items-center">
              <div className="max-w-6xl bg-white rounded-lg shadow-2xl p-8 space-y-6 transform transition-all hover:shadow-xl w-[40vw]">
                {/* Profile Section */}
                <div className="flex items-center space-x-6">
                  <img
                    src={
                      `http://localhost:5555/${details.user.profilePicture}`
                    }
                    alt="Profile Picture"
                    className="w-24 h-24 rounded-full object-cover shadow-md"
                  />
                  <div>
                    <h2 className="text-3xl font-semibold text-gray-800">
                      {details.user.fullName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {details.user.email}
                      <br />
                      {details.user.phone}
                    </p>
                    <p className="text-sm text-gray-600">
                      Blood Group:{" "}
                      <span className="font-bold">
                        {details.user.bloodGroup}
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
                    {details.user.currentPrescriptions}
                  </p>
                </div>

                {/* Medical History Section */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-gray-700">
                    Medical History
                  </h3>
                  <p className="text-gray-600">{details.user.medicalHistory}</p>
                </div>

                {/* Health Records Section */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-gray-700">
                    Health Records
                  </h3>
                  {/* Check if healthRecords exist */}
                  {details.healthRecords && details.healthRecords.length > 0 ? (
                    <div className="space-y-6 overflow-auto h-[250px]">
                      {/* Loop through each health record */}
                      {details.healthRecords.map((record, index) => (
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

<div className="min-h-screen bg-gradient-to-br from-blue-300 to-purple-400 p-10">
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
          Consultant Dashboard
        </h2>

        {loading && <p className="text-center text-gray-700">Loading bookings...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && bookings.length === 0 && (
          <p className="text-center text-gray-700">No bookings found.</p>
        )}

        {!loading && !error && bookings.length > 0 && (
          <ul className="divide-y divide-gray-300">
            {bookings.map((booking) => (
              <li key={booking.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    {new Date(booking.date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">Time: {booking.time}</p>
                  <p className="text-gray-600">Status: {booking.status}</p>
                </div>

                <div className="flex gap-2">
                  {booking.status === "pending" && (
                    <>
                      <button
                        className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg shadow-md transition"
                        onClick={() => handleAcceptBooking(booking.id)}
                      >
                        <Check className="h-5 w-5" />
                        Accept
                      </button>
                      <button
                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow-md transition"
                        onClick={() => handleRejectBooking(booking.id)}
                      >
                        <X className="h-5 w-5" />
                        Reject
                      </button>
                    </>
                  )}
                  {booking.status === "accepted" && (
                    <button
                      className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow-md transition"
                      onClick={() => handleRejectBooking(booking.id)}
                    >
                      <X className="h-5 w-5" />
                      Cancel
                    </button>
                  )}
                  <button
                    className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md transition"
                    onClick={() => getDetails(booking.id)}
                  >
                    <Eye className="h-5 w-5" />
                    View
                  </button>
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

export default ConsultantDashboardPage;