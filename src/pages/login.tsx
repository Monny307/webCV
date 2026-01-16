import { useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'
import LoadingOverlay from '../components/LoadingOverlay'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState({ title: '', text: '', icon: '' })

  const showMessageModal = (title: string, text: string, icon: string) => {
    setModalMessage({ title, text, icon })
    setShowModal(true)
  }

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/oauth/google'
  }

  const handleFacebookLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/oauth/facebook'
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), password })
      })

      const data = await response.json()

      if (response.ok && data.access_token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', data.access_token)
          localStorage.setItem('refresh_token', data.refresh_token)
          localStorage.setItem('currentUser', JSON.stringify(data.user))
        }
        
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/')
        }
      } else {
        setError(data.message || 'Invalid email or password. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Cannot connect to server. Make sure backend is running.')
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login - AhhChip</title>
      </Head>
      
      {loading && <LoadingOverlay message="Signing you in..." />}
      
      <div className="auth-page">
        <button className="btn-back-auth" onClick={() => router.back()}>
          <i className="fas fa-arrow-left"></i>
        </button>
        
        <div className="auth-container">
          <div className="auth-left auth-left-image">
            <Image 
              src="/signin.png" 
              alt="Welcome Back" 
              className="auth-bg-image" 
              width={1200} 
              height={1600}
              quality={95}
              priority
            />
          </div>

          <div className="auth-right">
            <div className="auth-header">
              <h1>Welcome Back!</h1>
              <p>Sign in to continue your journey</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group-auth">
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {error && (
                  <div style={{ 
                    color: '#ef4444', 
                    fontSize: '0.875rem', 
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                  </div>
                )}
              </div>

              <div className="remember-forgot">
                <label className="remember-me">
                  <input type="checkbox" name="remember" />
                  <span>Remember me</span>
                </label>
                <Link href="/forgot-password" className="forgot-password">Forgot Password?</Link>
              </div>

              <button type="submit" className="btn-auth" disabled={loading}>
                Sign In
              </button>

              <div className="divider">
                <span>Or continue with</span>
              </div>

              <div className="social-auth social-auth-icons">
                <button 
                  type="button" 
                  className="btn-social-icon btn-social-google" 
                  title="Sign in with Google"
                  onClick={handleGoogleLogin}
                >
                  <i className="fab fa-google"></i>
                </button>
                <button 
                  type="button" 
                  className="btn-social-icon btn-social-facebook" 
                  title="Sign in with Facebook"
                  onClick={handleFacebookLogin}
                >
                  <i className="fab fa-facebook-f"></i>
                </button>
              </div>

              <div className="auth-footer">
                Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="message-modal-overlay" id="messageModal">
          <div className="message-modal">
            <div className="message-modal-icon">
              <i className={`fas ${modalMessage.icon}`}></i>
            </div>
            <div className="message-modal-content">
              <h3>{modalMessage.title}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{modalMessage.text}</p>
            </div>
            <button className="message-modal-btn" onClick={() => setShowModal(false)}>OK</button>
          </div>
        </div>
      )}
    </>
  )
}
