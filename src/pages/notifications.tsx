import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Notifications() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeCVNotifications, setActiveCVNotifications] = useState<any[]>([])
  const [allCVNotifications, setAllCVNotifications] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState<'all' | 'read' | 'unread' | 'week' | 'month'>('all')
  const [activeSection, setActiveSection] = useState<'current' | 'all'>('current')
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
  const pastNotifications = filterNotifications(allCVNotifications)

  return (
    <>
      <Head>
        <title>Notifications - WebCV Job Portal</title>
      </Head>
      <Layout>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Notifications</h1>
            <p style={{ color: '#64748b' }}>View and manage your job notifications</p>
          </div>

          {/* Filter Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '2rem',
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
                  padding: '0.5rem 1rem',
                  background: activeFilter === filter.id ? '#3b82f6' : 'white',
                  color: activeFilter === filter.id ? 'white' : '#64748b',
                  border: `1px solid ${activeFilter === filter.id ? '#3b82f6' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
              >
                <i className={`fas fa-${filter.icon}`} style={{ marginRight: '0.5rem' }}></i>
                {filter.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#3b82f6', marginBottom: '1rem' }}></i>
              <p>Loading notifications...</p>
            </div>
          ) : (
            <>
              {/* Current CV Alert Section */}
              <div style={{ marginBottom: '3rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <i className="fas fa-badge-check" style={{ color: '#10b981' }}></i>
                    Current CV Alert
                    {currentNotifications.length > 0 && (
                      <span style={{
                        background: '#10b981',
                        color: 'white',
                        borderRadius: '20px',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}>
                        {currentNotifications.length}
                      </span>
                    )}
                  </h2>
                  <button
                    onClick={fetchNotifications}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: '#475569'
                    }}
                  >
                    <i className="fas fa-sync"></i> Refresh
                  </button>
                </div>

                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                  Jobs matching your current active CV keywords
                </p>

                {currentNotifications.length === 0 ? (
                  <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #dcfce7',
                    borderRadius: '12px',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    color: '#15803d'
                  }}>
                    <i className="fas fa-inbox" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block', opacity: 0.5 }}></i>
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>No notifications yet</h3>
                    <p style={{ margin: 0, opacity: 0.8 }}>
                      {activeFilter === 'all'
                        ? "You'll see job notifications here when new jobs match your CV keywords"
                        : `No ${activeFilter} notifications found`}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
                    {currentNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        style={{
                          background: notif.is_read ? '#f8fafc' : 'white',
                          border: `2px solid ${notif.is_read ? '#e2e8f0' : '#10b981'}`,
                          borderRadius: '12px',
                          padding: '1.5rem',
                          boxShadow: notif.is_read ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.1)',
                          position: 'relative',
                          transition: 'all 0.2s'
                        }}
                      >
                        {!notif.is_read && (
                          <div style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            width: '10px',
                            height: '10px',
                            background: '#10b981',
                            borderRadius: '50%'
                          }}></div>
                        )}

                        <div style={{ marginBottom: '1rem' }}>
                          <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.15rem', color: '#1e293b', paddingRight: '1.5rem' }}>
                            {notif.job?.title}
                          </h3>
                          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#64748b' }}>
                            <i className="fas fa-building" style={{ marginRight: '0.5rem' }}></i>
                            {notif.job?.company}
                          </p>
                          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#64748b' }}>
                            <i className="fas fa-map-marker-alt" style={{ marginRight: '0.5rem' }}></i>
                            {notif.job?.location}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                            <i className="fas fa-clock" style={{ marginRight: '0.5rem' }}></i>
                            {new Date(notif.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        {notif.matched_keywords && notif.matched_keywords.length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>
                              Matched Keywords:
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {notif.matched_keywords.map((keyword: string, idx: number) => (
                                <span
                                  key={idx}
                                  style={{
                                    background: '#d1fae5',
                                    color: '#065f46',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: 500
                                  }}
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            onClick={() => handleViewJob(notif)}
                            style={{
                              flex: 1,
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              padding: '0.75rem',
                              borderRadius: '8px',
                              fontSize: '0.95rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
                          >
                            <i className="fas fa-external-link-alt" style={{ marginRight: '0.5rem' }}></i>
                            View Job
                          </button>

                          {!notif.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(notif.id)}
                              title="Mark as read"
                              style={{
                                width: '45px',
                                background: '#f1f5f9',
                                color: '#64748b',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = '#e2e8f0'
                                e.currentTarget.style.color = '#10b981'
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = '#f1f5f9'
                                e.currentTarget.style.color = '#64748b'
                              }}
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* All CV Notifications Section */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <i className="fas fa-history" style={{ color: '#3b82f6' }}></i>
                    All CV Notifications
                    {pastNotifications.length > 0 && (
                      <span style={{
                        background: '#3b82f6',
                        color: 'white',
                        borderRadius: '20px',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}>
                        {pastNotifications.length}
                      </span>
                    )}
                  </h2>
                </div>

                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                  Jobs matching your past or inactive CV keywords
                </p>

                {pastNotifications.length === 0 ? (
                  <div style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '12px',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    color: '#1e40af'
                  }}>
                    <i className="fas fa-inbox" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block', opacity: 0.5 }}></i>
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>No notifications yet</h3>
                    <p style={{ margin: 0, opacity: 0.8 }}>
                      {activeFilter === 'all'
                        ? "New jobs matching your past CVs will appear here"
                        : `No ${activeFilter} notifications found`}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
                    {pastNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        style={{
                          background: notif.is_read ? '#f8fafc' : 'white',
                          border: `2px solid ${notif.is_read ? '#e2e8f0' : '#3b82f6'}`,
                          borderRadius: '12px',
                          padding: '1.5rem',
                          boxShadow: notif.is_read ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.1)',
                          position: 'relative'
                        }}
                      >
                        {!notif.is_read && (
                          <div style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            width: '10px',
                            height: '10px',
                            background: '#3b82f6',
                            borderRadius: '50%'
                          }}></div>
                        )}

                        <div style={{ marginBottom: '1rem' }}>
                          <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.15rem', color: '#1e293b', paddingRight: '1.5rem' }}>
                            {notif.job?.title}
                          </h3>
                          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#64748b' }}>
                            <i className="fas fa-building" style={{ marginRight: '0.5rem' }}></i>
                            {notif.job?.company}
                          </p>
                          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#64748b' }}>
                            <i className="fas fa-map-marker-alt" style={{ marginRight: '0.5rem' }}></i>
                            {notif.job?.location}
                          </p>
                          {notif.cv_name && (
                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#7c3aed' }}>
                              <i className="fas fa-file" style={{ marginRight: '0.5rem' }}></i>
                              CV: {notif.cv_name}
                            </p>
                          )}
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                            <i className="fas fa-clock" style={{ marginRight: '0.5rem' }}></i>
                            {new Date(notif.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        {notif.matched_keywords && notif.matched_keywords.length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 600, color: '#3b82f6' }}>
                              Matched Keywords:
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {notif.matched_keywords.map((keyword: string, idx: number) => (
                                <span
                                  key={idx}
                                  style={{
                                    background: '#dbeafe',
                                    color: '#1e40af',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: 500
                                  }}
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            onClick={() => handleViewJob(notif)}
                            style={{
                              flex: 1,
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              padding: '0.75rem',
                              borderRadius: '8px',
                              fontSize: '0.95rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
                          >
                            <i className="fas fa-external-link-alt" style={{ marginRight: '0.5rem' }}></i>
                            View Job
                          </button>

                          {!notif.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(notif.id)}
                              title="Mark as read"
                              style={{
                                width: '45px',
                                background: '#f1f5f9',
                                color: '#64748b',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = '#e2e8f0'
                                e.currentTarget.style.color = '#3b82f6'
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = '#f1f5f9'
                                e.currentTarget.style.color = '#64748b'
                              }}
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Layout>
    </>
  )
}
