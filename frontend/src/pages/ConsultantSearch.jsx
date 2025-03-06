import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, MapPin, Badge, Briefcase, Mail } from 'lucide-react';
import { getConsultants } from '../utils/api';

const ConsultantSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('');
    const [consultants, setConsultants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token')

    useEffect(() => {
        const fetchConsultants = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getConsultants(specialtyFilter, null, null); // Removed availability filter
                setConsultants(data);
            } catch (err) {
                setError('Failed to retrieve consultants. Please try again.');
                setConsultants([]);
                console.error('Failed to fetch consultants:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchConsultants();
    }, [specialtyFilter]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredConsultants = consultants.filter(consultant => {
        const fullName = `${consultant.fullName} ${consultant.speciality} ${consultant.qualification} ${consultant.areasOfExpertise}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-16">

            {/* Hero Section */}
            <div className="container mx-auto px-4 mb-12 text-center">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Find the Right Consultant</h1>
                <p className="text-lg text-gray-600">Search and connect with experienced professionals in various specialties.</p>
            </div>

            {/* Search Bar */}
            <div className="container mx-auto px-4 mb-8">
                <div className="relative max-w-3xl mx-auto">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                        type="search"
                        className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-xl bg-white focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Search consultants by name, specialty, or expertise..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            {/* Filter Options */}
            <div className="container mx-auto px-4 mb-12">
                <div className="flex justify-center">
                    <div className="w-full max-w-md">
                        <label htmlFor="specialty" className="block text-gray-700 text-sm font-bold mb-2 text-center">
                            Filter by Specialty:
                        </label>
                        <div className="relative">
                            <select
                                id="specialty"
                                className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center"
                                value={specialtyFilter}
                                onChange={(e) => setSpecialtyFilter(e.target.value)}
                            >
                                <option value="">All Specialties</option>
                                <option value="Cardiology">Cardiology</option>
                                <option value="Neurology">Neurology</option>
                                <option value="Pediatrics">Pediatrics</option>
                                <option value="ENT">ENT</option>
                                <option value="Dermatology">Dermatology</option>
                                <option value="Oncology">Oncology</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                {/* Down Arrow Icon (You can use Lucide React's ChevronDown) */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Consultant List */}
            <section className="container mx-auto px-4">
                <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">
                    Meet Our Consultants
                </h2>

                {loading && <p className="text-center">Loading consultants...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredConsultants.map((consultant) => (
                        <div key={consultant.id} className="rounded-2xl overflow-hidden shadow-md transition-shadow duration-300 hover:shadow-lg bg-gradient-to-br from-white to-gray-100">
                            <img
                                className="w-full h-52 object-cover object-center"
                                src={`http://localhost:5555/${consultant.profilePicture}`}
                                alt={consultant.fullName}
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400" }}
                            />
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                                    <User className="w-4 h-4 mr-2 text-gray-600" />
                                    {consultant.fullName}
                                </h3>
                                <p className="text-gray-600 mb-3 flex items-center">
                                    <Badge className="w-4 h-4 mr-2 text-gray-500" />
                                    {consultant.speciality || 'Specialty Not Specified'}
                                </p>
                                <p className="text-gray-600 mb-3 flex items-center">
                                    <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                                    {consultant.qualification || 'Qualification Not Specified'}
                                </p>
                                <p className="text-gray-600 mb-3 flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                    Expertise: {consultant.areasOfExpertise || 'N/A'}
                                </p>
                                <p className="text-gray-700 mb-4">
                                    {consultant.bio ? consultant.bio.substring(0, 100) + '...' : 'No bio available.'}
                                </p>
                                <div className="flex justify-between items-center">
                                    <Link
                                        to={token ? `/consultantdetails/${consultant.id}` : '/login'}
                                        className="inline-flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition-colors duration-300"
                                    >
                                        View Profile
                                    </Link>
                                    <a href={`mailto:${consultant.email}`} className="text-indigo-600 hover:text-indigo-800 flex items-center">
                                        <Mail className="w-4 h-4 mr-1" />
                                        Email
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredConsultants.length === 0 && !loading && (
                    <p className="text-center text-gray-500 mt-8">No consultants found matching your criteria.</p>
                )}
            </section>
        </div>
    );
};

export default ConsultantSearch;