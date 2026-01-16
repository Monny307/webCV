import { useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'

export default function ForgotPassword() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState({ title: '', text: '', icon: '' })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const showMessageModal = (title: string, text: string, icon: string) => {
    setModalMessage({ title, text, icon })
    setShowModal(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!email) {
      showMessageModal('Error', 'Please enter your email address', 'fa-exclamation-triangle')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      showMessageModal('Invalid Email', 'Please enter a valid email address', 'fa-exclamation-triangle')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        showMessageModal('Error', data.message || 'An error occurred. Please try again.', 'fa-exclamation-triangle')
      }
    } catch (err) {
      showMessageModal('Error', 'Failed to connect to server. Please try again.', 'fa-exclamation-triangle')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Forgot Password - AhhChip</title>
      </Head>
      <div className="auth-page">
        <button className="btn-back-auth" onClick={() => router.back()}>
          <i className="fas fa-arrow-left"></i>
        </button>

        <div className="auth-container">
          <div className="auth-left auth-left-image">
            <Image
              src="/signin.png"
              alt="Reset Password"
              className="auth-bg-image"
              width={1200}
              height={1600}
              priority
            />
          </div>

          <div className="auth-right">
            {!isSubmitted ? (
              <>
                <div className="auth-header">
                  <h1>Forgot Password?</h1>
                  <p>No worries! Enter your email and we&apos;ll send you reset instructions</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                  <div className="form-group-auth">
                    <label htmlFor="email">
                      <i className="fas fa-envelope"></i>
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-auth btn-primary" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Send Reset Link
                      </>
                    )}
                  </button>
                </form>

                <div className="auth-footer">
                  <p>
                    Remember your password?{' '}
                    <Link href="/login">
                      <span className="auth-link">Sign In</span>
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#dcfce7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 2rem'
                }}>
                  <i className="fas fa-check" style={{ fontSize: '2.5rem', color: '#16a34a' }}></i>
                </div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#1e293b' }}>Check Your Email</h2>
                <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  We&apos;ve sent a password reset link to<br />
                  <strong style={{ color: '#f97316' }}>{email}</strong>
                </p>

                <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.95rem' }}>
                  Didn&apos;t receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#f97316',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '0.95rem'
                    }}
                  >
                    try again
                  </button>
                </p>
                <Link href="/login">
                  <button className="btn-auth btn-primary">
                    <i className="fas fa-arrow-left"></i>
                    Back to Login
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Success/Error Modal */}
        {showModal && (
          <div className="modal-overlay active" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
              <div style={{ padding: '2rem' }}>
                <i
                  className={`fas ${modalMessage.icon}`}
                  style={{
                    fontSize: '3rem',
                    color: modalMessage.icon === 'fa-check-circle' ? '#16a34a' : '#ef4444',
                    marginBottom: '1rem'
                  }}
                ></i>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>{modalMessage.title}</h3>
                <p style={{ color: '#64748b', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{modalMessage.text}</p>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', padding: '1rem' }}>
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-primary"
                  style={{ width: '100%' }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
