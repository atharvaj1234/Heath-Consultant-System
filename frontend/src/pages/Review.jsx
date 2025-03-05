import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getConsultantById, createReview } from '../utils/api';
import { Star } from 'lucide-react';

const Review = () => {
  const { id } = useParams();
  const [consultant, setConsultant] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchConsultant = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getConsultantById(id);
        console.log(data)
        setConsultant(data);
      } catch (err) {
        setError('Failed to retrieve consultant details. Please try again.');
        setConsultant(null);
        console.error('Failed to fetch consultant:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultant();
  }, [id]);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

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

      await createReview(token, id, rating, reviewText);
      setSuccessMessage('Review submitted successfully!');
      setRating(0);
      setReviewText('');
    } catch (err) {
      setError('Failed to submit review. Please try again.');
      console.error('Review submission failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading review page...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!consultant) {
    return <div className="text-center">Consultant not found.</div>;
  }
   const isLoggedIn = localStorage.getItem('token') !== null;

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      {/* Consultant Information */}
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-2">
          Review for Dr. {consultant.consultant.fullName}
        </h2>
        <p className="text-xl text-gray-700 mt-4">
          Specialty: {consultant.consultant.speciality} <br/>
          Expertise: {consultant.consultant.areasOfExpertise}
        </p>
      </section>

      {/* Review Form */}
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <form onSubmit={handleSubmit}>
          {/* Rating Stars */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Rating:
            </label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`text-3xl ${star <= rating ? 'text-yellow-500' : 'text-gray-400'}`}
                  onClick={() => handleRatingChange(star)}
                >
                  <Star />
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div className="mb-6">
            <label htmlFor="reviewText" className="block text-gray-700 text-sm font-bold mb-2">
              Review:
            </label>
            <textarea
              id="reviewText"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Write your review..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows="4"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors duration-300"
            disabled={!isLoggedIn}
          >
            Submit Review
          </button>
        </form>

        {successMessage && (
          <div className="mt-4 text-green-500">
            {successMessage}
          </div>
        )}
      </section>
    </div>
  );
};

export default Review;