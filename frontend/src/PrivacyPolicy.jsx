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
        <p className="privacy-updated">Last updated: March 8, 2026</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to HPCH Services ("HPCH," "HPCH Tech," "we," "our," or "us"). We respect your privacy and are committed to protecting your personal data.
            This Privacy Policy explains how we collect, use, store, disclose, and safeguard your information when you visit our website
            <strong> hpch-services.netlify.app</strong> (the "Site") and use any of our services. By accessing or using the Site, you agree to the terms described in this policy.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>

          <h3>a) Information You Voluntarily Provide</h3>
          <ul>
            <li><strong>Contact Form Submissions:</strong> When you request a quote or consultation, we collect your full name, email address, phone number, selected service type, and any message or project details you provide.</li>
            <li><strong>Student Discount Requests:</strong> When applying for a student discount, we collect your name, email, phone number, college/university name, an image of your student ID, and any optional message.</li>
            <li><strong>Google Account Information:</strong> When you sign in via Google OAuth, we receive your Google ID, name, email address, profile picture URL, and email verification status from Google.</li>
            <li><strong>Phone Number:</strong> You may provide or update your phone number through your account profile.</li>
          </ul>

          <h3>b) Information Collected Automatically</h3>
          <ul>
            <li><strong>Analytics Data:</strong> We use Google Analytics 4 (GA4) and Google Tag Manager (GTM) to collect anonymised usage data including pages visited, session duration, bounce rate, browser type and version, device type, operating system, screen resolution, referral source, and approximate geographic location (country/city level).</li>
            <li><strong>Site View Tracking:</strong> We maintain a daily page view counter that records the date and number of visits. This data is aggregated and does not identify individual users.</li>
            <li><strong>Cookies:</strong> We use cookies as detailed in Section 7 below.</li>
          </ul>

          <h3>c) Information We Do Not Collect</h3>
          <ul>
            <li>We do <strong>not</strong> collect payment card numbers, bank account details, or process any financial transactions through the Site.</li>
            <li>We do <strong>not</strong> track your precise GPS location.</li>
            <li>We do <strong>not</strong> use localStorage or sessionStorage to persist any personal data in your browser.</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect for the following purposes:</p>
          <ul>
            <li><strong>Service Delivery:</strong> To respond to your quote requests, inquiries, and consultation requests.</li>
            <li><strong>Student Discount Processing:</strong> To verify your student status and apply applicable discounts to your account.</li>
            <li><strong>Account Management:</strong> To create and manage your user account when you sign in via Google.</li>
            <li><strong>Communication:</strong> To contact you about your service requests, project updates, and support.</li>
            <li><strong>Website Improvement:</strong> To analyse Site traffic, usage patterns, and performance through aggregated analytics data.</li>
            <li><strong>Administration:</strong> To enable our admin team to manage discount campaigns, review student requests, and monitor Site health.</li>
            <li><strong>Fraud Prevention:</strong> To detect and prevent fraudulent, abusive, or spam submissions.</li>
            <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, or legal processes.</li>
          </ul>
        </section>

        <section>
          <h2>4. How We Share Your Information</h2>
          <p>We do <strong>not</strong> sell, rent, or trade your personal information to third parties. We share data only with the third-party service providers described in Section 5 below, and only as necessary to operate the Site and deliver our services. We may also disclose your information if required by law, legal process, or government request.</p>
        </section>

        <section>
          <h2>5. Third-Party Services</h2>
          <p>We rely on the following third-party services, each with their own privacy policies:</p>

          <h3>a) Google Analytics &amp; Google Tag Manager</h3>
          <p>We use Google Analytics 4 (Measurement ID: G-LX86Q5D905) and Google Tag Manager (ID: GTM-WLNNSVGS) to collect and analyse anonymised website usage data. Google may process this data on servers outside your country of residence.</p>
          <p><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a> · <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-Out</a></p>

          <h3>b) Google OAuth 2.0 (Sign-In)</h3>
          <p>We use Google OAuth 2.0 for user authentication. When you sign in with Google, we receive your basic profile information (name, email, profile picture) from Google's identity service. We do not have access to your Google password.</p>
          <p><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></p>

          <h3>c) EmailJS</h3>
          <p>Contact form submissions are sent via EmailJS, a third-party email delivery service. Your name, email, phone number, and message content are transmitted through their servers to deliver the email to us.</p>
          <p><a href="https://www.emailjs.com/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">EmailJS Privacy Policy</a></p>

          <h3>d) Cloudinary</h3>
          <p>Student ID images are securely uploaded to and stored on Cloudinary, a cloud-based image management service. Images are stored in a dedicated private folder and are deleted when no longer needed or upon your request.</p>
          <p><a href="https://cloudinary.com/privacy" target="_blank" rel="noopener noreferrer">Cloudinary Privacy Policy</a></p>

          <h3>e) MongoDB Atlas</h3>
          <p>User accounts, student discount requests, and operational data are stored in a MongoDB Atlas database, a cloud-hosted database service. Data may be stored on servers located in different regions.</p>
          <p><a href="https://www.mongodb.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">MongoDB Privacy Policy</a></p>

          <h3>f) Netlify (Frontend Hosting)</h3>
          <p>Our Site is hosted on Netlify. Netlify may collect server logs including IP addresses, request timestamps, and page URLs as part of their standard hosting infrastructure.</p>
          <p><a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer">Netlify Privacy Policy</a></p>

          <h3>g) Render (Backend Hosting)</h3>
          <p>Our backend API is hosted on Render. Render may collect server-level data as part of their infrastructure operations.</p>
          <p><a href="https://render.com/privacy" target="_blank" rel="noopener noreferrer">Render Privacy Policy</a></p>

          <h3>h) Font Awesome &amp; Google Fonts</h3>
          <p>We load icons from Font Awesome (via cdnjs.cloudflare.com) and typography from Google Fonts. These CDNs may collect anonymised usage data such as IP addresses and request headers.</p>
        </section>

        <section>
          <h2>6. File Uploads</h2>
          <p>
            When applying for a student discount, you are required to upload an image of your student ID. The following safeguards apply:
          </p>
          <ul>
            <li>Only image files (JPEG, PNG, WebP, etc.) are accepted.</li>
            <li>Maximum file size is limited to 800 KB.</li>
            <li>Images are uploaded to a secured Cloudinary folder and are not publicly listed or indexed.</li>
            <li>Admin staff may view your student ID solely for the purpose of verifying your student status.</li>
            <li>Student ID images are deleted from Cloudinary when the request is processed or upon your request.</li>
          </ul>
        </section>

        <section>
          <h2>7. Cookies &amp; Tracking Technologies</h2>
          <p>
            Our website uses cookies — small text files stored on your device — for authentication and analytics. Below is a full list of cookies we use:
          </p>
          <table className="cookie-table">
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Type</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>auth_token</code></td>
                <td>Essential</td>
                <td>Stores your encrypted session token (JWT) to keep you signed in. HTTP-only and secure in production.</td>
                <td>24 hours</td>
              </tr>
              <tr>
                <td><code>_ga</code></td>
                <td>Analytics</td>
                <td>Google Analytics — distinguishes unique users</td>
                <td>2 years</td>
              </tr>
              <tr>
                <td><code>_ga_*</code></td>
                <td>Analytics</td>
                <td>Google Analytics 4 — maintains session state</td>
                <td>2 years</td>
              </tr>
              <tr>
                <td><code>_gid</code></td>
                <td>Analytics</td>
                <td>Google Analytics — distinguishes unique users for 24-hour periods</td>
                <td>24 hours</td>
              </tr>
            </tbody>
          </table>
          <p>
            <strong>Managing Cookies:</strong> You can control or delete cookies through your browser settings. Disabling essential cookies (like <code>auth_token</code>) will prevent you from using sign-in features. Disabling analytics cookies will stop Google Analytics tracking. You can also install the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-Out Browser Add-On</a>.
          </p>
        </section>

        <section>
          <h2>8. Data Storage &amp; Security</h2>
          <p>We implement the following security measures to protect your data:</p>
          <ul>
            <li><strong>Encryption in Transit:</strong> All data transmitted between your browser and our servers is encrypted using HTTPS/TLS.</li>
            <li><strong>HTTP-Only Cookies:</strong> Authentication tokens are stored in HTTP-only cookies, preventing access from client-side scripts.</li>
            <li><strong>Secure Cookie Flags:</strong> In production, cookies are configured with <code>Secure</code> and <code>SameSite</code> attributes to prevent cross-site attacks.</li>
            <li><strong>JWT Authentication:</strong> User sessions are managed via signed JSON Web Tokens with a defined expiration period.</li>
            <li><strong>Admin Access Control:</strong> Administrative functions are restricted to authorised email addresses only.</li>
            <li><strong>File Upload Limits:</strong> Student ID uploads are restricted by file type and size (800 KB maximum) to prevent abuse.</li>
            <li><strong>Database Security:</strong> MongoDB Atlas provides built-in encryption at rest, network isolation, and access controls.</li>
          </ul>
          <p>
            While we take reasonable precautions, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security but are committed to promptly addressing any security incidents.
          </p>
        </section>

        <section>
          <h2>9. Data Retention</h2>
          <ul>
            <li><strong>User Accounts:</strong> Your account data is retained for as long as your account remains active. You may request deletion at any time.</li>
            <li><strong>Contact Form Submissions:</strong> Emails sent via the contact form are delivered to our inbox and are not stored on our servers beyond the email delivery process.</li>
            <li><strong>Student Discount Requests:</strong> Request data and uploaded student ID images are retained until the request is processed (approved or rejected). Upon processing, student ID images may be deleted from Cloudinary. You may request early deletion at any time.</li>
            <li><strong>Analytics Data:</strong> Google Analytics data is retained according to Google's default retention settings (14 months for user-level data).</li>
            <li><strong>Site View Logs:</strong> Aggregated daily view counts are retained indefinitely for internal analytics. These do not contain personally identifiable information.</li>
            <li><strong>Email Send Logs:</strong> We log timestamps of emails sent through the contact form for rate-limiting purposes. These logs do not contain message content or personal data.</li>
          </ul>
        </section>

        <section>
          <h2>10. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
            <li><strong>Right to Erasure:</strong> Request deletion of your personal data, including your user account, student discount request, and uploaded student ID image.</li>
            <li><strong>Right to Restrict Processing:</strong> Request that we limit how we use your data.</li>
            <li><strong>Right to Data Portability:</strong> Request your data in a structured, machine-readable format.</li>
            <li><strong>Right to Object:</strong> Object to processing of your data for certain purposes.</li>
            <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent (e.g., analytics cookies).</li>
            <li><strong>Right to Opt Out of Analytics:</strong> Disable analytics cookies via your browser settings or install the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-Out Add-On</a>.</li>
          </ul>
          <p>To exercise any of these rights, please contact us using the details in Section 15 below. We will respond to your request within 30 days.</p>
        </section>

        <section>
          <h2>11. International Data Transfers</h2>
          <p>
            Our Site is operated from India, but our third-party service providers (Google, Cloudinary, MongoDB Atlas, Netlify, Render, EmailJS) may process and store data on servers located in different countries, including the United States and the European Union. By using our Site, you consent to the transfer of your data to these jurisdictions. We ensure that our service providers maintain appropriate data protection safeguards.
          </p>
        </section>

        <section>
          <h2>12. Children's Privacy</h2>
          <p>
            Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal data, we will take steps to delete that information promptly. If you are a parent or guardian and believe your child has submitted personal data to us, please contact us immediately.
          </p>
        </section>

        <section>
          <h2>13. Third-Party Links</h2>
          <p>
            Our Site may contain links to external websites, including GitHub, LinkedIn, and Google Maps. We are not responsible for the privacy practices or content of these third-party sites. We encourage you to read the privacy policies of any external sites you visit.
          </p>
        </section>

        <section>
          <h2>14. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices, services, or legal requirements. Any changes will be posted on this page with an updated "Last updated" date. We encourage you to review this policy periodically. Your continued use of the Site after any changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2>15. Contact Us</h2>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your personal data, please contact us:
          </p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:harigajja10@gmail.com">harigajja10@gmail.com</a></li>
            <li><strong>Phone:</strong> <a href="tel:+917331105294">+91-7331105294</a></li>
            <li><strong>Website:</strong> <a href="https://hpch-services.netlify.app">hpch-services.netlify.app</a></li>
          </ul>
        </section>
      </main>

      <footer className="privacy-footer">
        <p>&copy; 2026 HPCH Services. All rights reserved.</p>
      </footer>
    </div>
  )
}
