import Layout from '@/components/Layout'
import Head from 'next/head'

export default function ResumeTips() {
  return (
    <>
      <Head>
        <title>Resume Tips - AhhChip</title>
      </Head>
      <Layout>
        <div className="info-page">
          <div className="info-container">
            <h1>Resume Writing Tips</h1>
            <p className="info-subtitle">Expert advice to help you create a standout resume</p>
            
            <div className="info-section">
              <h2>Essential Resume Sections</h2>
              <ul className="feature-list">
                <li><i className="fas fa-check-circle"></i> <strong>Contact Information:</strong> Include your full name, phone number, email, and LinkedIn profile</li>
                <li><i className="fas fa-check-circle"></i> <strong>Professional Summary:</strong> A brief 2-3 sentence overview of your experience and career goals</li>
                <li><i className="fas fa-check-circle"></i> <strong>Work Experience:</strong> List your relevant work history in reverse chronological order</li>
                <li><i className="fas fa-check-circle"></i> <strong>Education:</strong> Include your degrees, institutions, and graduation dates</li>
                <li><i className="fas fa-check-circle"></i> <strong>Skills:</strong> Highlight both technical and soft skills relevant to your field</li>
              </ul>
            </div>

            <div className="info-section">
              <h2>Formatting Best Practices</h2>
              <ul className="feature-list">
                <li><i className="fas fa-check-circle"></i> Keep it to 1-2 pages maximum</li>
                <li><i className="fas fa-check-circle"></i> Use a clean, professional font (Arial, Calibri, or Times New Roman)</li>
                <li><i className="fas fa-check-circle"></i> Maintain consistent formatting throughout</li>
                <li><i className="fas fa-check-circle"></i> Use bullet points for easy readability</li>
                <li><i className="fas fa-check-circle"></i> Leave adequate white space</li>
                <li><i className="fas fa-check-circle"></i> Save as PDF to preserve formatting</li>
              </ul>
            </div>

            <div className="info-section">
              <h2>Content Tips</h2>
              <ul className="feature-list">
                <li><i className="fas fa-check-circle"></i> Use action verbs (achieved, managed, developed, led)</li>
                <li><i className="fas fa-check-circle"></i> Quantify your achievements with numbers and percentages</li>
                <li><i className="fas fa-check-circle"></i> Tailor your resume to each job application</li>
                <li><i className="fas fa-check-circle"></i> Focus on accomplishments, not just responsibilities</li>
                <li><i className="fas fa-check-circle"></i> Include relevant keywords from the job description</li>
                <li><i className="fas fa-check-circle"></i> Proofread carefully for spelling and grammar errors</li>
              </ul>
            </div>

            <div className="info-section">
              <h2>Common Mistakes to Avoid</h2>
              <ul className="feature-list">
                <li><i className="fas fa-times-circle" style={{ color: '#ef4444' }}></i> Using an unprofessional email address</li>
                <li><i className="fas fa-times-circle" style={{ color: '#ef4444' }}></i> Including irrelevant personal information (age, photo, marital status)</li>
                <li><i className="fas fa-times-circle" style={{ color: '#ef4444' }}></i> Listing every job you&apos;ve ever had</li>
                <li><i className="fas fa-times-circle" style={{ color: '#ef4444' }}></i> Using generic objectives instead of targeted summaries</li>
                <li><i className="fas fa-times-circle" style={{ color: '#ef4444' }}></i> Lying or exaggerating your experience</li>
                <li><i className="fas fa-times-circle" style={{ color: '#ef4444' }}></i> Forgetting to update your resume regularly</li>
              </ul>
            </div>

            <div className="info-section">
              <h2>Sample Resume Structure</h2>
              <div style={{ 
                background: '#f9fafb', 
                padding: '2rem', 
                borderRadius: '12px',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                lineHeight: '1.8'
              }}>
                <p><strong>YOUR NAME</strong></p>
                <p>Email | Phone | LinkedIn | Location</p>
                <br />
                <p><strong>PROFESSIONAL SUMMARY</strong></p>
                <p>Brief 2-3 sentence overview of your experience and goals</p>
                <br />
                <p><strong>WORK EXPERIENCE</strong></p>
                <p>Job Title | Company Name | Dates</p>
                <p>• Achievement with quantifiable results</p>
                <p>• Another key accomplishment</p>
                <br />
                <p><strong>EDUCATION</strong></p>
                <p>Degree | University Name | Graduation Year</p>
                <br />
                <p><strong>SKILLS</strong></p>
                <p>Technical Skills | Soft Skills | Languages</p>
              </div>
            </div>

            <div className="info-section">
              <h2>Industry-Specific Tips</h2>
              <div className="tips-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ color: 'var(--primary-orange)', marginBottom: '1rem' }}>Tech Industry</h3>
                  <p>Highlight programming languages, frameworks, and technical projects. Include GitHub links and portfolio.</p>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ color: 'var(--primary-orange)', marginBottom: '1rem' }}>Creative Fields</h3>
                  <p>Showcase your portfolio prominently. Use a more visually appealing format while maintaining professionalism.</p>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ color: 'var(--primary-orange)', marginBottom: '1rem' }}>Business/Finance</h3>
                  <p>Emphasize quantifiable achievements, revenue impact, and certifications (CPA, CFA, etc.).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
