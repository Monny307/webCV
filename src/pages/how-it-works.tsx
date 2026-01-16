import Layout from '@/components/Layout'
import Head from 'next/head'

export default function HowItWorks() {
  return (
    <>
      <Head>
        <title>How It Works - AhhChip</title>
      </Head>
      <Layout>
        <div className="info-page">
          <div className="info-container">
            <h1>How AhhChip Works</h1>
            <p className="info-subtitle">Your AI-powered career companion that makes job hunting smarter and faster</p>
            
            <div className="info-section">
              <h2> Getting Started</h2>
              <div className="step-grid">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <h3>Create Your Account</h3>
                  <p>Sign up in seconds with your email or social accounts. No complicated forms, just the essentials.</p>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <h3>Upload Your CV</h3>
                  <p>Upload your resume in PDF or DOCX format. Our AI instantly extracts and organizes your information.</p>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <h3>AI Analysis</h3>
                  <p>Our machine learning model analyzes your skills, experience, and career goals to understand your profile.</p>
                </div>
                <div className="step-item">
                  <div className="step-number">4</div>
                  <h3>Get Matched</h3>
                  <p>Receive personalized job recommendations that align with your qualifications and aspirations.</p>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h2>Smart Job Matching</h2>
              <p>Our AI-powered matching system goes beyond simple keyword matching:</p>
              <ul className="feature-list">
                <li><i className="fas fa-check-circle"></i> <strong>Skill Analysis:</strong> We understand the context and relevance of your skills</li>
                <li><i className="fas fa-check-circle"></i> <strong>Experience Matching:</strong> Find jobs that value your unique background</li>
                <li><i className="fas fa-check-circle"></i> <strong>Career Growth:</strong> Discover opportunities that advance your career path</li>
                <li><i className="fas fa-check-circle"></i> <strong>Culture Fit:</strong> Match with companies that align with your values</li>
              </ul>
            </div>

            <div className="info-section">
              <h2>Track Your Applications</h2>
              <p>Stay organized with our application tracking system:</p>
              <ul className="feature-list">
                <li><i className="fas fa-check-circle"></i> See all your applications in one dashboard</li>
                <li><i className="fas fa-check-circle"></i> Track application status (Applied, Interview, Offer, Rejected)</li>
                <li><i className="fas fa-check-circle"></i> Get reminders for follow-ups</li>
                <li><i className="fas fa-check-circle"></i> View application history and analytics</li>
              </ul>
            </div>

            <div className="info-section">
              <h2>Job Alerts</h2>
              <p>Never miss an opportunity with customizable job alerts:</p>
              <ul className="feature-list">
                <li><i className="fas fa-check-circle"></i> Set alerts for specific job titles, locations, or companies</li>
                <li><i className="fas fa-check-circle"></i> Choose notification frequency (instant, daily, weekly)</li>
                <li><i className="fas fa-check-circle"></i> Manage multiple alerts for different criteria</li>
                <li><i className="fas fa-check-circle"></i> Pause or delete alerts anytime</li>
              </ul>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
