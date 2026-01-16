import Layout from '@/components/Layout'
import Head from 'next/head'

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service - AhhChip</title>
      </Head>
      <Layout>
        <div className="info-page">
          <div className="info-container">
            <h1>Terms of Service</h1>
            <p className="info-subtitle">Last updated: December 2024</p>
            
            <div className="info-section">
              <h2>1. Acceptance of Terms</h2>
              <p>By accessing and using AhhChip, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
            </div>

            <div className="info-section">
              <h2>2. User Accounts</h2>
              <ul className="feature-list">
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> You must provide accurate and complete information when creating an account</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> You are responsible for maintaining the security of your account</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> You must be at least 16 years old to use our service</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> One person or entity may not maintain multiple accounts</li>
              </ul>
            </div>

            <div className="info-section">
              <h2>3. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="feature-list">
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Provide false or misleading information</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Impersonate another person or entity</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Use the service for any illegal purpose</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Attempt to gain unauthorized access to our systems</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Interfere with the proper functioning of the service</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Scrape or collect data without permission</li>
              </ul>
            </div>

            <div className="info-section">
              <h2>4. Content</h2>
              <ul className="feature-list">
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> You retain ownership of content you upload (CVs, profile information)</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> You grant us license to use your content to provide our services</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> You are responsible for the accuracy of your content</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> We may remove content that violates these terms</li>
              </ul>
            </div>

            <div className="info-section">
              <h2>5. Job Applications</h2>
              <ul className="feature-list">
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> AhhChip is a platform connecting job seekers with employers</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> We do not guarantee job placements or interviews</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Hiring decisions are made solely by employers</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> We are not responsible for employer conduct</li>
              </ul>
            </div>

            <div className="info-section">
              <h2>6. Limitation of Liability</h2>
              <p>AhhChip is provided &quot;as is&quot; without warranties of any kind. We are not liable for:</p>
              <ul className="feature-list">
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Any indirect, incidental, or consequential damages</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Loss of data or profits</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Service interruptions or errors</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Actions of third-party users or employers</li>
              </ul>
            </div>

            <div className="info-section">
              <h2>7. Termination</h2>
              <p>We may suspend or terminate your account if you violate these terms. You may delete your account at any time from your settings.</p>
            </div>

            <div className="info-section">
              <h2>8. Changes to Terms</h2>
              <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
            </div>

            <div className="info-section">
              <h2>9. Intellectual Property</h2>
              <p>All content, features, and functionality of AhhChip are owned by us and are protected by international copyright, trademark, and other intellectual property laws.</p>
            </div>

            <div className="info-section">
              <h2>10. Dispute Resolution</h2>
              <p>Any disputes arising from these terms will be resolved through arbitration in accordance with the laws of Cambodia.</p>
            </div>

            <div className="info-section">
              <h2>11. Contact</h2>
              <p>For questions about these Terms of Service, contact us at:</p>
              <p><strong>Email:</strong> legal@ahhchip.com</p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
