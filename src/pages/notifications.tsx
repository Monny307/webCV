import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Notifications() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeCVNotifications, setActiveCVNotifications] = useState<any[]>([])
  const [jobAlertNotifications, setJobAlertNotifications] = useState<any[]>([])
  const [allCVNotifications, setAllCVNotifications] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState<'all' | 'read' | 'unread' | 'week' | 'month'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }
    setIsLoggedIn(true)
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')

      // Fetch active CV notifications
      const activeCVRes = await fetch('/api/notifications/active-cv', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (activeCVRes.ok) {
        const data = await activeCVRes.json()
        setActiveCVNotifications(data.notifications || [])
      }

      // Fetch Job Alert notifications
      const jobAlertRes = await fetch('/api/notifications/job-alerts', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (jobAlertRes.ok) {
        const data = await jobAlertRes.json()
        setJobAlertNotifications(data.notifications || [])
      }

      // Fetch all CVs notifications
      const allCVRes = await fetch('/api/notifications/all-cvs', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (allCVRes.ok) {
        const data = await allCVRes.json()
        setAllCVNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token')
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        // Update local state
        setActiveCVNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        setJobAlertNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        setAllCVNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleViewJob = async (notif: any) => {
    if (!notif.is_read) {
      await handleMarkAsRead(notif.id)
    }
    window.open(`/jobs/${notif.job?.id}`, '_blank')
  }

  const filterNotifications = (notifications: any[]) => {
    let filtered = notifications

    if (activeFilter === 'read') {
      filtered = filtered.filter(n => n.is_read)
    } else if (activeFilter === 'unread') {
      filtered = filtered.filter(n => !n.is_read)
    } else if (activeFilter === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      filtered = filtered.filter(n => new Date(n.created_at) >= weekAgo)
    } else if (activeFilter === 'month') {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      filtered = filtered.filter(n => new Date(n.created_at) >= monthAgo)
    }

    return filtered
  }

  const currentNotifications = filterNotifications(activeCVNotifications)
  const alertNotifications = filterNotifications(jobAlertNotifications)
  const pastNotifications = filterNotifications(allCVNotifications)

  return (
    <>
      <Head>
        <title>Notifications - WebCV</title>
      </Head>
      <Layout>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Notifications</h1>
              <p style={{ color: '#64748b' }}>View and manage your job notifications</p>
            </div>
            <button
              onClick={fetchNotifications}
              style={{
                padding: '0.5rem 1rem',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="fas fa-sync"></i> Refresh
            </button>
          </div>

          {/* Filter Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '2.5rem',
            flexWrap: 'wrap'
          }}>
            {[
              { id: 'all', label: 'All', icon: 'list' },
              { id: 'unread', label: 'Unread', icon: 'envelope' },
              { id: 'read', label: 'Read', icon: 'envelope-open' },
              { id: 'week', label: 'This Week', icon: 'calendar-week' },
              { id: 'month', label: 'This Month', icon: 'calendar-alt' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as any)}
                style={{
                  padding: '0.6rem 1.2rem',
                  background: activeFilter === filter.id ? 'var(--primary-orange)' : 'white',
                  color: activeFilter === filter.id ? 'white' : '#64748b',
                  border: `1px solid ${activeFilter === filter.id ? 'var(--primary-orange)' : '#e2e8f0'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  boxShadow: activeFilter === filter.id ? '0 4px 12px rgba(255, 107, 0, 0.2)' : 'none'
                }}
              >
                <i className={`fas fa-${filter.icon}`} style={{ marginRight: '0.5rem' }}></i>
                {filter.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: 'var(--primary-orange)', marginBottom: '1rem' }}></i>
              <p>Loading notifications...</p>
            </div>
          ) : (
            <>
              {/* Job Alert Section */}
              <NotificationSection
                title="Job Alert Matches"
                icon="bell"
                color="#f97316"
                notifications={alertNotifications}
                onMarkRead={handleMarkAsRead}
                onView={handleViewJob}
                emptyText="New jobs matching your custom alerts will appear here."
              />

              {/* Current CV Section */}
              <NotificationSection
                title="Active CV Matches"
                icon="file-alt"
                color="#10b981"
                notifications={currentNotifications}
                onMarkRead={handleMarkAsRead}
                onView={handleViewJob}
                emptyText="Jobs matching your current active CV keywords will appear here."
              />

              {/* Past CV Section */}
              <NotificationSection
                title="Past CV Matches"
                icon="history"
                color="#3b82f6"
                notifications={pastNotifications}
                onMarkRead={handleMarkAsRead}
                onView={handleViewJob}
                emptyText="Jobs matching your previous CVs will appear here."
              />
            </>
          )}
        </div>
      </Layout>
    </>
  )
}

function NotificationSection({ title, icon, color, notifications, onMarkRead, onView, emptyText }: any) {
  if (notifications.length === 0) return null;

  return (
    <div style={{ marginBottom: '3.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: `${color}15`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem'
        }}>
          <i className={`fas fa-${icon}`}></i>
        </div>
        <h2 style={{ fontSize: '1.5rem', color: '#1e293b', margin: 0 }}>
          {title}
          <span style={{
            marginLeft: '1rem',
            background: color,
            color: 'white',
            borderRadius: '20px',
            padding: '0.2rem 0.75rem',
            fontSize: '0.85rem'
          }}>{notifications.length}</span>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
        {notifications.map((notif: any) => (
          <div key={notif.id} style={{
            background: notif.is_read ? '#f8fafc' : 'white',
            border: `2px solid ${notif.is_read ? '#e2e8f0' : color}`,
            borderRadius: '16px',
            padding: '1.5rem',
            position: 'relative',
            transition: 'all 0.2s',
            boxShadow: notif.is_read ? 'none' : `0 4px 15px ${color}15`
          }}>
            {!notif.is_read && (
              <div style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', width: '10px', height: '10px', background: color, borderRadius: '50%' }}></div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', color: '#1e293b' }}>{notif.job?.title}</h3>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b' }}>
                <i className="fas fa-building" style={{ marginRight: '0.5rem', width: '15px' }}></i> {notif.job?.company}
              </p>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b' }}>
                <i className="fas fa-map-marker-alt" style={{ marginRight: '0.5rem', width: '15px' }}></i> {notif.job?.location}
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                <i className="fas fa-calendar" style={{ marginRight: '0.5rem', width: '15px' }}></i> {new Date(notif.created_at).toLocaleDateString()}
              </p>
            </div>

            {notif.matched_keywords && notif.matched_keywords.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {notif.matched_keywords.map((kw: string, i: number) => (
                    <span key={i} style={{
                      background: `${color}10`,
                      color: color,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>{kw}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => onView(notif)}
                style={{
                  flex: 1,
                  background: color,
                  color: 'white',
                  border: 'none',
                  padding: '0.6rem',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >View Job</button>
              {!notif.is_read && (
                <button
                  onClick={() => onMarkRead(notif.id)}
                  style={{
                    width: '40px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                ><i className="fas fa-check"></i></button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
