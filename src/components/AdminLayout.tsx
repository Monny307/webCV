import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'

interface AdminLayoutProps {
  children: React.ReactNode
  activePage: string
}

export default function AdminLayout({ children, activePage }: AdminLayoutProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    if (typeof window !== 'undefined') {
      const currentUser = localStorage.getItem('currentUser')
      if (!currentUser) {
        router.push('/login')
        return
      }

      const userData = JSON.parse(currentUser)
      if (userData.role !== 'admin') {
        router.push('/')
        return
      }

      setUser(userData)
    }
  }, [router])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser')
    }
    router.push('/login')
  }

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f3f4f6'
      }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#f97316', marginBottom: '1rem' }}></i>
          <p style={{ color: '#64748b' }}>Loading...</p>
        </div>
      </div>
    )
  }

  const navItems = [
    { href: '/admin/dashboard', icon: 'fa-briefcase', label: 'Manage Jobs', page: 'dashboard' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      {/* Top Navbar */}
      <nav style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Image 
            src="/ahchip.png" 
            alt="AhhChip" 
            width={160} 
            height={160}
            quality={100}
            style={{ width: 'auto', height: '40px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button style={{
            padding: '0.5rem 1.25rem',
            background: '#f97316',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <i className="fas fa-shield-alt"></i>
            Admin
          </button>
          <button 
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1.25rem',
              background: 'white',
              color: '#64748b',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ display: 'flex' }}>
        {/* Left Sidebar */}
        <aside style={{
          width: '200px',
          background: 'white',
          height: 'calc(100vh - 73px)',
          borderRight: '1px solid #e5e7eb',
          padding: '1.5rem 0',
          position: 'fixed',
          left: 0,
          top: '73px',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '0 1rem 1rem 1rem', borderBottom: '1px solid #e5e7eb', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>
              <i className="fas fa-th-large"></i> Dashboard
            </h3>
          </div>
          <nav>
            {navItems.map((item) => (
              <Link key={item.page} href={item.href}>
                <div style={{
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: activePage === item.page ? 'white' : '#64748b',
                  background: activePage === item.page ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.9rem',
                  fontWeight: activePage === item.page ? 600 : 400,
                  margin: '0 0.5rem',
                  borderRadius: '8px'
                }}>
                  <i className={`fas ${item.icon}`} style={{ width: '16px', textAlign: 'center' }}></i>
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '2rem', marginLeft: '200px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
