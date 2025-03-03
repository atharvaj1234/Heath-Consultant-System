import React, { useState, useEffect } from 'react';
import { getHealthRecords, createHealthRecord } from '../utils/api';
import { File } from 'lucide-react';

const HealthRecords = () => {
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [ongoingTreatments, setOngoingTreatments] = useState('');
  const [prescriptions, setPrescriptions] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchHealthRecords = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required. Please login.');
          return;
        }

        const data = await getHealthRecords(token);
        setHealthRecords(data);
      } catch (err) {
        setError('Failed to retrieve health records. Please try again.');
        setHealthRecords([]);
        console.error('Failed to fetch health records:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthRecords();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login.');
        return;
      }

      await createHealthRecord(token, medicalHistory, ongoingTreatments, prescriptions);
      setMedicalHistory('');
      setOngoingTreatments('');
      setPrescriptions('');
      setSuccessMessage('Health record added successfully!');

      // Refresh health records after adding a new one
      const data = await getHealthRecords(token);
      setHealthRecords(data);
    } catch (err) {
      setError('Failed to create health record. Please try again.');
      console.error('Failed to create health record:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      {/* Medical History */}
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          My Health Records
        </h2>

        {loading && <p className="text-center">Loading health records...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {healthRecords.length === 0 && !loading && !error ? (
          <p className="text-center">No health records found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {healthRecords.map((record) => (
              <li key={record.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-700">
                      <File className="inline-block h-5 w-5 mr-1" />
                      Record ID: {record.id}
                    </p>
                    <p className="text-gray-600">
                      Medical History: {record.medicalHistory}
                    </p>
                    <p className="text-gray-600">
                      Ongoing Treatments: {record.ongoingTreatments}
                    </p>
                    <p className="text-gray-600">
                      Prescriptions: {record.prescriptions}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add Record Form */}
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Add New Health Record
        </h2>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="medicalHistory" className="block text-gray-700 text-sm font-bold mb-2">
              Medical History
            </label>
            <textarea
              id="medicalHistory"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              rows="4"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="ongoingTreatments" className="block text-gray-700 text-sm font-bold mb-2">
              Ongoing Treatments
            </label>
            <textarea
              id="ongoingTreatments"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={ongoingTreatments}
              onChange={(e) => setOngoingTreatments(e.target.value)}
              rows="4"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="prescriptions" className="block text-gray-700 text-sm font-bold mb-2">
              Prescriptions
            </label>
            <textarea
              id="prescriptions"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={prescriptions}
              onChange={(e) => setPrescriptions(e.target.value)}
              rows="4"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors duration-300"
          >
            Add Record
          </button>
        </form>
      </section>
    </div>
  );
};

export default HealthRecords;