import React from 'react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-200 p-10">
      {/* Company Overview */}
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-12">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
          Our Mission
        </h2>
        <p className="text-gray-700 leading-relaxed text-lg">
          At Health Consultant, our mission is to connect individuals with the
          best healthcare professionals, providing personalized and accessible
          health advice. We believe in empowering our users to take control of
          their health journey with reliable and expert guidance.
        </p>
      </section>

      {/* Team Section */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          Meet Our Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Team Member 1 */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <img
              className="rounded-full w-32 h-32 mx-auto mb-4"
              src="https://placehold.co/128x128"
              alt="Team Member"
            />
            <h3 className="text-xl font-semibold text-gray-700 text-center mb-2">
              Dr. Emily Carter
            </h3>
            <p className="text-gray-600 text-center">
              CEO &amp; Founder
            </p>
            <p className="text-gray-600 text-center mt-2">
              "Passionate about improving healthcare access for everyone."
            </p>
          </div>

          {/* Team Member 2 */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <img
              className="rounded-full w-32 h-32 mx-auto mb-4"
              src="https://placehold.co/128x128"
              alt="Team Member"
            />
            <h3 className="text-xl font-semibold text-gray-700 text-center mb-2">
              Dr. David Miller
            </h3>
            <p className="text-gray-600 text-center">
              Chief Medical Officer
            </p>
            <p className="text-gray-600 text-center mt-2">
              "Committed to providing the highest quality medical advice."
            </p>
          </div>

          {/* Team Member 3 */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <img
              className="rounded-full w-32 h-32 mx-auto mb-4"
              src="https://placehold.co/128x128"
              alt="Team Member"
            />
            <h3 className="text-xl font-semibold text-gray-700 text-center mb-2">
              Sarah Johnson
            </h3>
            <p className="text-gray-600 text-center">
              Head of User Experience
            </p>
            <p className="text-gray-600 text-center mt-2">
              "Dedicated to creating a user-friendly and seamless platform."
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;