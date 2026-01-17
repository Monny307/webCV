import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface JobAlert {
  id: string
  title: string
  keywords: string
  location: string
  category: string
  job_type: string
  frequency: string
  is_active: boolean
  last_sent: string | null
}

export default function JobAlerts() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<JobAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAlert, setEditingAlert] = useState<JobAlert | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    keywords: '',
    location: '',
    category: '',
    job_type: '',
    frequency: 'daily'
  })

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      const res = await fetch('/api/job-alerts', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setAlerts(data.job_alerts || [])
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    const field = id.replace('alert', '').toLowerCase()
    setFormData(prev => ({ ...prev, [field === 'title' ? 'title' : field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('access_token')
      const url = editingAlert ? `/api/job-alerts/${editingAlert.id}` : '/api/job-alerts'
      const method = editingAlert ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setShowModal(false)
        setEditingAlert(null)
        setFormData({
          title: '',
          keywords: '',
          location: '',
          category: '',
          job_type: '',
          frequency: 'daily'
        })
        fetchAlerts()
      } else {
        const data = await res.json()
        alert(data.message || 'Error saving job alert')
      }
    } catch (error) {
      console.error('Error saving alert:', error)
      alert('An error occurred while saving')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job alert?')) return

    try {
      const token = localStorage.getItem('access_token')
      const res = await fetch(`/api/job-alerts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        fetchAlerts()
      }
    } catch (error) {
      console.error('Error deleting alert:', error)
    }
  }

  const handleToggle = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token')
      const res = await fetch(`/api/job-alerts/${id}/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        fetchAlerts()
      }
    } catch (error) {
      console.error('Error toggling alert:', error)
    }
  }

  const openCreateModal = () => {
    setEditingAlert(null)
    setFormData({
      title: '',
      keywords: '',
      location: '',
      category: '',
      job_type: '',
      frequency: 'daily'
    })
    setShowModal(true)
  }

  const openEditModal = (alert: JobAlert) => {
    setEditingAlert(alert)
    setFormData({
      title: alert.title,
      keywords: alert.keywords || '',
      location: alert.location || '',
      category: alert.category || '',
      job_type: alert.job_type || '',
      frequency: alert.frequency || 'daily'
    })
    setShowModal(true)
  }

  return (
    <>
      <Head>
        <title>Job Alerts - WebCV</title>
      </Head>
      <Layout>
        <div className="info-page">
          <div className="info-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h1>Job Alerts</h1>
                <p className="info-subtitle">Manage your customized job notifications</p>
              </div>
              <button
                className="btn-primary"
                onClick={openCreateModal}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <i className="fas fa-plus"></i> Create New Alert
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary-orange)' }}></i>
                <p>Loading your alerts...</p>
              </div>
            ) : alerts.length === 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '4rem 2rem',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <i className="fas fa-bell-slash" style={{ fontSize: '4rem', color: '#e2e8f0', marginBottom: '1.5rem' }}></i>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>No Job Alerts Yet</h3>
                <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                  Create an alert and we'll notify you whenever a job matches your specific criteria.
                </p>
                <button className="btn-primary" onClick={openCreateModal}>Create Your First Alert</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {alerts.map((alert) => (
                  <div key={alert.id} style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    border: alert.is_active ? '1px solid #e2e8f0' : '1px solid #fee2e2',
                    opacity: alert.is_active ? 1 : 0.8,
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>{alert.title}</h3>
                      <div className="alert-toggle">
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
                          <input
                            type="checkbox"
                            checked={alert.is_active}
                            onChange={() => handleToggle(alert.id)}
                            style={{ opacity: 0, width: 0, height: 0 }}
                          />
                          <span className={`slider round ${alert.is_active ? 'active' : ''}`} style={{
                            position: 'absolute',
                            cursor: 'pointer',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: alert.is_active ? 'var(--primary-orange)' : '#ccc',
                            transition: '.4s',
                            borderRadius: '20px'
                          }}></span>
                        </label>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
                      {alert.keywords && (
                        <p style={{ margin: '0 0 0.5rem 0' }}>
                          <i className="fas fa-search" style={{ width: '20px' }}></i>
                          Keywords: <strong>{alert.keywords}</strong>
                        </p>
                      )}
                      {alert.location && (
                        <p style={{ margin: '0 0 0.5rem 0' }}>
                          <i className="fas fa-map-marker-alt" style={{ width: '20px' }}></i>
                          Location: <strong>{alert.location}</strong>
                        </p>
                      )}
                      <p style={{ margin: '0 0 0.5rem 0' }}>
                        <i className="fas fa-clock" style={{ width: '20px' }}></i>
                        Frequency: <strong>{alert.frequency}</strong>
                      </p>
                      {alert.last_sent && (
                        <p style={{ margin: '0', fontSize: '0.8rem', color: '#94a3b8' }}>
                          Last notification: {new Date(alert.last_sent).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                      <button
                        onClick={() => openEditModal(alert)}
                        style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(alert.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                      <Link
                        href="/notifications"
                        style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--primary-orange)', textDecoration: 'none' }}
                      >
                        View Hits <i className="fas fa-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create/Edit Alert Modal */}
        {showModal && (
          <div className="modal-overlay active" style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }} onClick={() => setShowModal(false)}>
            <div className="modal-content" style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>{editingAlert ? 'Edit Job Alert' : 'Create Job Alert'}</h2>
                <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setShowModal(false)}>&times;</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="alertTitle" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Alert Name *</label>
                  <input
                    type="text"
                    id="alertTitle"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Software Engineer - Remote"
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="alertKeywords" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Keywords</label>
                  <input
                    type="text"
                    id="alertKeywords"
                    value={formData.keywords}
                    onChange={handleInputChange}
                    placeholder="e.g., JavaScript, React"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="alertLocation" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Location</label>
                  <input
                    type="text"
                    id="alertLocation"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Phnom Penh, Remote"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="alertFrequency" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Frequency</label>
                  <select
                    id="alertFrequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  >
                    <option value="instant">Instant</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    {editingAlert ? 'Update Alert' : 'Create Alert'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </Layout>
      <style jsx>{`
        .switch input:checked + .slider:before {
          transform: translateX(18px);
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        .slider.active {
          background-color: var(--primary-orange);
        }
        .slider.active:before {
          transform: translateX(20px);
        }
      `}</style>
    </>
  )
}
