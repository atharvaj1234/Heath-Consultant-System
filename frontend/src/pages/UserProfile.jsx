import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../utils/api';
import { User, Mail, Edit, Phone, Text, Image, Droplets } from 'lucide-react';

const UserProfile = ({ setProfilePicture: setAppProfilePicture }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isConsultant, setIsConsultant] = useState(false);
  const [bloodGroup, setBloodGroup] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [currentPrescriptions, setCurrentPrescriptions] = useState('');
  const [phone, setPhone] = useState('');
  const [areasOfExpertise, setAreasOfExpertise] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [newProfilePicture, setNewProfilePicture] = useState(null);
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
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setProfilePicture(data.profilePicture || '');
        setAppProfilePicture(data.profilePicture || '');

      } catch (err) {
        setError('Failed to retrieve profile. Please try again.');
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setAppProfilePicture]);

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

      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('email', email);

      if (!isConsultant) {
        formData.append('bloodGroup', bloodGroup);
        formData.append('medicalHistory', medicalHistory);
        formData.append('currentPrescriptions', currentPrescriptions);
      } else {
        formData.append('phone', phone);
        formData.append('areasOfExpertise', areasOfExpertise);
      }

      if (newProfilePicture) {
        formData.append('profilePicture', newProfilePicture);
      }

      const updatedProfile = await updateProfile(formData);

      setProfilePicture(updatedProfile.profilePicture);
      setAppProfilePicture(updatedProfile.profilePicture)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-300 to-purple-400 py-12 px-4 sm:px-6 lg:px-8">
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-400 to-blue-500 py-6">
          <h2 className="text-3xl font-semibold text-white text-center">
            User Profile
          </h2>
        </div>

        <div className="p-8">
          {loading && <p className="text-center text-gray-600">Loading profile information...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && !error && (
            <div>
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">
                      <User className="h-4 w-4 mr-1 inline-block align-middle" /> Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                      <Mail className="h-4 w-4 mr-1 inline-block align-middle" /> Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                   <div className="mb-4">
                    <label htmlFor="profilePicture" className="block text-gray-700 text-sm font-bold mb-2">
                      <Image className="h-4 w-4 mr-1 inline-block align-middle" /> Change Profile Picture
                    </label>
                    <input
                      type="file"
                      id="profilePicture"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      onChange={(e) => setNewProfilePicture(e.target.files[0])}
                    />
                  </div>
                  {!isConsultant ? (
                    <>
                      <div className="mb-4">
                        <label htmlFor="bloodGroup" className="block text-gray-700 text-sm font-bold mb-2">
                          <Droplets className="h-4 w-4 mr-1 inline-block align-middle" /> Blood Group
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
                          <Text className="h-4 w-4 mr-1 inline-block align-middle" /> Medical History
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
                          <Text className="h-4 w-4 mr-1 inline-block align-middle" /> Current Prescriptions
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
                        <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
                          <Phone className="h-4 w-4 mr-1 inline-block align-middle" /> Contact Information
                        </label>
                        <input
                          type="text"
                          id="phone"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>

                      <div className="mb-4">
                        <label htmlFor="areasOfExpertise" className="block text-gray-700 text-sm font-bold mb-2">
                          <Text className="h-4 w-4 mr-1 inline-block align-middle" /> Areas of Expertise
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
                  <div className="flex items-center justify-end">
                    <button
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                      type="submit"
                    >
                      Save Changes
                    </button>
                    <button
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      type="button"
                      onClick={handleCancelClick}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex items-center justify-center mb-6">
                     <img
                        className="rounded-full w-32 h-32 object-cover"
                        src={profilePicture || "https://placehold.co/128x128"}
                        alt="Profile Picture"
                    />
                  </div>
                  <div className="flex items-center mb-4">
                    <User className="h-5 w-5 mr-2 text-gray-500" />
                    <p className="text-gray-700 font-medium whitespace-nowrap">Full Name: {fullName}</p>
                  </div>
                  <div className="flex items-center mb-4">
                    <Mail className="h-5 w-5 mr-2 text-gray-500" />
                    <p className="text-gray-700 font-medium whitespace-nowrap">Email: {email}</p>
                  </div>
                  {!isConsultant ? (
                    <>
                      <div className="flex items-center mb-4">
                        <Droplets className="h-5 w-5 mr-2 text-gray-500" />
                        <p className="text-gray-700 font-medium whitespace-nowrap">Blood Group: {bloodGroup || 'N/A'}</p>
                      </div>
                      <div className="flex items-start mb-4">
                        <Text className="h-5 w-5 mt-1 mr-2 text-gray-500" />
                        <p className="text-gray-700 font-medium">Medical History: {medicalHistory || 'N/A'}</p>
                      </div>
                      <div className="flex items-start mb-4">
                        <Text className="h-5 w-5 mt-1 mr-2 text-gray-500" />
                        <p className="text-gray-700 font-medium">Current Prescriptions: {currentPrescriptions || 'N/A'}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center mb-4">
                        <Phone className="h-5 w-5 mr-2 text-gray-500" />
                        <p className="text-gray-700 font-medium whitespace-nowrap">Contact Information: {phone || 'N/A'}</p>
                      </div>
                      <div className="flex items-start mb-4">
                        <Text className="h-5 w-5 mt-1 mr-2 text-gray-500" />
                        <p className="text-gray-700 font-medium">Areas of Expertise: {areasOfExpertise || 'N/A'}</p>
                      </div>
                    </>
                  )}

                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                    type="button"
                    onClick={handleEditClick}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default UserProfile;