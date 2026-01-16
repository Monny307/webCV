import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Image from 'next/image'

export default function Navbar() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profilePhoto, setProfilePhoto] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check auth state - SSR safe
    if (typeof window !== 'undefined') {
      const currentUser = localStorage.getItem('currentUser')
      if (currentUser) {
        const userData = JSON.parse(currentUser)
        setUser(userData)
        setIsLoggedIn(true)
        fetchProfilePhoto()
      }
    }

    // Scroll effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchProfilePhoto = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      const response = await fetch('http://localhost:5000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.profile.profile_photo) {
          setProfilePhoto(data.profile.profile_photo)
        }
      }
    } catch (error) {
      console.error('Error fetching profile photo:', error)
    }
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser')
    }
    setIsLoggedIn(false)
    setUser(null)
    router.push('/')
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo">
          <Link href="/">
            <Image 
              src="/ahchip.png" 
              alt="AhhChip Logo" 
              width={200} 
              height={200} 
              className="logo-img"
              priority
              quality={100}
              style={{ width: 'auto', height: '50px' }}
            />
          </Link>
        </div>

        {/* Main Navigation Links */}
        <ul className="nav-menu">
          <li className="nav-item dropdown">
            <a 
              href={router.pathname === '/' ? '#jobs' : '/'} 
              className="nav-link"
              onClick={(e) => {
                if (router.pathname !== '/') {
                  e.preventDefault()
                  router.push('/')
                }
              }}
            >
              <i className="fas fa-briefcase"></i>
              <span>Jobs</span>
              <i className="fas fa-chevron-down dropdown-icon"></i>
            </a>
            <ul className="dropdown-menu">
              <li>
                <a 
                  href={router.pathname === '/' ? '#jobs' : '/'}
                  onClick={(e) => {
                    if (router.pathname !== '/') {
                      e.preventDefault()
                      router.push('/')
                    }
                  }}
                >
                  All Jobs
                </a>
              </li>
              <li>
                <a 
                  href={router.pathname === '/' ? '#my-jobs' : '/'}
                  onClick={(e) => {
                    if (router.pathname !== '/') {
                      e.preventDefault()
                      router.push('/')
                    }
                  }}
                >
                  Recommended
                </a>
              </li>
              <li>
                <a 
                  href={router.pathname === '/' ? '#my-jobs' : '/'}
                  onClick={(e) => {
                    if (router.pathname !== '/') {
                      e.preventDefault()
                      router.push('/')
                    }
                  }}
                >
                  Saved Jobs
                </a>
              </li>
            </ul>
          </li>
          <li className="nav-item">
            <a 
              href={router.pathname === '/' ? '#my-jobs' : '/'} 
              className="nav-link"
              onClick={(e) => {
                if (router.pathname !== '/') {
                  e.preventDefault()
                  router.push('/')
                }
              }}
            >
              <i className="fas fa-tasks"></i>
              <span>My Jobs</span>
            </a>
          </li>
          <li className="nav-item">
            <Link href="/cv-builder" className="nav-link">
              <i className="fas fa-file-alt"></i>
              <span>CV Builder</span>
            </Link>
          </li>
        </ul>

        {/* Auth Buttons */}
        {!mounted ? (
          <div className="nav-auth" id="authButtons">
            <button className="btn-login" onClick={() => router.push('/login')}>Login</button>
            <button className="btn-signup" onClick={() => router.push('/signup')}>Sign Up</button>
          </div>
        ) : !isLoggedIn ? (
          <div className="nav-auth" id="authButtons">
            <button className="btn-login" onClick={() => router.push('/login')}>Login</button>
            <button className="btn-signup" onClick={() => router.push('/signup')}>Sign Up</button>
          </div>
        ) : (
          <div className="nav-auth-icons">
            {/* Notification Bell */}
            <Link href="/notifications" className="notification-icon" aria-label="Notifications">
              <i className="fas fa-bell"></i>
            </Link>
            
            {/* User Profile Dropdown */}
            <div className="nav-user dropdown" id="userProfile">
              <div className="user-avatar">
                {profilePhoto ? (
                  <img 
                    src={`http://localhost:5000${profilePhoto}`} 
                    alt={user?.fullname || 'User'} 
                    width={40} 
                    height={40}
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.2rem'
                  }}>
                    {user?.fullname?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <ul className="dropdown-menu user-dropdown-menu">
                <li><Link href="/settings"><i className="fas fa-cog"></i> Settings</Link></li>
                <li className="divider"></li>
                <li><a href="#" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Logout</a></li>
              </ul>
            </div>
          </div>
        )}

        {/* Mobile Menu Toggle */}
        <div className="mobile-menu-toggle" role="button" aria-label="Toggle mobile menu" tabIndex={0}>
          <i className="fas fa-bars"></i>
        </div>
      </div>
    </nav>
  )
}
