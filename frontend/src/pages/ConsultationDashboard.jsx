import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  getBookings,
  getConsultantBookings,
  cancelBooking,
  getUserPayments
} from "../utils/api";
import { Calendar, Clock, AlertTriangle, X, CreditCard } from "lucide-react";

const ConsultationDashboard = () => {
  const [upcomingConsultations, setUpcomingConsultations] = useState([]);
  const [pastConsultations, setPastConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingTransactions, setPendingTransactions] = useState([])
  const navigate = useNavigate();
  const [isConsultant, setIsConsultant] = useState(
    localStorage.getItem("isConsultant") === "true"
  );
  const [cancelConfirmation, setCancelConfirmation] = useState({
    show: false,
    bookingId: null,
    bookingDate: null,
  });

  useEffect(() => {
    const fetchConsultations = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required. Please login.");
          return;
        }

        let data;
        if (isConsultant === "true") {
          data = await getConsultantBookings(token);
        } else {
          data = await getBookings(token);
        }

        // Filter consultations into upcoming and past
        const now = new Date();
        const upcoming = data.filter(
          (booking) => new Date(booking.date) >= now
        );
        const past = data.filter((booking) => new Date(booking.date) < now);

        setUpcomingConsultations(upcoming);
        setPastConsultations(past);


        function getAppointmentPaymentId(appointments, bid) {
          for (let appointment of appointments) {
            if (
              appointment.bookingId.toString() == bid.toString() &&
              appointment.status === "pending"
            ) {
              return appointment.bookingId;
            }
          }
          return 0; // Return null if no matching appointment is found
        }

        data = await getUserPayments(token);
        console.log(data)
                const pid = upcoming.filter(
                  (slot) => data.some(app => (app.bookingId.toString() == slot.id.toString() && app.status == "pending")))
                  console.log(pid)
                  setPendingTransactions(pid)
                // setPaymentId(pid);
      } catch (err) {
        setError("Failed to retrieve consultations. Please try again.");
        setUpcomingConsultations([]);
        setPastConsultations([]);
        console.error("Failed to fetch consultations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, [isConsultant]);

  const handleCancelBooking = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please login as an admin.");
        return;
      }

      const bookingDate = new Date(cancelConfirmation.bookingDate); // Assuming booking.date is a valid date string
      const today = new Date();

      // Reset the time portion of both dates to midnight
      bookingDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (bookingDate < today) {
        console.log("Booking date is in the past.");
      } else {
        console.log("Booking date is in the future.");
        await cancelBooking(token, cancelConfirmation.bookingId);
        // Update the bookings state to reflect the accepted booking
        setUpcomingConsultations(
          upcomingConsultations.map((booking) =>
            booking.id.toString() === cancelConfirmation.bookingId.toString()
              ? { ...booking, status: "canceled" }
              : booking
          )
        );
      }
    } catch (err) {
      setError("Failed to accept booking. Please try again.");
      console.error("Failed to accept booking:", err);
    } finally {
      setCancelConfirmation({ show: false, bookingId: null, bookingDate: null }); // Close the confirmation popup
    }
  };

  const showCancelConfirmation = (bookingId, bookingDate) => {
    setCancelConfirmation({ show: true, bookingId, bookingDate });
  };

  const hideCancelConfirmation = () => {
    setCancelConfirmation({ show: false, bookingId: null, bookingDate: null });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 to-purple-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Upcoming Consultations */}
        <section className="p-8">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
            <Calendar className="h-7 w-7 text-blue-500" />
            <span>Upcoming Consultations</span>
          </h2>

          {loading && (
            <p className="text-center text-gray-500">
              Loading upcoming consultations...
            </p>
          )}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle
                    className="h-5 w-5 text-red-400"
                    aria-hidden="true"
                  />
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
            <p className="text-center text-gray-500">
              No upcoming consultations found.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {upcomingConsultations.map((consultation) => (
                <li key={consultation.id} className="py-4">
                  <div className="flex flex-row justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-blue-400" />
                        <span>
                          {new Date(consultation.date).toLocaleDateString()}
                        </span>
                      </p>
                      <p className="text-gray-600 flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>Time: {consultation.time}</span>
                      </p>
                      <p className="text-gray-600">
                        Status: {consultation.status}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <Link
                        to={`/consultantdetails/${consultation.consultantId}`}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        View Consultant
                      </Link>
                      {consultation.status === "accepted" ||
                        (consultation.status === "pending" && (
                          <button
                            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow-md transition"
                            onClick={() =>
                              showCancelConfirmation(
                                consultation.id,
                                consultation.date
                              )
                            }
                          >
                            <X className="h-5 w-5" />
                            Cancel
                          </button> 
                        ))}
                        { pendingTransactions.filter(app => app.id.toString() == consultation.id.toString()).length > 0 && (
                         <button
                            className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg shadow-md transition"
                            onClick={() => navigate(`/consultantdetails/${consultation.consultantId}/`)
                            }
                          >
                            <CreditCard className="h-5 w-5" />
                            Make Payment
                          </button>
                        )}
                    </div>
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

          {loading && (
            <p className="text-center text-gray-500">
              Loading past consultations...
            </p>
          )}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle
                    className="h-5 w-5 text-red-400"
                    aria-hidden="true"
                  />
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
            <p className="text-center text-gray-500">
              No past consultations found.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {pastConsultations.map((consultation) => (
                <li key={consultation.id} className="py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-blue-400" />
                        <span>
                          {new Date(consultation.date).toLocaleDateString()}
                        </span>
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

      {/* Cancel Confirmation Popup */}
      {cancelConfirmation.show && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              ​
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Cancel Consultation
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to cancel this consultation?
                        Please note that a 5% cancellation fee will be applied, and the GST amount is non-refundable.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCancelBooking}
                >
                  Confirm Cancellation
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={hideCancelConfirmation}
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationDashboard;