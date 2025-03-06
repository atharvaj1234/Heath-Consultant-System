import React, { useState, useEffect } from "react";
import {
  getAdminUsers,
  getAdminConsultants,
  getAdminBookings,
  approveConsultant,
  declineConsultant,
  getHealthRecords,
  getConsultantDocuments,
  getPayments, // Import the getPayments API
} from "../utils/api";
import { Calendar, Eye, X, Check } from "lucide-react";

import {
  User,
  Calendar as CalendarIcon,
  User as Tool,
  CheckCircle,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"; // Import Recharts components
import axios from "axios";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [healthRecords, setHealthRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payments, setPayments] = useState([]);
  const [earnings, setEarnings] = useState(0);

  const [unapprovedConsultants, setUnapprovedConsultants] = useState([]);

  // New state variables for document popup
  const [selectedConsultantDocuments, setSelectedConsultantDocuments] =
    useState(null);
  const [isDocumentPopupOpen, setIsDocumentPopupOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required. Please login as an admin.");
          return;
        }

        const usersData = await getAdminUsers(token);
        setUsers(usersData);

        const consultantsData = await getAdminConsultants(token);
        setConsultants(consultantsData);

        const bookingsData = await getAdminBookings(token);
        setBookings(bookingsData);

        // Load Payments
        try {
          const paymentsData = await getPayments(token);
          setPayments(paymentsData);
          console.log(paymentsData)
          const totalEarnings = calculateEarnings(paymentsData);
          setEarnings(totalEarnings)
        } catch (paymentError) {
          setError("Failed to retrieve payments.");
          console.error("Failed to fetch payments:", paymentError);
        }
      } catch (err) {
        setError(
          "Failed to retrieve data. Please ensure you are logged in as admin and try again."
        );
        console.error("Failed to fetch admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter unapproved consultants after initial data load
    if (consultants.length > 0) {
      setUnapprovedConsultants(
        consultants.filter((consultant) => (consultant.isApproved == 0))
      );
    }
  }, [consultants]); // Re-run when consultants change

  const handleApproveConsultant = async (userId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please login as an admin.");
        return;
      }

      await approveConsultant(token, userId);

      // Update the consultants state to reflect the approval
      setConsultants((prevConsultants) =>
        prevConsultants.map((consultant) =>
          consultant.id === userId
            ? { ...consultant, isApproved: 1 }
            : consultant
        )
      );
      setUnapprovedConsultants((prevConsultants) =>
        prevConsultants.filter((consultant) => consultant.id !== userId)
      );
    } catch (err) {
      setError("Failed to approve consultant. Please try again.");
      console.error("Failed to approve consultant:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineConsultant = async (userId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please login as an admin.");
        return;
      }

      await declineConsultant(token, userId);

      // Update the consultants state to reflect the approval
      setConsultants((prevConsultants) =>
        prevConsultants.map((consultant) =>
          consultant.id === userId
            ? { ...consultant, isApproved: 2 }
            : consultant
        )
      );
      setUnapprovedConsultants((prevConsultants) =>
        prevConsultants.filter((consultant) => consultant.id !== userId)
      );
    } catch (err) {
      setError("Failed to approve consultant. Please try again.");
      console.error("Failed to approve consultant:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDetails = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please login.");
        return;
      }

      const data = await getHealthRecords(token, userId);
      setHealthRecords(data[0]);
      console.log(data[0]);
    } catch (err) {
      setError("Failed to retrieve health records. Please try again.");
      setHealthRecords({});
      console.error("Failed to fetch health records:", err);
    }
  };

  const handleOpenDocuments = async (consultantId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please login as an admin.");
        return;
      }

      const documentsData = await getConsultantDocuments(token, consultantId);
      setSelectedConsultantDocuments(documentsData.certificates);
      setIsDocumentPopupOpen(true);
    } catch (err) {
      setError("Failed to retrieve consultant documents. Please try again.");
      console.error("Failed to fetch consultant documents:", err);
    }
  };

  const handleCloseDocuments = () => {
    setIsDocumentPopupOpen(false);
    setSelectedConsultantDocuments(null);
  };

  // --- Start New Functionalities ---
  // Data for Pie Chart
  const userTypeData = [
    { name: "Users", value: users.filter((user) => !user.isConsultant).length },
    { name: "Consultants", value: consultants.length },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // Calculate Earnings
  const calculateEarnings = (paymentsData) => {
    let earnings = 0;
    paymentsData.forEach((payment) => {
      earnings += 25; // Base amount

      if (payment.status === "canceled") { // Assuming a 'status' field
          earnings += payment.amount * 0.05; // 5% of payment
      }
    });
    return earnings;
  };

  // --- End New Functionalities ---

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      {healthRecords?.userId ? (
        <div
          className="fixed top-0 bottom-0 left-0 right-0 flex justify-center items-center min-w-screen z-[99999]"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setHealthRecords({})}
        >
          <div className="rounded-lg bg-gradient-to-r from-blue-500 via-teal-400 to-green-300 p-1">
            <div className="flex justify-center items-center">
              <div className="max-w-6xl bg-white rounded-lg shadow-2xl p-8 space-y-6 transform transition-all hover:shadow-xl w-[40vw]">
                {/* Profile Section */}
                <div className="flex items-center space-x-6">
                  <img
                    src={`http://localhost:5555/${
                      users.find((user) => user.id === healthRecords.userId)
                        ?.profilePicture
                    }`}
                    alt="Profile Picture"
                    className="w-24 h-24 rounded-full object-cover shadow-md"
                  />
                  <div>
                    <h2 className="text-3xl font-semibold text-gray-800">
                      {
                        users.filter(
                          (user) => user.id === healthRecords.userId
                        )[0]?.fullName
                      }
                    </h2>
                    <p className="text-sm text-gray-500">
                      {
                        users.filter(
                          (user) => user.id === healthRecords.userId
                        )[0]?.email
                      }
                      <br />
                      {
                        users.filter(
                          (user) => user.id === healthRecords.userId
                        )[0]?.phone
                      }
                    </p>
                    <p className="text-sm text-gray-600">
                      Blood Group:{" "}
                      <span className="font-bold">
                        {
                          users.filter(
                            (user) => user.id === healthRecords.userId
                          )[0]?.bloodGroup
                        }
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
                    {
                      users.filter(
                        (user) => user.id === healthRecords.userId
                      )[0]?.currentPrescriptions
                    }
                  </p>
                </div>

                {/* Medical History Section */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-gray-700">
                    Medical History
                  </h3>
                  <p className="text-gray-600">
                    {
                      users.filter(
                        (user) => user.id === healthRecords.userId
                      )[0]?.medicalHistory
                    }
                  </p>
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
        ) : (
        healthRecords == undefined && (
          <div
            className="fixed top-0 bottom-0 left-0 right-0 flex justify-center items-center min-w-screen z-[9999]"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => setHealthRecords({})}
          >
            <div className="rounded-lg bg-gradient-to-r from-blue-500 via-teal-400 to-green-300 p-1">
              <div className="flex justify-center items-center">
                <div className="max-w-6xl bg-white rounded-lg shadow-2xl p-8 space-y-6 transform transition-all hover:shadow-xl w-[40vw]">
                  No Records Found
                </div>
              </div>
            </div>
          </div>
        )
      )}

      <section className="max-w-8xl mx-auto">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          Admin Dashboard
        </h2>

        {loading && <p className="text-center">Loading data...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            {/* Dashboard Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* User Statistics */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  User Statistics
                </h3>
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={userTypeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {userTypeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Earnings/Profit Section */}
              <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl shadow-xl p-6 text-white flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Total Earnings
                  </h3>
                  <p className="text-6xl font-bold">
                  ₹{earnings.toFixed(2)}
                  </p>
                </div>
                <div>
                  {/* Add more earnings-related info here if needed */}
                  <p className="text-sm opacity-70">
                    Since last month:{" "}
                    <span className="font-semibold">+15%</span>
                  </p>
                </div>
              </div>

              {/* Bookings Statistics Card */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Booking Statistics
                </h3>
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className="text-gray-600 mb-1">
                      Total Bookings:{" "}
                      <span className="font-semibold">{bookings.length}</span>
                    </p>
                    <p className="text-gray-600 mb-1">
                      Approved Bookings:{" "}
                      <span className="font-semibold">
                        {bookings.filter(
                          (booking) => booking.status === "accepted"
                        ).length}
                      </span>
                    </p>
                    <p className="text-gray-600 mb-1">
                      Pending Bookings:{" "}
                      <span className="font-semibold">
                        {bookings.filter(
                          (booking) => booking.status === "pending"
                        ).length}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Cancelled Bookings:{" "}
                      <span className="font-semibold">
                        {bookings.filter(
                          (booking) => booking.status === "canceled"
                        ).length}
                      </span>
                    </p>
                  </div>
                  {/* Optional: Add a small chart or graph here */}
                  {/* Example: <ResponsiveContainer width="100%" height={50}>...</ResponsiveContainer> */}
                </div>
              </div>
            </div>

            {/* Consultant Approval Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Consultant Approvals
              </h3>
              {unapprovedConsultants.length === 0 ? (
                <p className="text-gray-500">No consultants awaiting approval.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full leading-normal">
                    <thead>
                      <tr className="bg-gray-100 font-semibold">
                        <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                          ID
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                          Name
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                          Email
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {unapprovedConsultants.map((consultant) => (
                        <tr key={consultant.id}>
                          <td className="px-5 py-3 border-b border-gray-200 text-sm">{consultant.id}</td>
                          <td className="px-5 py-3 border-b border-gray-200 text-sm">{consultant.fullName}</td>
                          <td className="px-5 py-3 border-b border-gray-200 text-sm">{consultant.email}</td>
                          <td className="px-5 py-3 border-b border-gray-200 text-sm">
                            <div className="flex flex-row space-x-3">
                            <button
                              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                              onClick={() => handleApproveConsultant(consultant.id)}
                            >
                              Approve
                            </button>
                            <button
                              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                              onClick={() => handleDeclineConsultant(consultant.id)}
                            >
                              Reject
                            </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

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
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {user.id}
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {user.fullName}
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {user.email}
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {user.role}
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {
                            <button
                              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                              onClick={() => getDetails(user.id)}
                            >
                              Get Records
                            </button>
                          }
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
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {consultant.id}
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {consultant.fullName}
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {consultant.email}
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {consultant.bio?.length > 10
                            ? consultant.bio.slice(0, 10) + "..."
                            : consultant.bio}
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {consultant.areasOfExpertise}
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {consultant.speciality}
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {consultant.qualification}
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {consultant.bankAccount}
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={() => handleOpenDocuments(consultant.id)}
                          >
                            View Documents
                          </button>
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {consultant.isApproved == 1 ? "Yes" : "No"}
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                        <button
                              className={`text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${consultant.isApproved == 1 ? "bg-red-500 hover:bg-red-700" : "bg-green-500 hover:bg-green-700"}`}
                              onClick={() => consultant.isApproved == 1 ? handleDeclineConsultant(consultant.id) : handleApproveConsultant(consultant.id)}
                            >
                              {consultant.isApproved == 1 ? <X/> : <Check/>}
                            </button>
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
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {booking.id}
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {booking.userId}
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {booking.consultantId}
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {booking.date}
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {booking.time}
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 text-sm">
                          {booking.status}
                        </td>
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

      {/* Document Popup */}
      {isDocumentPopupOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-opacity-75 flex justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="bg-white rounded-lg p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Consultant Documents
            </h2>
            {selectedConsultantDocuments ? (
              <ul>
                {selectedConsultantDocuments.map((document, index) => (
                  <li key={index} className="mb-2">
                    <a
                      href={`http://localhost:5555/${document.path}`} // Adjust URL if needed
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {document.name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No documents found.</p>
            )}
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mt-4"
              onClick={handleCloseDocuments}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;