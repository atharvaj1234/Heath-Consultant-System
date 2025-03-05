import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConsultantProfile, updateConsultantProfile } from '../utils/api';
import { Edit, User, Calendar, GraduationCap, Briefcase, Clock } from 'lucide-react';

const ConsultantProfile = () => {
  const [specialty, setSpecialty] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [availability, setAvailability] = useState({});
  const [bio, setBio] = useState('');
  const [areasOfExpertise, setAreasOfExpertise] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  const [name, setName] = useState('');
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

        const data = await getConsultantProfile(token);
        setSpecialty(data.specialty);
        setQualifications(data.qualifications);
        setAvailability(JSON.parse(data.availability) || {});
        setProfilePicture(data.profilePicture || "https://placehold.co/128x128");
        setBio(data.bio);
        setAreasOfExpertise(data.areasOfExpertise);
        setName(data.fullName);
      } catch (err) {
        setError('Failed to retrieve consultant profile. Please try again.');
        console.error('Failed to fetch consultant profile:', err);
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

      // Convert availability back to string for API
      const availabilityString = JSON.stringify(availability);

      await updateConsultantProfile(token, {specialty:specialty, qualifications:qualifications, availability:availabilityString, bio:bio, areasOfExpertise:areasOfExpertise, fullName:name, profilePicture:profilePicture});
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update consultant profile. Please try again.');
      console.error('Consultant profile update failed:', err);
    } finally {
      setLoading(false);
    }
  };

    const handleAvailabilityChange = (day, field, value) => {
        setAvailability(prevAvailability => ({
            ...prevAvailability,
            [day]: {
                ...prevAvailability[day],
                [field]: value,
            },
        }));
    };

    const renderAvailabilityEdit = () => {
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        return (
            <>
                <h2 className="text-gray-700 text-sm font-bold mb-2">Availability</h2>
                <div className="bg-white rounded-lg shadow-md p-4 w-full max-w-md mx-auto">
                    {daysOfWeek.map(day => (
                        <div key={day} className="mb-4">
                            <label className="block text-gray-700 text-xs font-bold mb-1">{day}</label>
                            <div className="flex space-x-2">
                                <input
                                    type="time"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-xs"
                                    value={availability[day]?.startTime || ''}
                                    onChange={(e) => handleAvailabilityChange(day, 'startTime', e.target.value)}
                                />
                                <input
                                    type="time"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-xs"
                                    value={availability[day]?.endTime || ''}
                                    onChange={(e) => handleAvailabilityChange(day, 'endTime', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    };



  const renderAvailability = () => {
    return (
      <>
      <h2 className="text-gray-700 font-semibold">Availability</h2>
    <div className="bg-white rounded-lg shadow-md p-4 w-full max-w-md mx-auto">
      <div className="space-y-2 flex flex-row flex-wrap space-x-4">
        {Object.entries(availability).map(([day, times]) => (
          <div key={day} className="flex items-center gap-3 bg-gray-50 rounded-md p-2 border border-gray-200">
            <Clock className="h-5 w-5 text-blue-500" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">{day}</span>
              <span className="text-xs text-gray-500">{times?.startTime || 'N/A'} - {times?.endTime || 'N/A'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
    )
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 to-purple-400 p-10 flex items-center justify-center">
      <section className="max-w-4xl w-full bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
          Consultant Profile
        </h2>

        {loading && <p className="text-center">Loading profile information...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <div>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Profile Picture URL</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    value={profilePicture}
                    onChange={(e) => setProfilePicture(e.target.value)}
                  />
                </div>

                 <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Specialty</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Qualifications</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                  />
                </div>

                  <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Bio</label>
                      <textarea
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                      />
                  </div>

                  <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Areas of Expertise</label>
                      <textarea
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                          value={areasOfExpertise}
                          onChange={(e) => setAreasOfExpertise(e.target.value)}
                      />
                  </div>

                  {renderAvailabilityEdit()}

                <div className="flex items-center justify-between">
                  <button
                    className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-full transition"
                    type="submit"
                  >
                    Save Changes
                  </button>
                  <button
                    className="bg-gray-400 hover:bg-gray-500 text-gray-700 font-bold py-3 px-6 rounded-full transition"
                    type="button"
                    onClick={handleCancelClick}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex flex-col items-center mb-6">
                  <img className="rounded-full w-32 h-32 shadow-lg" src={profilePicture} alt="Profile" />
                  <p className="text-xl font-semibold mt-4">{name}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-6 w-6 text-blue-600" />
                    <p className="text-gray-700 font-semibold">Bio: {bio}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                    <p className="text-gray-700 font-semibold">Expertise: {areasOfExpertise}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                    <p className="text-gray-700 font-semibold">Specialty: {specialty}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                    <p className="text-gray-700 font-semibold">Qualifications: {qualifications}</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-6 w-6 text-blue-600" />
                    <div className="space-y-1">{renderAvailability()}</div>
                  </div>
                </div>

                <button
                  className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 mt-6 transition"
                  type="button"
                  onClick={handleEditClick}
                >
                  <Edit className="h-5 w-5" />
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

export default ConsultantProfile;