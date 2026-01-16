import { useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'
import LoadingOverlay from '../components/LoadingOverlay'

export default function Signup() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState({ title: '', text: '', icon: '' })

  const showMessageModal = (title: string, text: string, icon: string) => {
    setModalMessage({ title, text, icon })
    setShowModal(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleGoogleSignup = () => {
    window.location.href = '/api/auth/oauth/google'
  }

  const handleFacebookSignup = () => {
    window.location.href = '/api/auth/oauth/facebook'
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      showMessageModal('Password Mismatch', 'Passwords do not match!', 'fa-exclamation-triangle')
      return
    }

    if (formData.password.length < 8) {
      showMessageModal('Weak Password', 'Password must be at least 8 characters long!', 'fa-exclamation-triangle')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: formData.fullname,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        showMessageModal('Success', 'Account created successfully! Redirecting to login...', 'fa-check-circle')
        setTimeout(() => {
          router.push('/login')
        }, 1500)
      } else {
        showMessageModal('Error', data.message || 'An error occurred', 'fa-exclamation-triangle')
        setLoading(false)
      }
    } catch (err) {
      console.error('Signup error:', err)
      showMessageModal('Error', 'Cannot connect to server. Make sure backend is running.', 'fa-exclamation-triangle')
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Sign Up - AhhChip</title>
      </Head>

      {loading && <LoadingOverlay message="Creating your account..." />}

      <div className="auth-page">
        <button className="btn-back-auth" onClick={() => router.back()}>
          <i className="fas fa-arrow-left"></i>
        </button>

        <div className="auth-container auth-container-single">
          <div className="auth-right auth-right-full">
            <div className="auth-image-top">
              <Image src="/signup.jpg" alt="Start Dream Career Today" width={1200} height={600} quality={95} priority />
            </div>

            <div className="auth-header">
              <h1>Start Your Dream Career Today!</h1>
              <p>Create your account and unlock endless opportunities</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group-auth">
                  <label htmlFor="fullname">Full Name</label>
                  <input
                    type="text"
                    id="fullname"
                    name="fullname"
                    placeholder="John Doe"
                    value={formData.fullname}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group-auth">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group-auth">
                  <label htmlFor="password">Password</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div className="form-group-auth">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="password-input">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      minLength={8}
                      style={{
                        borderColor: formData.confirmPassword && formData.password !== formData.confirmPassword ? 'var(--danger)' : 'var(--border-color)'
                      }}
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="remember-forgot">
                <label className="remember-me">
                  <input type="checkbox" name="terms" required />
                  <span>I agree to the <Link href="/terms-of-service" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-orange)' }}>Terms & Conditions</Link></span>
                </label>
              </div>

              <button type="submit" className="btn-auth" disabled={loading}>
                Create Account
              </button>

              <div className="divider">
                <span>Or sign up with</span>
              </div>

              <div className="social-auth social-auth-icons">
                <button
                  type="button"
                  className="btn-social-icon btn-social-google"
                  title="Sign up with Google"
                  onClick={handleGoogleSignup}
                >
                  <i className="fab fa-google"></i>
                </button>
                <button
                  type="button"
                  className="btn-social-icon btn-social-facebook"
                  title="Sign up with Facebook"
                  onClick={handleFacebookSignup}
                >
                  <i className="fab fa-facebook-f"></i>
                </button>
              </div>

              <div className="auth-footer">
                Already have an account? <Link href="/login">Sign In</Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="message-modal-overlay">
          <div className="message-modal">
            <div className="message-modal-icon">
              <i className={`fas ${modalMessage.icon}`}></i>
            </div>
            <div className="message-modal-content">
              <h3>{modalMessage.title}</h3>
              <p>{modalMessage.text}</p>
            </div>
            <button className="message-modal-btn" onClick={() => setShowModal(false)}>OK</button>
          </div>
        </div>
      )}
    </>
  )
}
