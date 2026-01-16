import { useState, useEffect } from 'react'
import Head from 'next/head'
import AdminLayout from '@/components/AdminLayout'
import api from '@/lib/api'

interface Stats {
  total_jobs: number
  active_jobs: number
  total_users: number
}

interface Job {
  id: number
  title: string
  company: string
  location: string
  job_type: string
  salary: string | null
  category: string
  description: string
  requirements: string | null
  status: string
  deadline: string | null
  created_at: string
  updated_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    total_jobs: 0,
    active_jobs: 0,
    total_users: 0
  })
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    job_type: 'Full-time',
    salary: '',
    category: '',
    description: '',
    requirements: '',
    deadline: ''
  })

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token')
    const user = localStorage.getItem('user')
    console.log('Token exists:', !!token)
    console.log('User:', user ? JSON.parse(user) : null)
    
    if (!token) {
      console.error('No authentication token found!')
      alert('You are not logged in. Please login first.')
      window.location.href = '/login'
      return
    }
    
    fetchStats()
    fetchJobs()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      console.log('Fetching admin stats...')
      const response = await api.get('/api/admin/stats')
      console.log('Stats response:', response)
      
      if (response.success) {
        console.log('Setting stats:', response.stats)
        setStats(response.stats)
      } else {
        console.error('Failed to fetch stats:', response)
        alert('Failed to load dashboard stats: ' + (response.message || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error)
      alert('Error loading dashboard: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchJobs = async () => {
    try {
      const response = await api.get('/api/admin/jobs')
      if (response.success) {
        setJobs(response.jobs)
      }
    } catch (error: any) {
      console.error('Error fetching jobs:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingJob) {
        const response = await api.put(`/api/admin/jobs/${editingJob.id}`, formData)
        if (response.success) {
          alert('Job updated successfully!')
          setShowModal(false)
          setEditingJob(null)
          fetchJobs()
          fetchStats()
        }
      } else {
        const response = await api.post('/api/admin/jobs', formData)
        if (response.success) {
          alert('Job created successfully!')
          setShowModal(false)
          fetchJobs()
          fetchStats()
        }
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        const response = await api.delete(`/api/admin/jobs/${id}`)
        if (response.success) {
          alert('Job deleted successfully!')
          fetchJobs()
          fetchStats()
        }
      } catch (error: any) {
        alert('Error: ' + error.message)
      }
    }
  }

  const handleToggleStatus = async (id: number) => {
    try {
      const response = await api.post(`/api/admin/jobs/${id}/toggle-status`)
      if (response.success) {
        fetchJobs()
        fetchStats()
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const openCreateModal = () => {
    setEditingJob(null)
    setFormData({
      title: '',
      company: '',
      location: '',
      job_type: 'Full-time',
      salary: '',
      category: '',
      description: '',
      requirements: '',
      deadline: ''
    })
    setShowModal(true)
  }

  const openEditModal = (job: Job) => {
    setEditingJob(job)
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      job_type: job.job_type,
      salary: job.salary || '',
      category: job.category,
      description: job.description,
      requirements: job.requirements || '',
      deadline: job.deadline ? job.deadline.split('T')[0] : ''
    })
    setShowModal(true)
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Admin Dashboard - CV Job Portal</title>
        </Head>
        <AdminLayout activePage="dashboard">
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
            <p style={{ marginTop: '1rem' }}>Loading dashboard...</p>
          </div>
        </AdminLayout>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - CV Job Portal</title>
      </Head>

      <AdminLayout activePage="dashboard">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>
            <i className="fas fa-chart-line"></i> Dashboard Overview
          </h1>
          <p style={{ margin: 0, color: '#64748b' }}>Monitor your platform's key metrics and statistics</p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '50px', height: '50px', background: '#dbeafe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-briefcase" style={{ fontSize: '1.5rem', color: '#2563eb' }}></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>{stats.total_jobs}</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Total Jobs</p>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '50px', height: '50px', background: '#d1fae5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-check-circle" style={{ fontSize: '1.5rem', color: '#059669' }}></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>{stats.active_jobs}</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Active Jobs</p>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '50px', height: '50px', background: '#e0e7ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-users" style={{ fontSize: '1.5rem', color: '#6366f1' }}></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>{stats.total_users}</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Total Users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Management */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem', fontWeight: 600 }}>
              <i className="fas fa-briefcase"></i> Manage Jobs
            </h3>
            <button
              onClick={openCreateModal}
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.95rem'
              }}
            >
              <i className="fas fa-plus"></i> Add New Job
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Title</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Company</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Location</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Type</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Deadline</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem', color: '#1e293b' }}>{job.title}</td>
                    <td style={{ padding: '0.75rem', color: '#64748b' }}>{job.company}</td>
                    <td style={{ padding: '0.75rem', color: '#64748b' }}>{job.location}</td>
                    <td style={{ padding: '0.75rem', color: '#64748b' }}>{job.job_type}</td>
                    <td style={{ padding: '0.75rem', color: '#64748b' }}>
                      {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No deadline'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        background: job.status === 'Active' ? '#d1fae5' : '#fee2e2',
                        color: job.status === 'Active' ? '#059669' : '#dc2626'
                      }}>
                        {job.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleStatus(job.id)}
                        style={{
                          background: job.status === 'Active' ? '#10b981' : '#6b7280',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.75rem',
                          borderRadius: '4px',
                          fontWeight: 600
                        }}
                        title={job.status === 'Active' ? 'Deactivate' : 'Activate'}
                      >
                        {job.status === 'Active' ? 'ON' : 'OFF'}
                      </button>
                      <button
                        onClick={() => openEditModal(job)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#667eea',
                          cursor: 'pointer',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.9rem'
                        }}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.9rem'
                        }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>
                {editingJob ? 'Edit Job' : 'Create New Job'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                    Company *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                      Job Type *
                    </label>
                    <select
                      value={formData.job_type}
                      onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.95rem'
                      }}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                      Salary
                    </label>
                    <input
                      type="text"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                      Category *
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                    Requirements
                  </label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      background: '#e2e8f0',
                      color: '#64748b',
                      border: 'none',
                      padding: '0.65rem 1.25rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      padding: '0.65rem 1.25rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    {editingJob ? 'Update Job' : 'Create Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  )
}
