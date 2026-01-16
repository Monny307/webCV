import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'

export default function ResetPassword() {
  const router = useRouter()
  const { token } = router.query
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const [error, setError] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  // Verify token on page load
  useEffect(() => {
    if (!token) {
      setIsVerifying(false)
      return
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/verify-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })

        const data = await response.json()

        if (response.ok) {
          setIsValidToken(true)
          setUserEmail(data.email)
        } else {
          setError(data.message || 'Invalid or expired reset link')
        }
      } catch (err) {
        setError('Failed to verify reset link')
      } finally {
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password })
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(data.message || 'Failed to reset password')
      }
    } catch (err) {
      setError('Failed to connect to server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Reset Password - AhhChip</title>
      </Head>
      <div className="auth-page">
        <button className="btn-back-auth" onClick={() => router.push('/login')}>
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
            {isVerifying ? (
              <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#f97316', marginBottom: '1rem' }}></i>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Verifying reset link...</p>
              </div>
            ) : !isValidToken ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  background: '#fee2e2', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 2rem'
                }}>
                  <i className="fas fa-exclamation-circle" style={{ fontSize: '2.5rem', color: '#dc2626' }}></i>
                </div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#1e293b' }}>Invalid Reset Link</h2>
                <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  {error || 'This password reset link is invalid or has expired.'}
                </p>
                <Link href="/forgot-password">
                  <button className="btn-auth btn-primary">
                    <i className="fas fa-redo"></i>
                    Request New Link
                  </button>
                </Link>
              </div>
            ) : isSuccess ? (
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
                <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#1e293b' }}>Password Reset Successful!</h2>
                <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  Your password has been successfully reset.<br />
                  Redirecting to login page...
                </p>
                <div style={{ marginTop: '2rem' }}>
                  <i className="fas fa-spinner fa-spin" style={{ color: '#f97316' }}></i>
                </div>
              </div>
            ) : (
              <>
                <div className="auth-header">
                  <h1>Reset Password</h1>
                  <p>Create a new password for <strong style={{ color: '#f97316' }}>{userEmail}</strong></p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                  {error && (
                    <div style={{
                      background: '#fee2e2',
                      border: '1px solid #fca5a5',
                      color: '#991b1b',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      marginBottom: '1.5rem',
                      fontSize: '0.9rem'
                    }}>
                      <i className="fas fa-exclamation-circle" style={{ marginRight: '0.5rem' }}></i>
                      {error}
                    </div>
                  )}

                  <div className="form-group-auth">
                    <label htmlFor="password">
                      <i className="fas fa-lock"></i>
                      New Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password (min. 8 characters)"
                      required
                      minLength={8}
                    />
                  </div>

                  <div className="form-group-auth">
                    <label htmlFor="confirmPassword">
                      <i className="fas fa-lock"></i>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-auth btn-primary" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check"></i>
                        Reset Password
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
            )}
          </div>
        </div>
      </div>
    </>
  )
}
