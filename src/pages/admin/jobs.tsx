import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import AdminLayout from '@/components/AdminLayout'
import api from '@/lib/api'

interface Job {
  id: string
  title: string
  company: string
  location: string
  salary: string
  job_type: string
  category: string
  description: string
  requirements: string
  logo: string
  contact_email?: string
  contact_phone?: string
  website?: string
  deadline?: string
  status: string
  posted_date: string
  created_at: string
}

export default function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    job_type: 'Full-time',
    category: '',
    deadline: '',
    description: '',
    requirements: '',
    logo: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    status: 'active'
  })

  useEffect(() => {
    fetchJobs()
  }, [searchQuery, statusFilter])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter) params.append('status', statusFilter)

      const response = await api.get(`/api/admin/jobs?${params.toString()}`)
      if (response.success) {
        setJobs(response.jobs)
      }
    } catch (error: any) {
      console.error('Error fetching jobs:', error)
      alert(error.response?.data?.message || 'Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      let logoUrl = formData.logo

      // Upload logo file if selected
      if (logoFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', logoFile)

        const uploadResponse = await api.post('/api/admin/upload-logo', uploadFormData)

        if (uploadResponse.success) {
          logoUrl = uploadResponse.file_path
        }
      }

      const jobData = { ...formData, logo: logoUrl }

      if (editingJob) {
        // Update existing job
        const response = await api.put(`/api/admin/jobs/${editingJob.id}`, jobData)
        if (response.success) {
          alert('Job updated successfully!')
          fetchJobs()
          closeModal()
        }
      } else {
        // Create new job
        const response = await api.post('/api/admin/jobs', jobData)
        if (response.success) {
          alert('Job created successfully!')
          fetchJobs()
          closeModal()
        }
      }
    } catch (error: any) {
      console.error('Error saving job:', error)
      alert(error.response?.data?.message || 'Failed to save job')
    }
  }

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return

    try {
      const response = await api.delete(`/api/admin/jobs/${jobId}`)
      if (response.success) {
        alert('Job deleted successfully!')
        fetchJobs()
      }
    } catch (error: any) {
      console.error('Error deleting job:', error)
      alert(error.response?.data?.message || 'Failed to delete job')
    }
  }

  const toggleStatus = async (jobId: string) => {
    try {
      const response = await api.post(`/api/admin/jobs/${jobId}/toggle-status`)
      if (response.success) {
        fetchJobs()
      }
    } catch (error: any) {
      console.error('Error toggling status:', error)
      alert(error.response?.data?.message || 'Failed to toggle status')
    }
  }

  const openModal = (job?: Job) => {
    if (job) {
      setEditingJob(job)
      setFormData({
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary || '',
        job_type: job.job_type,
        category: job.category,
        deadline: job.deadline || '',
        description: job.description,
        requirements: job.requirements || '',
        logo: job.logo || '',
        contact_email: job.contact_email || '',
        contact_phone: job.contact_phone || '',
        website: job.website || '',
        status: job.status
      })
      setLogoPreview(job.logo || '')
    } else {
      setEditingJob(null)
      setFormData({
        title: '',
        company: '',
        location: '',
        salary: '',
        job_type: 'Full-time',
        category: '',
        deadline: '',
        description: '',
        requirements: '',
        logo: '',
        contact_email: '',
        contact_phone: '',
        website: '',
        status: 'active'
      })
      setLogoPreview('')
    }
    setLogoFile(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingJob(null)
    setLogoFile(null)
    setLogoPreview('')
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPG, PNG, GIF, WEBP, SVG)')
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      setLogoFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogoClick = () => {
    logoInputRef.current?.click()
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview('')
    setFormData({ ...formData, logo: '' })
    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }


  return (
    <>
      <Head>
        <title>Manage Jobs - Admin</title>
      </Head>

      <AdminLayout activePage="dashboard">
        <div className="admin-content">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>
                <i className="fas fa-briefcase"></i> Manage Jobs
              </h2>
              <p style={{ margin: 0, color: '#64748b' }}>
                Create, edit, and manage job postings
              </p>
            </div>
            <button
              onClick={() => openModal()}
              style={{
                padding: '0.875rem 1.5rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              <i className="fas fa-plus"></i> Add New Job
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                minWidth: '250px',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Jobs Table */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
                <p style={{ marginTop: '1rem' }}>Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <i className="fas fa-inbox" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                <p style={{ marginTop: '1rem' }}>No jobs found</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Job Title</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Company</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Location</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Type</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Category</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#475569' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{job.title}</div>
                        </td>
                        <td style={{ padding: '1rem', color: '#64748b' }}>{job.company}</td>
                        <td style={{ padding: '1rem', color: '#64748b' }}>{job.location}</td>
                        <td style={{ padding: '1rem', color: '#64748b' }}>{job.job_type}</td>
                        <td style={{ padding: '1rem', color: '#64748b' }}>{job.category}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            background: job.status === 'active' ? '#d1fae5' : '#fee2e2',
                            color: job.status === 'active' ? '#065f46' : '#991b1b'
                          }}>
                            {job.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => toggleStatus(job.id)}
                              title={job.status === 'active' ? 'Deactivate' : 'Activate'}
                              style={{
                                padding: '0.5rem 0.75rem',
                                background: 'white',
                                color: job.status === 'active' ? '#dc2626' : '#16a34a',
                                border: '1px solid',
                                borderColor: job.status === 'active' ? '#dc2626' : '#16a34a',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                            >
                              <i className={`fas fa-${job.status === 'active' ? 'ban' : 'check'}`}></i>
                            </button>
                            <button
                              onClick={() => openModal(job)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                background: 'white',
                                color: '#667eea',
                                border: '1px solid #667eea',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(job.id)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                background: 'white',
                                color: '#dc2626',
                                border: '1px solid #dc2626',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              margin: '1rem'
            }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, color: '#1e293b' }}>
                  {editingJob ? 'Edit Job' : 'Add New Job'}
                </h3>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                      Job Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                      Company *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                        Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                        Salary
                      </label>
                      <input
                        type="text"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        placeholder="e.g. $50k - $70k"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                        Job Type *
                      </label>
                      <select
                        required
                        value={formData.job_type}
                        onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                        Category *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g. Software Development"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        cursor: 'pointer'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                      Requirements
                    </label>
                    <textarea
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      rows={3}
                      placeholder="List job requirements..."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  {/* Company Logo Section */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                      Company Logo URL
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'normal' }}>
                        (Image link from web)
                      </span>
                    </label>
                    <input
                      type="url"
                      value={formData.logo || ''}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                    {formData.logo && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img
                          src={formData.logo}
                          alt="Company Logo Preview"
                          style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'contain',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '4px'
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                        <span style={{ fontSize: '0.85rem', color: '#10b981' }}>
                          <i className="fas fa-check-circle"></i> Preview loaded
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contact Information Section */}
                  <div style={{
                    padding: '1.5rem',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{ marginBottom: '1rem', fontWeight: 600, color: '#475569', fontSize: '1.1rem' }}>
                      <i className="fas fa-address-card"></i> Contact Information
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#64748b', fontSize: '0.9rem' }}>
                          Contact Email
                        </label>
                        <input
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                          placeholder="hr@company.com"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '1rem'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#64748b', fontSize: '0.9rem' }}>
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.contact_phone}
                          onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                          placeholder="+1 234 567 8900"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '1rem'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#64748b', fontSize: '0.9rem' }}>
                        Website
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://www.company.com"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>

                  {/* Company Logo Section - Similar to Profile Photo */}
                  <div style={{
                    padding: '1.5rem',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '2px dashed #e2e8f0'
                  }}>
                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, color: '#475569', fontSize: '1.1rem' }}>
                      <i className="fas fa-image"></i> Company Logo
                    </label>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                      {/* Logo Preview with Edit Button Overlay */}
                      <div style={{ position: 'relative' }}>
                        {logoPreview || formData.logo ? (
                          <>
                            <img
                              src={logoPreview || formData.logo}
                              alt="Company Logo"
                              style={{
                                width: '180px',
                                height: '180px',
                                border: '3px solid #e2e8f0',
                                borderRadius: '12px',
                                objectFit: 'contain',
                                background: 'white',
                                padding: '0.5rem'
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleLogoClick}
                              style={{
                                position: 'absolute',
                                bottom: '10px',
                                right: '10px',
                                width: '45px',
                                height: '45px',
                                borderRadius: '50%',
                                background: '#667eea',
                                border: '3px solid white',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.1rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1)'
                                e.currentTarget.style.background = '#5568d3'
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)'
                                e.currentTarget.style.background = '#667eea'
                              }}
                            >
                              <i className="fas fa-camera"></i>
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                width: '35px',
                                height: '35px',
                                borderRadius: '50%',
                                background: '#ef4444',
                                border: '3px solid white',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.9rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1)'
                                e.currentTarget.style.background = '#dc2626'
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)'
                                e.currentTarget.style.background = '#ef4444'
                              }}
                              title="Remove logo"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </>
                        ) : (
                          <div
                            onClick={handleLogoClick}
                            style={{
                              width: '180px',
                              height: '180px',
                              border: '3px dashed #cbd5e1',
                              borderRadius: '12px',
                              background: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.75rem',
                              transition: 'all 0.2s',
                              color: '#94a3b8'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.borderColor = '#667eea'
                              e.currentTarget.style.background = '#f8fafc'
                              e.currentTarget.style.color = '#667eea'
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.borderColor = '#cbd5e1'
                              e.currentTarget.style.background = 'white'
                              e.currentTarget.style.color = '#94a3b8'
                            }}
                          >
                            <i className="fas fa-cloud-upload-alt" style={{ fontSize: '3rem' }}></i>
                            <div style={{ textAlign: 'center', padding: '0 1rem' }}>
                              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>Upload Logo</p>
                              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>Click to browse</p>
                            </div>
                          </div>
                        )}

                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          style={{ display: 'none' }}
                        />
                      </div>

                      {/* Upload Instructions */}
                      <div style={{ flex: 1, minWidth: '250px' }}>
                        <h4 style={{ margin: '0 0 0.75rem 0', color: '#475569', fontSize: '1rem' }}>
                          Upload Company Logo
                        </h4>
                        <ul style={{
                          margin: 0,
                          padding: '0 0 0 1.25rem',
                          color: '#64748b',
                          fontSize: '0.9rem',
                          lineHeight: '1.8'
                        }}>
                          <li>Recommended size: 400x400px</li>
                          <li>Format: JPG, PNG, GIF, WEBP, SVG</li>
                          <li>Maximum size: 5MB</li>
                          <li>Square or transparent background works best</li>
                        </ul>

                        {!logoPreview && !formData.logo && (
                          <button
                            type="button"
                            onClick={handleLogoClick}
                            style={{
                              marginTop: '1rem',
                              padding: '0.625rem 1.25rem',
                              background: '#667eea',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            <i className="fas fa-upload"></i> Choose File
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Alternative: Logo URL Input */}
                    <div style={{
                      marginTop: '1.5rem',
                      paddingTop: '1.5rem',
                      borderTop: '1px solid #e2e8f0'
                    }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.95rem' }}>
                        <i className="fas fa-link"></i> Or use Logo URL
                      </label>
                      <input
                        type="text"
                        value={formData.logo}
                        onChange={(e) => {
                          setFormData({ ...formData, logo: e.target.value })
                          if (e.target.value) {
                            setLogoPreview('')
                            setLogoFile(null)
                          }
                        }}
                        placeholder="https://example.com/logo.png"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '0.95rem'
                        }}
                      />
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem', marginBottom: 0 }}>
                        Enter an external URL if you prefer not to upload a file
                      </p>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '0.875rem',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}
                  >
                    <i className="fas fa-save"></i> {editingJob ? 'Update Job' : 'Create Job'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    style={{
                      flex: 1,
                      padding: '0.875rem',
                      background: 'white',
                      color: '#64748b',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}
                  >
                    Cancel
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
