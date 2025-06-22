import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-300 font-sans">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4 text-sm text-gray-600">Last updated: April 5, 2025</p>

      <p className="mb-6">
        Welcome to Qlue! This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform. By accessing or using our website or mobile app, you agree to the terms of this policy.
      </p>

      <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>Personal Information:</strong> Name, email address, profile picture (via Google Sign-In).</li>
        <li><strong>User Content:</strong> Posts, comments, likes, follows, and interactions with other users and products.</li>
        <li><strong>Device & Usage Data:</strong> Device info, IP address, browser type, session logs.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Data</h2>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>To authenticate and personalize your experience.</li>
        <li>To show relevant content, products, and recommendations.</li>
        <li>To improve platform performance, security, and usability.</li>
        <li>To analyze trends, user behavior, and engagement.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">3. Third-Party Services</h2>
      <p className="mb-6">
        We use Firebase for authentication and backend services. Some features may use services like Google Analytics or social integrations, which may collect data independently.
      </p>

      <h2 className="text-2xl font-semibold mb-4">4. Sharing Your Information</h2>
      <p className="mb-6">
        We do not sell or rent your personal information. We may share your data with trusted third-party partners only for service functionality and legal compliance.
      </p>

      <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
      <p className="mb-6">
        We use modern security measures, including encryption and secure cloud infrastructure, to protect your data. However, no method of transmission over the internet is 100% secure.
      </p>

      <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
      <p className="mb-6">
        You may request to access, correct, or delete your personal data by contacting us. You can also opt-out of promotional emails at any time.
      </p>

      <h2 className="text-2xl font-semibold mb-4">7. Updates to This Policy</h2>
      <p className="mb-6">
        We may update this Privacy Policy periodically. Any changes will be posted on this page with an updated revision date.
      </p>

      <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
      <p className="mb-2">
        If you have any questions or concerns about this Privacy Policy, feel free to reach us at:
      </p>
      <p className="text-blue-600 font-medium">support@qlue.in</p>
    </div>
  );
};

export default PrivacyPolicy;
