import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function OAuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const { access_token, refresh_token, user, error } = router.query

    if (error) {
      alert('Authentication failed. Please try again.')
      router.push('/login')
      return
    }

    if (access_token && refresh_token) {
      // Store tokens
      localStorage.setItem('access_token', access_token as string)
      localStorage.setItem('refresh_token', refresh_token as string)

      // Fetch user details
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            localStorage.setItem('currentUser', JSON.stringify(data.user))
            router.push('/')
          } else {
            router.push('/login')
          }
        })
        .catch(() => {
          router.push('/login')
        })
    }
  }, [router.query])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem 4rem',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '1.5rem',
          color: '#667eea'
        }}>
          <i className="fas fa-spinner fa-spin"></i>
        </div>
        <h2 style={{ marginBottom: '0.75rem', color: '#1e293b', fontSize: '1.5rem' }}>Completing Sign In</h2>
        <p style={{ color: '#64748b', margin: 0 }}>Please wait while we set up your account...</p>
      </div>
    </div>
  )
}
