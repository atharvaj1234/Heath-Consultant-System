
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../utils/api';
import { User, Mail, Edit } from 'lucide-react';

const UserProfile = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isConsultant, setIsConsultant] = useState(false);
  const [bloodGroup, setBloodGroup] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [currentPrescriptions, setCurrentPrescriptions] = useState('');
  const [contactInformation, setContactInformation] = useState('');
  const [areasOfExpertise, setAreasOfExpertise] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required. Please login.');
          return;
        }

        const data = await getProfile(token);
        setFullName(data.fullName);
        setEmail(data.email);
        setIsConsultant(data.isConsultant === 1);
        setBloodGroup(data.bloodGroup || '');
        setMedicalHistory(data.medicalHistory || '');
        setCurrentPrescriptions(data.currentPrescriptions || '');
        setContactInformation(data.contactInformation || '');
        setAreasOfExpertise(data.areasOfExpertise || '');
      } catch (err) {
        setError('Failed to retrieve profile. Please try again.');
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login.');
        return;
      }

      let updatedProfile;
      if (!isConsultant) {
        updatedProfile = await updateProfile(token, fullName, email, bloodGroup, medicalHistory, currentPrescriptions, null, null);
      } else {
        updatedProfile = await updateProfile(token, fullName, email, null, null, null, contactInformation, areasOfExpertise);
      }

      console.log('Profile updated successfully:', updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Profile update failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
          User Profile
        </h2>

        {loading && <p className="text-center">Loading profile information...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <div>
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {!isConsultant ? (
                  <>
                    <div className="mb-4">
                      <label htmlFor="bloodGroup" className="block text-gray-700 text-sm font-bold mb-2">
                        Blood Group
                      </label>
                      <input
                        type="text"
                        id="bloodGroup"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="medicalHistory" className="block text-gray-700 text-sm font-bold mb-2">
                        Medical History
                      </label>
                      <textarea
                        id="medicalHistory"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={medicalHistory}
                        onChange={(e) => setMedicalHistory(e.target.value)}
                        rows="3"
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="currentPrescriptions" className="block text-gray-700 text-sm font-bold mb-2">
                        Current Prescriptions
                      </label>
                      <textarea
                        id="currentPrescriptions"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={currentPrescriptions}
                        onChange={(e) => setCurrentPrescriptions(e.target.value)}
                        rows="3"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <label htmlFor="contactInformation" className="block text-gray-700 text-sm font-bold mb-2">
                        Contact Information
                      </label>
                      <input
                        type="text"
                        id="contactInformation"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={contactInformation}
                        onChange={(e) => setContactInformation(e.target.value)}
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="areasOfExpertise" className="block text-gray-700 text-sm font-bold mb-2">
                        Areas of Expertise
                      </label>
                      <textarea
                        id="areasOfExpertise"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={areasOfExpertise}
                        onChange={(e) => setAreasOfExpertise(e.target.value)}
                        rows="3"
                      />
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline"
                    type="submit"
                  >
                    Save Changes
                  </button>
                  <button
                    className="bg-gray-400 hover:bg-gray-500 text-gray-700 font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline"
                    type="button"
                    onClick={handleCancelClick}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex items-center mb-4">
                  <User className="h-6 w-6 mr-2 text-gray-500" />
                  <p className="text-gray-700 font-semibold">Full Name: {fullName}</p>
                </div>
                <div className="flex items-center mb-4">
                  <Mail className="h-6 w-6 mr-2 text-gray-500" />
                  <p className="text-gray-700 font-semibold">Email: {email}</p>
                </div>
                {!isConsultant ? (
                  <>
                    <div className="flex items-center mb-4">
                      <span className="h-6 w-6 mr-2 text-gray-500">B</span>
                      <p className="text-gray-700 font-semibold">Blood Group: {bloodGroup}</p>
                    </div>
                    <div className="flex items-center mb-4">
                      <span className="h-6 w-6 mr-2 text-gray-500">MH</span>
                      <p className="text-gray-700 font-semibold">Medical History: {medicalHistory}</p>
                    </div>
                    <div className="flex items-center mb-4">
                      <span className="h-6 w-6 mr-2 text-gray-500">CP</span>
                      <p className="text-gray-700 font-semibold">Current Prescriptions: {currentPrescriptions}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center mb-4">
                      <span className="h-6 w-6 mr-2 text-gray-500">CI</span>
                      <p className="text-gray-700 font-semibold">Contact Information: {contactInformation}</p>
                    </div>
                    <div className="flex items-center mb-4">
                      <span className="h-6 w-6 mr-2 text-gray-500">AE</span>
                      <p className="text-gray-700 font-semibold">Areas of Expertise: {areasOfExpertise}</p>
                    </div>
                  </>
                )}

                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline flex items-center"
                  type="button"
                  onClick={handleEditClick}
                >
                  <Edit className="h-5 w-5 mr-2" />
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
export default UserProfile;
