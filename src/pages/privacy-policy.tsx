import Layout from '@/components/Layout'
import Head from 'next/head'

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - AhhChip</title>
      </Head>
      <Layout>
        <div className="info-page">
          <div className="info-container">
            <h1>Privacy Policy</h1>
            <p className="info-subtitle">Last updated: December 2024</p>
            
            <div className="info-section">
              <h2>1. Information We Collect</h2>
              <p>We collect information that you provide directly to us, including:</p>
              <ul className="feature-list">
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Personal information (name, email, phone number)</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Resume/CV data and employment history</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Account credentials</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Job preferences and application data</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Communication with us</li>
              </ul>
            </div>

            <div className="info-section">
              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="feature-list">
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Provide and improve our services</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Match you with relevant job opportunities</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Send you job alerts and notifications</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Communicate with you about our services</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Analyze and improve our AI matching algorithms</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Comply with legal obligations</li>
              </ul>
            </div>

            <div className="info-section">
              <h2>3. Information Sharing</h2>
              <p>We may share your information in the following circumstances:</p>
              <ul className="feature-list">
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> <strong>With Employers:</strong> When you apply to jobs, we share your CV and relevant information with the employer</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> <strong>Service Providers:</strong> Third-party vendors who help us operate our platform</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> <strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> <strong>With Your Consent:</strong> Any other sharing with your explicit permission</li>
              </ul>
            </div>

            <div className="info-section">
              <h2>4. Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:</p>
              <ul className="feature-list">
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Encryption of data in transit and at rest</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Regular security assessments</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Access controls and authentication</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Employee training on data protection</li>
              </ul>
            </div>

            <div className="info-section">
              <h2>5. Your Rights</h2>
              <p>You have the following rights regarding your personal information:</p>
              <ul className="feature-list">
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> <strong>Access:</strong> Request a copy of your personal data</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> <strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> <strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> <strong>Portability:</strong> Receive your data in a structured format</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> <strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
            </div>

            <div className="info-section">
              <h2>6. Cookies and Tracking</h2>
              <p>We use cookies and similar tracking technologies to enhance your experience. You can control cookies through your browser settings. Our cookies are used for:</p>
              <ul className="feature-list">
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Essential functionality (authentication, security)</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Analytics and performance monitoring</li>
                <li><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Personalization and preferences</li>
              </ul>
            </div>

            <div className="info-section">
              <h2>7. Data Retention</h2>
              <p>We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will delete or anonymize your data within 30 days, except where we are required to retain it by law.</p>
            </div>

            <div className="info-section">
              <h2>8. Children&apos;s Privacy</h2>
              <p>Our services are not intended for individuals under 16 years of age. We do not knowingly collect personal information from children.</p>
            </div>

            <div className="info-section">
              <h2>9. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.</p>
            </div>

            <div className="info-section">
              <h2>10. Contact Us</h2>
              <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
              <p><strong>Email:</strong> privacy@ahhchip.com</p>
              <p><strong>Address:</strong> AhhChip Privacy Team, Phnom Penh, Cambodia</p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
