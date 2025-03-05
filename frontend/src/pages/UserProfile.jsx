import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../utils/api';
import { User, Mail, Edit, Phone, Text, Image, Droplets, CheckCircle, XCircle } from 'lucide-react';

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
                setProfilePicture(data.profilePicture || "https://placehold.co/200x200"); // Added placeholder
                setAppProfilePicture(data.profilePicture || "https://placehold.co/200x200");  // Added placeholder

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
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-400 to-purple-500 py-8 px-4 sm:px-6">
                    <h2 className="text-3xl font-extrabold text-white text-center tracking-tight">Your Profile</h2>
                    <p className="mt-2 text-md text-yellow-100 text-center">Manage your account information and settings.</p>
                </div>

                {/* Main Content Section */}
                <div className="p-8 sm:p-10">
                    {loading && <p className="text-center text-gray-600">Loading profile information...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}

                    {!loading && !error && (
                        <div>
                            {isEditing ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Full Name */}
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                            <User className="h-5 w-5 mr-1 -mt-0.5 inline-block align-middle" />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            <Mail className="h-5 w-5 mr-1 -mt-0.5 inline-block align-middle" />
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>

                                    {/* Profile Picture */}
                                    <div>
                                        <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">
                                            <Image className="h-5 w-5 mr-1 -mt-0.5 inline-block align-middle" />
                                            Change Profile Picture
                                        </label>
                                        <input
                                            type="file"
                                            id="profilePicture"
                                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-200 file:text-orange-700 hover:file:bg-orange-300"
                                            onChange={(e) => setNewProfilePicture(e.target.files[0])}
                                        />
                                    </div>

                                    {/* Conditional Fields based on Consultant Status */}
                                    {!isConsultant ? (
                                        <>
                                            {/* Blood Group */}
                                            <div>
                                                <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">
                                                    <Droplets className="h-5 w-5 mr-1 -mt-0.5 inline-block align-middle" />
                                                    Blood Group
                                                </label>
                                                <input
                                                    type="text"
                                                    id="bloodGroup"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                                    value={bloodGroup}
                                                    onChange={(e) => setBloodGroup(e.target.value)}
                                                />
                                            </div>

                                            {/* Medical History */}
                                            <div>
                                                <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">
                                                    <Text className="h-5 w-5 mr-1 -mt-0.5 inline-block align-middle" />
                                                    Medical History
                                                </label>
                                                <textarea
                                                    id="medicalHistory"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                                    value={medicalHistory}
                                                    onChange={(e) => setMedicalHistory(e.target.value)}
                                                    rows="3"
                                                />
                                            </div>

                                            {/* Current Prescriptions */}
                                            <div>
                                                <label htmlFor="currentPrescriptions" className="block text-sm font-medium text-gray-700">
                                                    <Text className="h-5 w-5 mr-1 -mt-0.5 inline-block align-middle" />
                                                    Current Prescriptions
                                                </label>
                                                <textarea
                                                    id="currentPrescriptions"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                                    value={currentPrescriptions}
                                                    onChange={(e) => setCurrentPrescriptions(e.target.value)}
                                                    rows="3"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Phone */}
                                            <div>
                                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                                    <Phone className="h-5 w-5 mr-1 -mt-0.5 inline-block align-middle" />
                                                    Contact Number
                                                </label>
                                                <input
                                                    type="text"
                                                    id="phone"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                />
                                            </div>

                                            {/* Areas of Expertise */}
                                            <div>
                                                <label htmlFor="areasOfExpertise" className="block text-sm font-medium text-gray-700">
                                                    <Text className="h-5 w-5 mr-1 -mt-0.5 inline-block align-middle" />
                                                    Areas of Expertise
                                                </label>
                                                <textarea
                                                    id="areasOfExpertise"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                                    value={areasOfExpertise}
                                                    onChange={(e) => setAreasOfExpertise(e.target.value)}
                                                    rows="3"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                        >
                                            <CheckCircle className="h-5 w-5 mr-2" />
                                            Save Changes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancelClick}
                                            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                        >
                                            <XCircle className="h-5 w-5 mr-2" />
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                // Display Mode
                                <div className="space-y-6">
                                    {/* Profile Picture */}
                                    <div className="flex justify-center">
                                        <img
                                            className="rounded-full w-32 h-32 object-cover shadow-md"
                                            src={`http://localhost:5555/uploads/${profilePicture}`}
                                            alt="Profile"
                                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/200x200"; }}
                                        />
                                    </div>

                                    {/* Full Name and Email */}
                                    <div className="space-y-1">
                                        <div className="flex items-center text-gray-700">
                                            <User className="h-5 w-5 mr-2" />
                                            <span className="font-semibold">Full Name:</span>
                                            <span className="ml-1">{fullName}</span>
                                        </div>
                                        <div className="flex items-center text-gray-700">
                                            <Mail className="h-5 w-5 mr-2" />
                                            <span className="font-semibold">Email:</span>
                                            <span className="ml-1">{email}</span>
                                        </div>
                                    </div>

                                    {/* Conditional Fields Based on Consultant Status */}
                                    {!isConsultant ? (
                                        <>
                                            <div className="flex items-center text-gray-700">
                                                <Droplets className="h-5 w-5 mr-2" />
                                                <span className="font-semibold">Blood Group:</span>
                                                <span className="ml-1">{bloodGroup || 'Not specified'}</span>
                                            </div>
                                            <div className="text-gray-700">
                                                <Text className="h-5 w-5 mr-2 inline-block align-middle" />
                                                <span className="font-semibold">Medical History:</span>
                                                <p className="ml-7 mt-1">{medicalHistory || 'Not specified'}</p>
                                            </div>
                                            <div className="text-gray-700">
                                                <Text className="h-5 w-5 mr-2 inline-block align-middle" />
                                                <span className="font-semibold">Current Prescriptions:</span>
                                                <p className="ml-7 mt-1">{currentPrescriptions || 'Not specified'}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center text-gray-700">
                                                <Phone className="h-5 w-5 mr-2" />
                                                <span className="font-semibold">Contact Number:</span>
                                                <span className="ml-1">{phone || 'Not specified'}</span>
                                            </div>
                                            <div className="text-gray-700">
                                                <Text className="h-5 w-5 mr-2 inline-block align-middle" />
                                                <span className="font-semibold">Areas of Expertise:</span>
                                                <p className="ml-7 mt-1">{areasOfExpertise || 'Not specified'}</p>
                                            </div>
                                        </>
                                    )}

                                    {/* Edit Button */}
                                    <div className="text-right">
                                        <button
                                            type="button"
                                            onClick={handleEditClick}
                                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <Edit className="h-5 w-5 mr-2" />
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
    );
};

export default UserProfile;