import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConsultantProfile, updateConsultantProfile } from '../utils/api';
import { Edit, User, Calendar } from 'lucide-react';

const ConsultantProfile = () => {
  const [specialty, setSpecialty] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [availability, setAvailability] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
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
        setAvailability(data.availability);
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

      await updateConsultantProfile(token, specialty, qualifications, availability);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update consultant profile. Please try again.');
      console.error('Consultant profile update failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
          Consultant Profile
        </h2>

        {loading && <p className="text-center">Loading profile information...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <div>
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="specialty" className="block text-gray-700 text-sm font-bold mb-2">
                    Specialty
                  </label>
                  <input
                    type="text"
                    id="specialty"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="qualifications" className="block text-gray-700 text-sm font-bold mb-2">
                    Qualifications
                  </label>
                  <input
                    type="text"
                    id="qualifications"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="availability" className="block text-gray-700 text-sm font-bold mb-2">
                    Availability
                  </label>
                  <input
                    type="text"
                    id="availability"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="e.g., Mon-Fri, 9am-5pm"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                  />
                </div>

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
                  <p className="text-gray-700 font-semibold">Specialty: {specialty}</p>
                </div>
                <div className="flex items-center mb-4">
                  <User className="h-6 w-6 mr-2 text-gray-500" />
                  <p className="text-gray-700 font-semibold">Qualifications: {qualifications}</p>
                </div>
                <div className="flex items-center mb-4">
                  <Calendar className="h-6 w-6 mr-2 text-gray-500" />
                  <p className="text-gray-700 font-semibold">Availability: {availability}</p>
                </div>

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

export default ConsultantProfile;
