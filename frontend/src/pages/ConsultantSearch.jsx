import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getConsultants } from '../utils/api';

const ConsultantSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConsultants = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getConsultants(specialtyFilter, null, availabilityFilter);
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
  }, [specialtyFilter, availabilityFilter]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredConsultants = consultants.filter(consultant => {
    const fullName = `${consultant.specialty} ${consultant.qualifications}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      {/* Search Bar */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type="search"
              className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search consultants by specialty..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="specialty" className="block text-gray-700 text-sm font-bold mb-2">
              Specialty:
            </label>
            <select
              id="specialty"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >
              <option value="">All Specialties</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
            </select>
          </div>
          <div>
              <label htmlFor="availability" className="block text-gray-700 text-sm font-bold mb-2">
                  Availability:
              </label>
              <select
                  id="availability"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
              >
                  <option value="">All Availability</option>
                  <option value="Mon-Fri">Mon-Fri</option>
                  <option value="Tue-Sat">Tue-Sat</option>
                  <option value="Wed-Sun">Wed-Sun</option>
              </select>
          </div>
        </div>
      </div>

      {/* Consultant List */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          Available Consultants
        </h2>

        {loading && <p className="text-center">Loading consultants...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredConsultants.map((consultant) => (
            <div key={consultant.id} className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <img
                className="w-full h-48 object-cover rounded-t-2xl mb-4"
                src={consultant.imageUrl || "https://placehold.co/600x400"}
                alt={consultant.specialty}
              />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {consultant.specialty}
              </h3>
              <p className="text-gray-600 mb-4">
                Qualifications: {consultant.qualifications}
              </p>
              <Link
                to={`/consultantdetails/${consultant.id}`}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ConsultantSearch;