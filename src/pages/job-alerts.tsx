import { useState } from 'react'
import Layout from '@/components/Layout'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function JobAlerts() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [leftFilter, setLeftFilter] = useState('all') // all, see-more, see-less, read, unread, week, month
  const [rightFilter, setRightFilter] = useState('all') // all, see-more, see-less, read, unread, week, month

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Job alert created successfully!')
    setShowModal(false)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this job alert?')) {
      alert('Job alert deleted successfully!')
    }
  }

  return (
    <>
      <Head>
        <title>Job Alerts - AhhChip</title>
      </Head>
      <Layout>
        <div className="info-page">
          <div className="info-container" style={{ maxWidth: '100%', width: '100%' }}>
            <h1>Notifications</h1>
            <p className="info-subtitle">View and manage your job notifications</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem', width: '100%' }}>
              {/* Left Panel - Current CV Alert */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>
                  Current CV Alert
                </h2>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#64748b' }}>
                  Shows notifications that match the current CV only. Shows notifications all new and can be read notification or past read.
                </p>
                
                {/* Filters */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button 
                    onClick={() => setLeftFilter(leftFilter === 'see-more' ? 'see-less' : 'see-more')}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: leftFilter === 'see-more' || leftFilter === 'see-less' ? 'var(--primary-orange)' : '#f3f4f6',
                      color: leftFilter === 'see-more' || leftFilter === 'see-less' ? 'white' : '#64748b',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    {leftFilter === 'see-more' ? 'See Less' : 'See More'}
                  </button>
                  <button 
                    onClick={() => setLeftFilter(leftFilter === 'read' ? 'all' : 'read')}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: leftFilter === 'read' ? 'var(--primary-orange)' : '#f3f4f6',
                      color: leftFilter === 'read' ? 'white' : '#64748b',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Read
                  </button>
                  <button 
                    onClick={() => setLeftFilter(leftFilter === 'unread' ? 'all' : 'unread')}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: leftFilter === 'unread' ? 'var(--primary-orange)' : '#f3f4f6',
                      color: leftFilter === 'unread' ? 'white' : '#64748b',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Unread
                  </button>
                  <button 
                    onClick={() => setLeftFilter(leftFilter === 'week' ? 'all' : 'week')}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: leftFilter === 'week' ? 'var(--primary-orange)' : '#f3f4f6',
                      color: leftFilter === 'week' ? 'white' : '#64748b',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Week
                  </button>
                  <button 
                    onClick={() => setLeftFilter(leftFilter === 'month' ? 'all' : 'month')}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: leftFilter === 'month' ? 'var(--primary-orange)' : '#f3f4f6',
                      color: leftFilter === 'month' ? 'white' : '#64748b',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Month
                  </button>
                </div>

                {/* Alert Cards */}
                <div className="alerts-list">
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem 2rem',
                    color: '#64748b'
                  }}>
                    <i className="fas fa-bell-slash" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
                    <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No notifications yet</p>
                    <p style={{ fontSize: '0.9rem' }}>You&apos;ll see job notifications here when you set up job alerts</p>
                  </div>
                </div>
              </div>

              {/* Right Panel - All CV Notifications */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>
                  All CV Notifications
                </h2>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#64748b' }}>
                  Shows all notifications, not limited to the current CV. Includes notifications for past or inactive CVs as well.
                </p>
                
                {/* Filters */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button 
                    onClick={() => setRightFilter(rightFilter === 'see-more' ? 'see-less' : 'see-more')}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: rightFilter === 'see-more' || rightFilter === 'see-less' ? 'var(--primary-orange)' : '#f3f4f6',
                      color: rightFilter === 'see-more' || rightFilter === 'see-less' ? 'white' : '#64748b',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    {rightFilter === 'see-more' ? 'See Less' : 'See More'}
                  </button>
                  <button 
                    onClick={() => setRightFilter(rightFilter === 'read' ? 'all' : 'read')}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: rightFilter === 'read' ? 'var(--primary-orange)' : '#f3f4f6',
                      color: rightFilter === 'read' ? 'white' : '#64748b',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Read
                  </button>
                  <button 
                    onClick={() => setRightFilter(rightFilter === 'unread' ? 'all' : 'unread')}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: rightFilter === 'unread' ? 'var(--primary-orange)' : '#f3f4f6',
                      color: rightFilter === 'unread' ? 'white' : '#64748b',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Unread
                  </button>
                  <button 
                    onClick={() => setRightFilter(rightFilter === 'week' ? 'all' : 'week')}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: rightFilter === 'week' ? 'var(--primary-orange)' : '#f3f4f6',
                      color: rightFilter === 'week' ? 'white' : '#64748b',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Week
                  </button>
                  <button 
                    onClick={() => setRightFilter(rightFilter === 'month' ? 'all' : 'month')}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: rightFilter === 'month' ? 'var(--primary-orange)' : '#f3f4f6',
                      color: rightFilter === 'month' ? 'white' : '#64748b',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Month
                  </button>
                </div>

                {/* Alert Cards */}
                <div className="alerts-list">
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem 2rem',
                    color: '#64748b'
                  }}>
                    <i className="fas fa-bell-slash" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
                    <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No notifications yet</p>
                    <p style={{ fontSize: '0.9rem' }}>You&apos;ll see job notifications here when you set up job alerts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Create Alert Modal */}
        {showModal && (
          <div className="modal-overlay active" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div className="modal-header">
                <h2>Create Job Alert</h2>
                <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
              </div>
              
              <form className="admin-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="alertTitle">Alert Name *</label>
                  <input type="text" id="alertTitle" placeholder="e.g., Software Engineer - Remote" required />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="alertKeywords">Keywords</label>
                    <input type="text" id="alertKeywords" placeholder="e.g., JavaScript, React" />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="alertLocation">Location</label>
                    <input type="text" id="alertLocation" placeholder="e.g., San Francisco, Remote" />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="alertFrequency">Notification Frequency *</label>
                  <select id="alertFrequency" required>
                    <option value="instant">Instant (as jobs are posted)</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Summary</option>
                  </select>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">
                    <i className="fas fa-bell"></i> Create Alert
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </Layout>
    </>
  )
}
