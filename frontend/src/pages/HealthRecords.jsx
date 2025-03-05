import React, { useState, useEffect } from 'react';
import { getHealthRecords, createHealthRecord } from '../utils/api';
import { FilePlus, FileText } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-300 to-purple-400 py-12 px-6">
      <div className="container mx-auto">
        {/* Medical History */}
        <section className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-semibold text-gray-800 flex items-center">
              <FileText className="inline-block h-8 w-8 mr-2 text-green-500" />
              My Health Records
            </h2>
          </div>

          {loading && <p className="text-center text-gray-600">Loading health records...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {healthRecords.length === 0 && !loading && !error ? (
            <p className="text-center text-gray-600">No health records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Record ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medical History
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ongoing Treatments
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prescriptions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {healthRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{record.medicalHistory}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{record.ongoingTreatments}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{record.prescriptions}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Add Record Form */}
        <section className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <FilePlus className="inline-block h-6 w-6 mr-2 text-green-500" />
              Add New Health Record
            </h2>
          </div>


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
              className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-600 hover:to-green-400 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors duration-300"
            >
              Add Record
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default HealthRecords;