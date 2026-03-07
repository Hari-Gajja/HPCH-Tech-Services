import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './PrivacyPolicy.css'

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="privacy-page">
      <header className="privacy-header">
        <div className="privacy-header-inner">
          <Link to="/" className="privacy-back">
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
          <div className="privacy-brand">
            <span className="logo-circle small">
              <span className="logo-letter">H</span>
            </span>
            <span className="mono">HPCH TECH</span>
          </div>
        </div>
      </header>

      <main className="privacy-content">
        <h1>Privacy Policy</h1>
        <p className="privacy-updated">Last updated: March 7, 2026</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to HPCH Tech ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data.
            This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website
            <strong> hpchtech.netlify.app</strong> (the "Site").
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <h3>a) Information You Provide</h3>
          <ul>
            <li><strong>Contact Form:</strong> Name, email address, phone number, project details, and service preferences when you submit a quote request.</li>
            <li><strong>Student Discount Requests:</strong> College name and student ID image when applying for a student discount.</li>
            <li><strong>Account Information:</strong> Name, email, and profile picture when you sign in via Google.</li>
          </ul>
          <h3>b) Information Collected Automatically</h3>
          <ul>
            <li><strong>Analytics Data:</strong> We use Google Analytics to collect anonymized usage data including pages visited, time spent, browser type, device type, and approximate location (country/city level).</li>
            <li><strong>Cookies:</strong> Google Analytics sets cookies (<code>_ga</code>, <code>_gid</code>) to distinguish users and track sessions.</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To respond to your quote requests and inquiries</li>
            <li>To process student discount applications</li>
            <li>To improve our website and services through analytics</li>
            <li>To communicate with you about our services</li>
            <li>To prevent fraudulent or spam submissions</li>
          </ul>
        </section>

        <section>
          <h2>4. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li><strong>Google Analytics:</strong> For website traffic analysis. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a></li>
            <li><strong>Google Sign-In:</strong> For user authentication. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a></li>
            <li><strong>EmailJS:</strong> For processing contact form submissions. <a href="https://www.emailjs.com/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">EmailJS Privacy Policy</a></li>
          </ul>
        </section>

        <section>
          <h2>5. Cookies</h2>
          <p>
            Our website uses cookies for analytics purposes. These cookies help us understand how visitors interact with our site.
            You can control cookies through your browser settings. Disabling cookies may affect some features of the website.
          </p>
          <table className="cookie-table">
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>_ga</code></td>
                <td>Distinguishes unique users</td>
                <td>2 years</td>
              </tr>
              <tr>
                <td><code>_gid</code></td>
                <td>Distinguishes unique users</td>
                <td>24 hours</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>6. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information. However, no method of transmission over the
            Internet is 100% secure. We strive to protect your data but cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2>7. Data Retention</h2>
          <p>
            We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy.
            Contact form submissions and student discount requests are stored on our secure servers and may be deleted upon request.
          </p>
        </section>

        <section>
          <h2>8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of analytics tracking by disabling cookies in your browser</li>
          </ul>
        </section>

        <section>
          <h2>9. Children's Privacy</h2>
          <p>
            Our services are not directed to individuals under the age of 13. We do not knowingly collect personal
            information from children under 13.
          </p>
        </section>

        <section>
          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated
            revision date. We encourage you to review this policy periodically.
          </p>
        </section>

        <section>
          <h2>11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
          </p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:harigajja10@gmail.com">harigajja10@gmail.com</a></li>
            <li><strong>Website:</strong> <a href="https://hpchtech.netlify.app">hpchtech.netlify.app</a></li>
          </ul>
        </section>
      </main>

      <footer className="privacy-footer">
        <p>&copy; 2026 HPCH Tech. All rights reserved.</p>
      </footer>
    </div>
  )
}
