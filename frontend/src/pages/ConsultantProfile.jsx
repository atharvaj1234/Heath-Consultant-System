import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConsultantProfile, updateConsultantProfile } from '../utils/api';
import { Edit, User, Calendar, GraduationCap, Briefcase, Clock, CheckCircle, XCircle } from 'lucide-react';

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
                setSpecialty(data.speciality); // corrected typo
                setQualifications(data.qualification); //corrected typo
                setAvailability(JSON.parse(data.availability || "{}") || {});
                setProfilePicture(data.profilePicture || "https://placehold.co/256x256");
                setBio(data.bio || "");
                setAreasOfExpertise(data.areasOfExpertise || "");
                setName(data.fullName);

                // Ensure minutes are always 00 on initial load
                Object.keys(availability).forEach(day => {
                    if (availability[day]) {
                        if(availability[day].startTime){
                          availability[day].startTime = availability[day].startTime.slice(0, 2) + ":00";
                        }
                        if(availability[day].endTime){
                          availability[day].endTime = availability[day].endTime.slice(0, 2) + ":00";
                        }

                    }
                });
                setAvailability({...availability});

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

        // Validation: Check if start time is before end time for each day
        for (const day in availability) {
            if (availability.hasOwnProperty(day)) {
                const startTime = availability[day]?.startTime;
                const endTime = availability[day]?.endTime;

                if (startTime && endTime) {
                    if (startTime >= endTime) {
                        window.alert(`Start time must be before end time for ${day}.`);
                        setLoading(false);
                        return;  // Stop the submission if validation fails
                    }
                }
            }
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required. Please login.');
                return;
            }

            // Convert availability back to string for API
            const availabilityString = JSON.stringify(availability);

            await updateConsultantProfile(token, { specialty: specialty, qualifications: qualifications, availability: availabilityString, bio: bio, areasOfExpertise: areasOfExpertise, fullName: name, profilePicture: profilePicture });
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update consultant profile. Please try again.');
            console.error('Consultant profile update failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAvailabilityChange = (day, field, value) => {
        // Ensure minutes are always "00"
        const timeValue = value.slice(0, 2) + ":00";  // Extract hours and set minutes to "00"

        setAvailability(prevAvailability => ({
            ...prevAvailability,
            [day]: {
                ...prevAvailability[day],
                [field]: timeValue,
            },
        }));
    };

    const renderAvailabilityEdit = () => {
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        return (
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Edit Availability</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {daysOfWeek.map(day => (
                        <div key={day} className="bg-white rounded-xl shadow-sm p-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">{day}</label>
                            <div className="flex space-x-2">
                                <select
                                    className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                                    value={(availability[day]?.startTime || '').slice(0,2) || ''} //Only get the hour from the time
                                    onChange={(e) => handleAvailabilityChange(day, 'startTime', e.target.value + ":00")}
                                >
                                  {/* Options for hours (00 - 23) */}
                                  {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(hour => (
                                      <option key={hour} value={hour}>{hour}:00</option>
                                  ))}
                                </select>

                                <select
                                    className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                                    value={(availability[day]?.endTime || '').slice(0,2) || ''} //Only get the hour from the time
                                    onChange={(e) => handleAvailabilityChange(day, 'endTime',  e.target.value + ":00")}
                                >
                                  {/* Options for hours (00 - 23) */}
                                  {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(hour => (
                                      <option key={hour} value={hour}>{hour}:00</option>
                                  ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };



    const renderAvailability = () => {
        return (
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Availability</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(availability).length > 0 ? (
                        Object.entries(availability).map(([day, times]) => (
                            <div key={day} className="bg-indigo-50 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">{day}</p>
                                    <p className="text-xs text-gray-500">{times?.startTime || 'N/A'} - {times?.endTime || 'N/A'}</p>
                                </div>
                                <Clock className="h-5 w-5 text-indigo-500" />
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No availability specified.</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="md:flex">
                    {/* Left Side - Profile Picture and Name */}
                    <div className="md:w-1/3 bg-gradient-to-br from-purple-500 to-indigo-500 text-white py-12 px-6 flex flex-col items-center justify-center">
                        <img className="rounded-full w-40 h-40 shadow-lg mb-4 object-cover object-center" src={`http://localhost:5555/uploads/${profilePicture}`} alt="Profile" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/256x256" }} />
                        <h1 className="text-2xl font-semibold mb-2">{name}</h1>
                        <p className="text-gray-100 text-sm italic">{specialty || 'Specialty Not Specified'}</p>
                    </div>

                    {/* Right Side - Profile Details and Edit Form */}
                    <div className="md:w-2/3 py-8 px-6">
                        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
                            {isEditing ? 'Edit Profile' : 'Consultant Profile'}
                        </h2>

                        {loading && <p className="text-center">Loading profile information...</p>}
                        {error && <p className="text-center text-red-500">{error}</p>}

                        {!loading && !error && (
                            <div>
                                {isEditing ? (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Profile Picture URL</label>
                                            <input
                                                type="text"
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                value={profilePicture}
                                                onChange={(e) => setProfilePicture(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Specialty</label>
                                            <input
                                                type="text"
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                value={specialty}
                                                onChange={(e) => setSpecialty(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Qualifications</label>
                                            <input
                                                type="text"
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                value={qualifications}
                                                onChange={(e) => setQualifications(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Bio</label>
                                            <textarea
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                rows="3"
                                            ></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Areas of Expertise</label>
                                            <textarea
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                value={areasOfExpertise}
                                                onChange={(e) => setAreasOfExpertise(e.target.value)}
                                                rows="3"
                                            ></textarea>
                                        </div>

                                        {renderAvailabilityEdit()}

                                        <div className="flex justify-end space-x-4">
                                            <button
                                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline flex items-center"
                                                type="submit"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Save Changes
                                            </button>
                                            <button
                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline flex items-center"
                                                type="button"
                                                onClick={handleCancelClick}
                                            >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div>
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-700 flex items-center mb-2"><User className="w-5 h-5 mr-2 text-gray-500" />Bio</h3>
                                                <p className="text-gray-600">{bio || 'No bio available.'}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-700 flex items-center mb-2"><Briefcase className="w-5 h-5 mr-2 text-gray-500" />Areas of Expertise</h3>
                                                <p className="text-gray-600">{areasOfExpertise || 'No expertise specified.'}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-700 flex items-center mb-2"><GraduationCap className="w-5 h-5 mr-2 text-gray-500" />Qualifications</h3>
                                                <p className="text-gray-600">{qualifications || 'No qualifications specified.'}</p>
                                            </div>
                                            {renderAvailability()}
                                        </div>

                                        <div className="mt-6 text-right">
                                            <button
                                                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline flex items-center ml-auto"
                                                type="button"
                                                onClick={handleEditClick}
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit Profile
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsultantProfile;