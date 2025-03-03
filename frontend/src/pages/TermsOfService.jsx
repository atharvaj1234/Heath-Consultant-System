import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-10">
      {/* Terms of Service Text */}
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
          Terms of Service
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Welcome to Health Consultant! These terms of service (&quot;Terms&quot;)
          govern your use of our website,{' '}
          <a href="/" className="text-blue-500 hover:underline">
            healthconsultant.com
          </a>
          , and related services. By accessing or using our services, you agree
          to be bound by these Terms.
        </p>

        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          1. Acceptance of Terms
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          By using our services, you agree to these Terms and our Privacy
          Policy. If you do not agree, please do not use our services.
        </p>

        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          2. Description of Service
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          Health Consultant provides a platform to connect users with healthcare
          professionals for consultations and health advice.
        </p>

        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          3. User Accounts
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          You may need to register for an account to access certain features.
          You are responsible for maintaining the confidentiality of your
          account and password.
        </p>

        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          4. User Conduct
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          You agree not to use our services for any unlawful purpose or in any
          way that could harm our services or other users.
        </p>

        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          5. Disclaimer
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          The information provided on Health Consultant is for informational
          purposes only and does not constitute medical advice. Always consult
          with a qualified healthcare professional for any health concerns.
        </p>

        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          6. Limitation of Liability
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          Health Consultant is not liable for any direct, indirect, incidental,
          or consequential damages resulting from your use of our services.
        </p>

        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          7. Changes to These Terms
        </h3>
        <p className="text-gray-700 leading-relaxed">
          We may update these Terms from time to time. We will notify you of
          any changes by posting the new Terms on this page.
        </p>
      </section>
    </div>
  );
};

export default TermsOfService;