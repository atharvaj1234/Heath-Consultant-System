import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-10">
      {/* Privacy Policy Text */}
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
          Privacy Policy
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Your privacy is important to us. It is Health Consultant's policy to
          respect your privacy regarding any information we may collect from you
          across our website,{' '}
          <a href="/" className="text-blue-500 hover:underline">
            healthconsultant.com
          </a>
          , and other sites we own and operate.
        </p>

        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          Information We Collect
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          We collect information in the following ways:
        </p>
        <ul className="list-disc pl-5 mb-4">
          <li>
            <strong>Information you directly provide to us</strong>: When you register
            on our website, we may ask for your name, email address, phone
            number, etc.
          </li>
          <li>
            <strong>Information automatically collected</strong>: When you visit our
            website, we may automatically collect certain information such as
            your IP address, device type, browser type, etc.
          </li>
        </ul>

        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          How We Use Your Information
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          We may use the information we collect from you to:
        </p>
        <ul className="list-disc pl-5 mb-4">
          <li>Provide, operate, and maintain our website</li>
          <li>Improve, personalize, and expand our website</li>
          <li>Understand and analyze how you use our website</li>
          <li>Develop new products, services, features, and functionality</li>
          <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
        </ul>

        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          Sharing Your Information
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          We may share your information with third parties in the following
          circumstances:
        </p>
        <ul className="list-disc pl-5 mb-4">
          <li>With your consent</li>
          <li>With service providers who perform services on our behalf</li>
          <li>For legal reasons</li>
        </ul>

        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          Security
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          We take reasonable measures to protect your information from
          unauthorized access, use, or disclosure.
        </p>

        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          Changes to This Privacy Policy
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          We may update our Privacy Policy from time to time. We will notify you
          of any changes by posting the new Privacy Policy on this page.
        </p>

        <p className="text-gray-700 leading-relaxed">
          This policy is effective as of June 13, 2024.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;