import { useState } from 'react'
import Layout from '@/components/Layout'
import Head from 'next/head'
import Link from 'next/link'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: 'How do I create an account?',
      answer: 'Click the "Sign Up" button in the top right corner and follow the simple registration process. You can sign up with your email or use social login options.'
    },
    {
      question: 'Is AhhChip free to use?',
      answer: 'Yes! AhhChip is completely free for job seekers. You can upload your CV, search for jobs, and apply to positions without any cost.'
    },
    {
      question: 'How does the AI matching work?',
      answer: 'Our AI analyzes your CV, skills, experience, and preferences to match you with relevant job opportunities. The more information you provide, the better the matches become.'
    },
    {
      question: 'Can I upload multiple CVs?',
      answer: 'Yes, you can upload and manage multiple versions of your CV. This is useful if you have different CVs tailored for different job types or industries.'
    },
    {
      question: 'How do I apply for jobs?',
      answer: 'Browse job listings, click on a job you\'re interested in, and click the "Apply" button. Your CV and profile information will be sent to the employer.'
    },
    {
      question: 'What file formats are supported for CV upload?',
      answer: 'We support PDF and DOCX formats. Make sure your CV is well-formatted and up to date for best results.'
    },
    {
      question: 'How do I track my applications?',
      answer: 'Go to the "My Jobs" section and click on the "Applications" tab. You\'ll see all your submitted applications and their current status.'
    },
    {
      question: 'Can I edit my profile after creating it?',
      answer: 'Yes, you can edit your profile anytime by going to the Settings page. You can update your personal information, skills, experience, and preferences.'
    },
    {
      question: 'How do job alerts work?',
      answer: 'Set up job alerts with your preferred criteria (job title, location, salary, etc.). We\'ll notify you via email when new jobs matching your criteria are posted.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We take data security seriously and use industry-standard encryption to protect your personal information. Read our Privacy Policy for more details.'
    },
    {
      question: 'Can employers see my CV without my permission?',
      answer: 'No. Employers can only see your CV when you apply to their job postings. You have full control over which companies receive your information.'
    },
    {
      question: 'How do I delete my account?',
      answer: 'Go to Settings, scroll down to the bottom, and click "Delete Account". Note that this action is permanent and will remove all your data.'
    }
  ]

  return (
    <>
      <Head>
        <title>FAQ - AhhChip</title>
      </Head>
      <Layout>
        <div className="info-page">
          <div className="info-container">
            <h1>Frequently Asked Questions</h1>
            <p className="info-subtitle">Find answers to common questions about AhhChip</p>
            
            <div className="faq-list" style={{ marginTop: '2rem' }}>
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="faq-item" 
                  style={{ 
                    marginBottom: '1rem',
                    background: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    style={{
                      width: '100%',
                      padding: '1.5rem',
                      background: 'white',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: 'var(--text-color)'
                    }}
                  >
                    <span>{faq.question}</span>
                    <i 
                      className={`fas fa-chevron-${openIndex === index ? 'up' : 'down'}`}
                      style={{ color: 'var(--primary-orange)', fontSize: '1rem' }}
                    ></i>
                  </button>
                  {openIndex === index && (
                    <div style={{ 
                      padding: '0 1.5rem 1.5rem',
                      color: 'var(--light-text)',
                      lineHeight: '1.6'
                    }}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="info-section" style={{ marginTop: '3rem', textAlign: 'center' }}>
              <h2>Still Have Questions?</h2>
              <p>Can&apos;t find the answer you&apos;re looking for? Contact our support team.</p>
              <Link href="/contact-us">
                <button className="btn-primary" style={{ marginTop: '1rem' }}>
                  <i className="fas fa-envelope"></i> Contact Us
                </button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
