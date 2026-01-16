import { useState } from 'react'
import Layout from '@/components/Layout'
import Head from 'next/head'

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for contacting us! We will get back to you soon.')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <>
      <Head>
        <title>Contact Us - AhhChip</title>
      </Head>
      <Layout>
        <div className="info-page">
          <div className="info-container">
            <h1>Contact Us</h1>
            <p className="info-subtitle">Get in touch with us</p>
            
            <div className="contact-content" style={{ 
              display: 'flex',
              justifyContent: 'center',
              marginTop: '3rem'
            }}>
              {/* Contact Information */}
              <div className="contact-info-section" style={{ maxWidth: '800px', width: '100%' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Get in Touch</h2>
                
                <div className="contact-cards" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ 
                      width: '50px', 
                      height: '50px', 
                      background: 'var(--primary-orange)', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem'
                    }}>
                      <i className="fas fa-envelope" style={{ color: 'white', fontSize: '1.25rem' }}></i>
                    </div>
                    <h3 style={{ marginBottom: '0.5rem' }}>Email</h3>
                    <p style={{ color: 'var(--light-text)' }}>Our support team is here to help</p>
                    <a href="mailto:support@ahhchip.com" style={{ color: 'var(--primary-orange)', fontWeight: 600 }}>
                      support@ahhchip.com
                    </a>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ 
                      width: '50px', 
                      height: '50px', 
                      background: 'var(--primary-orange)', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem'
                    }}>
                      <i className="fas fa-map-marker-alt" style={{ color: 'white', fontSize: '1.25rem' }}></i>
                    </div>
                    <h3 style={{ marginBottom: '0.5rem' }}>Office</h3>
                    <p style={{ color: 'var(--light-text)' }}>Visit us at our office</p>
                    <p style={{ fontWeight: 600 }}>
                      Phnom Penh, Cambodia
                    </p>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ 
                      width: '50px', 
                      height: '50px', 
                      background: 'var(--primary-orange)', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem'
                    }}>
                      <i className="fas fa-clock" style={{ color: 'white', fontSize: '1.25rem' }}></i>
                    </div>
                    <h3 style={{ marginBottom: '0.5rem' }}>Business Hours</h3>
                    <p style={{ color: 'var(--light-text)' }}>We&apos;re available</p>
                    <p style={{ fontWeight: 600 }}>
                      Mon - Fri: 9:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem' }}>Follow Us</h3>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <a href="#" style={{
                      width: '45px',
                      height: '45px',
                      background: '#1877f2',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.25rem'
                    }}>
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="#" style={{
                      width: '45px',
                      height: '45px',
                      background: '#1da1f2',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.25rem'
                    }}>
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="#" style={{
                      width: '45px',
                      height: '45px',
                      background: '#0077b5',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.25rem'
                    }}>
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
