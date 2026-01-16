import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { Job } from '@/lib/types'
import Head from 'next/head'
import Link from 'next/link'
import { API_ENDPOINTS, apiRequest } from '@/lib/api'

export default function JobDetail() {
  const router = useRouter()
  const { id } = router.query
  const [job, setJob] = useState<Job | null>(null)
  const [similarJobs, setSimilarJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    if (id) {
      fetchJob()
      checkApplicationStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (!id) return
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('access_token')
    if (!token) return

    const check = async () => {
      try {
        const data = await apiRequest(API_ENDPOINTS.SAVED_JOB(String(id)))
        if (data?.success) {
          setIsSaved(!!data.saved)
        }
      } catch (e) {
        // Ignore token errors etc.
      }
    }

    check()
  }, [id])

  const fetchJob = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setJob(data.job)
        // Fetch similar jobs based on category
        fetchSimilarJobs(data.job.category, data.job.id)
      } else {
        setError('Job not found')
      }
    } catch (err) {
      setError('Error loading job details')
      console.error('Error fetching job:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSimilarJobs = async (category: string, currentJobId: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/jobs')
      const data = await response.json()
      
      if (data.success) {
        // Filter jobs by same category, exclude current job, limit to 3
        const filtered = data.jobs
          .filter((j: Job) => j.category === category && j.id !== currentJobId && j.status === 'active')
          .slice(0, 3)
        setSimilarJobs(filtered)
      }
    } catch (err) {
      console.error('Error fetching similar jobs:', err)
    }
  }

  const checkApplicationStatus = async () => {
    if (!id) return
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('access_token')
    if (!token) return

    try {
      const data = await apiRequest(API_ENDPOINTS.CHECK_APPLICATION(String(id)))
      if (data?.success) {
        setHasApplied(!!data.applied)
      }
    } catch (e) {
      // User not logged in or other error - ignore
    }
  }

  const handleApply = async () => {
    if (!id) return
    if (typeof window === 'undefined') return
    
    const token = localStorage.getItem('access_token')
    if (!token) {
      alert('Please log in to apply for jobs.')
      router.push('/login')
      return
    }

    setApplying(true)
    try {
      const data = await apiRequest(API_ENDPOINTS.APPLICATIONS, {
        method: 'POST',
        body: JSON.stringify({ job_id: id })
      })

      if (data?.success) {
        setHasApplied(true)
        alert('Application submitted successfully!')
      } else {
        alert(data?.message || 'Failed to submit application')
      }
    } catch (error: any) {
      console.error('Error applying:', error)
      alert(error?.message || 'Failed to submit application. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  const handleSaveJob = async () => {
    if (!id) return
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('access_token')
    if (!token) {
      alert('Please log in to save jobs.')
      return
    }

    setSaving(true)
    try {
      if (isSaved) {
        await apiRequest(API_ENDPOINTS.SAVED_JOB(String(id)), { method: 'DELETE' })
        setIsSaved(false)
      } else {
        await apiRequest(API_ENDPOINTS.SAVED_JOB(String(id)), { method: 'POST' })
        setIsSaved(true)
      }
    } catch (error) {
      console.error('Error saving job:', error)
      alert('Failed to update saved job. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#f97316', marginBottom: '1rem' }}></i>
          <p>Loading job details...</p>
        </div>
      </Layout>
    )
  }

  if (error || !job) {
    return (
      <Layout>
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h1>Job Not Found</h1>
          <p>{error}</p>
          <Link href="/#jobs">
            <button className="btn-primary" style={{ marginTop: '1rem' }}>
              Back to Jobs
            </button>
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <>
      <Head>
        <title>{job.title} at {job.company} - AhhChip</title>
      </Head>
      <Layout>
        <div className="job-detail-page" style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '2rem' 
        }}>
          {/* Back Button */}
          <button 
            onClick={() => router.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              color: 'var(--primary-orange)',
              fontSize: '1rem',
              cursor: 'pointer',
              marginBottom: '1.5rem',
              padding: '0.5rem 0',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
          >
            <i className="fas fa-arrow-left"></i>
            <span>Back to Jobs</span>
          </button>

          {/* Breadcrumb */}
          <div className="breadcrumb" style={{ 
            marginBottom: '2rem', 
            fontSize: '0.9rem',
            color: 'var(--light-text)' 
          }}>
            <Link href="/#jobs" style={{ color: 'var(--primary-orange)', textDecoration: 'none' }}>
              Jobs
            </Link>
            <span style={{ margin: '0 0.5rem' }}>/</span>
            <span>{job.title}</span>
          </div>

          {/* Job Header */}
          <div className="job-detail-header" style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '12px',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                  <div className="job-company-logo" style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    background: 'var(--light-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {job.logo ? (
                      <img src={job.logo} alt={job.company} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '12px' }} />
                    ) : (
                      <i className="fas fa-building" style={{ fontSize: '2rem', color: 'var(--light-text)' }}></i>
                    )}
                  </div>
                  <div>
                    <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{job.title}</h1>
                    <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)' }}>
                      <strong>{job.company}</strong>
                    </p>
                  </div>
                </div>

                <div className="job-meta-tags" style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  flexWrap: 'wrap',
                  marginTop: '1.5rem' 
                }}>
                  <span className="meta-tag" style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--light-bg)',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary-orange)' }}></i>
                    {job.location}
                  </span>
                  <span className="meta-tag" style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--light-bg)',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <i className="fas fa-clock" style={{ color: 'var(--primary-orange)' }}></i>
                    {job.jobType}
                  </span>
                  <span className="meta-tag" style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--light-bg)',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <i className="fas fa-briefcase" style={{ color: 'var(--primary-orange)' }}></i>
                    {job.category}
                  </span>
                  <span className="meta-tag" style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--light-bg)',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <i className="fas fa-dollar-sign" style={{ color: 'var(--primary-orange)' }}></i>
                    {job.salary}
                  </span>
                  {job.postedDate && (
                    <span className="meta-tag" style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--light-bg)',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <i className="fas fa-calendar" style={{ color: 'var(--primary-orange)' }}></i>
                      Posted {new Date(job.postedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '200px', marginTop: '2rem' }}>
                <button 
                  className={hasApplied ? "btn-secondary" : "btn-primary"} 
                  onClick={handleApply}
                  disabled={applying || hasApplied}
                  style={{ 
                    width: '100%',
                    padding: '1rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    opacity: (applying || hasApplied) ? 0.7 : 1,
                    cursor: (applying || hasApplied) ? 'not-allowed' : 'pointer'
                  }}>
                  <i className={hasApplied ? "fas fa-check" : "fas fa-paper-plane"}></i> {hasApplied ? 'Applied' : applying ? 'Applying...' : 'Apply Now'}
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={handleSaveJob}
                  disabled={saving}
                  style={{ 
                    width: '100%',
                    padding: '1rem 1.5rem',
                    fontSize: '1rem',
                    opacity: saving ? 0.7 : 1,
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}>
                  <i className={isSaved ? 'fas fa-heart' : 'far fa-heart'}></i> {isSaved ? 'Saved' : 'Save Job'}
                </button>
              </div>
            </div>
          </div>

          {/* Job Content */}
          <div className="job-detail-content" style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '2rem'
          }}>
            {/* Main Content */}
            <div>
              {/* Job Description */}
              <div className="detail-section" style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ 
                  marginBottom: '1rem',
                  fontSize: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <i className="fas fa-file-alt" style={{ color: 'var(--primary-orange)' }}></i>
                  Job Description
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-color)' }}>
                  {job.description}
                </p>
              </div>

              {/* Requirements */}
              <div className="detail-section" style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ 
                  marginBottom: '1rem',
                  fontSize: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <i className="fas fa-list-check" style={{ color: 'var(--primary-orange)' }}></i>
                  Requirements
                </h2>
                <div style={{ lineHeight: '1.8', color: 'var(--text-color)', whiteSpace: 'pre-line' }}>
                  {job.requirements}
                </div>
              </div>

              {/* Responsibilities Section */}
              <div className="detail-section" style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ 
                  marginBottom: '1rem',
                  fontSize: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <i className="fas fa-tasks" style={{ color: 'var(--primary-orange)' }}></i>
                  Responsibilities
                </h2>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-color)', paddingLeft: '1.5rem' }}>
                  <li>Collaborate with team members on projects</li>
                  <li>Deliver high-quality work on time</li>
                  <li>Participate in team meetings and discussions</li>
                  <li>Contribute to continuous improvement initiatives</li>
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              {/* Company Info */}
              <div className="detail-section" style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ 
                  marginBottom: '1rem',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <i className="fas fa-building" style={{ color: 'var(--primary-orange)' }}></i>
                  About Company
                </h3>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.6', marginBottom: '1rem' }}>
                  {job.company} is a leading company in the {job.category} industry, committed to excellence and innovation.
                </p>
              </div>

              {/* Job Overview */}
              <div className="detail-section" style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ 
                  marginBottom: '1rem',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <i className="fas fa-info-circle" style={{ color: 'var(--primary-orange)' }}></i>
                  Job Overview
                </h3>
                <div className="overview-items">
                  <div className="overview-item" style={{ 
                    padding: '0.75rem 0',
                    borderBottom: '1px solid var(--light-bg)'
                  }}>
                    <div style={{ color: 'var(--light-text)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      Job ID
                    </div>
                    <div style={{ fontWeight: 600 }}>{job.id}</div>
                  </div>
                  <div className="overview-item" style={{ 
                    padding: '0.75rem 0',
                    borderBottom: '1px solid var(--light-bg)'
                  }}>
                    <div style={{ color: 'var(--light-text)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      Location
                    </div>
                    <div style={{ fontWeight: 600 }}>{job.location}</div>
                  </div>
                  <div className="overview-item" style={{ 
                    padding: '0.75rem 0',
                    borderBottom: '1px solid var(--light-bg)'
                  }}>
                    <div style={{ color: 'var(--light-text)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      Job Type
                    </div>
                    <div style={{ fontWeight: 600 }}>{job.jobType}</div>
                  </div>
                  <div className="overview-item" style={{ 
                    padding: '0.75rem 0',
                    borderBottom: '1px solid var(--light-bg)'
                  }}>
                    <div style={{ color: 'var(--light-text)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      Salary
                    </div>
                    <div style={{ fontWeight: 600 }}>{job.salary}</div>
                  </div>
                  <div className="overview-item" style={{ 
                    padding: '0.75rem 0'
                  }}>
                    <div style={{ color: 'var(--light-text)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      Status
                    </div>
                    <div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: '#dcfce7',
                        color: '#166534',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>
                        {job.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              {(job.contactEmail || job.contactPhone || job.website) && (
                <div className="detail-section" style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  marginBottom: '2rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ 
                    marginBottom: '1rem',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <i className="fas fa-address-card" style={{ color: 'var(--primary-orange)' }}></i>
                    Contact Information
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {job.contactEmail && (
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.5rem',
                        background: 'var(--light-bg)',
                        borderRadius: '8px'
                      }}>
                        <i className="fas fa-envelope" style={{ color: 'var(--primary-orange)', fontSize: '1.1rem' }}></i>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--light-text)', marginBottom: '0.15rem' }}>Email</div>
                          <a href={`mailto:${job.contactEmail}`} style={{ 
                            color: 'var(--text-color)',
                            textDecoration: 'none',
                            wordBreak: 'break-word',
                            fontSize: '0.9rem'
                          }}>
                            {job.contactEmail}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {job.contactPhone && (
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.5rem',
                        background: 'var(--light-bg)',
                        borderRadius: '8px'
                      }}>
                        <i className="fas fa-phone" style={{ color: 'var(--primary-orange)', fontSize: '1.1rem' }}></i>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--light-text)', marginBottom: '0.15rem' }}>Phone</div>
                          <a href={`tel:${job.contactPhone}`} style={{ 
                            color: 'var(--text-color)',
                            textDecoration: 'none',
                            fontSize: '0.9rem'
                          }}>
                            {job.contactPhone}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {job.website && (
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.5rem',
                        background: 'var(--light-bg)',
                        borderRadius: '8px'
                      }}>
                        <i className="fas fa-globe" style={{ color: 'var(--primary-orange)', fontSize: '1.1rem' }}></i>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--light-text)', marginBottom: '0.15rem' }}>Website</div>
                          <a href={job.website} target="_blank" rel="noopener noreferrer" style={{ 
                            color: 'var(--primary-orange)',
                            textDecoration: 'none',
                            wordBreak: 'break-all',
                            fontSize: '0.9rem'
                          }}>
                            {job.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Share Job */}
              <div className="detail-section" style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ 
                  marginBottom: '1rem',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <i className="fas fa-share-alt" style={{ color: 'var(--primary-orange)' }}></i>
                  Share Job
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button style={{
                    padding: '0.75rem 1rem',
                    background: '#1877f2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    flex: 1
                  }}>
                    <i className="fab fa-facebook-f"></i>
                  </button>
                  <button style={{
                    padding: '0.75rem 1rem',
                    background: '#1da1f2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    flex: 1
                  }}>
                    <i className="fab fa-twitter"></i>
                  </button>
                  <button style={{
                    padding: '0.75rem 1rem',
                    background: '#0077b5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    flex: 1
                  }}>
                    <i className="fab fa-linkedin-in"></i>
                  </button>
                  <button style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--light-bg)',
                    color: 'var(--text-color)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    flex: 1
                  }}>
                    <i className="fas fa-link"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Jobs */}
          <div className="similar-jobs" style={{ marginTop: '3rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>Similar Jobs</h2>
            {similarJobs.length > 0 ? (
              <div style={{ position: 'relative' }}>
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  overflowX: 'auto',
                  scrollBehavior: 'smooth',
                  paddingBottom: '1rem',
                  marginBottom: '1rem'
                }}>
                  {similarJobs.map((similarJob) => (
                    <Link key={similarJob.id} href={`/jobs/${similarJob.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="job-card" style={{ 
                        minWidth: '280px',
                        maxWidth: '280px',
                        cursor: 'pointer'
                      }}>
                        <div className="job-header">
                          <div className="job-company-logo">
                            {similarJob.logo ? (
                              <img src={similarJob.logo} alt={similarJob.company} />
                            ) : (
                              <i className="fas fa-building"></i>
                            )}
                          </div>
                          <div className="job-header-content">
                            <div className="job-header-top">
                              <p className="company-name">{similarJob.company}</p>
                              <button className="btn-save-job" onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                alert('Job saved!')
                              }}>
                                <i className="far fa-heart"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <h3 className="job-title">{similarJob.title}</h3>
                        <p className="job-salary">{similarJob.salary}</p>
                        
                        <div className="job-info-row">
                          <span className="job-info-item">
                            <i className="fas fa-map-marker-alt"></i>
                            {similarJob.location}
                          </span>
                        </div>
                        
                        <div className="job-info-row">
                          <span className="job-info-item">
                            <i className="fas fa-briefcase"></i>
                            {similarJob.jobType}
                          </span>
                          <span className="job-info-item">
                            <i className="fas fa-calendar"></i>
                            {similarJob.postedDate ? new Date(similarJob.postedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '15 Jan 2026'}
                          </span>
                        </div>
                        
                        <button className="btn-view-more">View More</button>
                      </div>
                    </Link>
                  ))}
                  
                  {/* Browse All Jobs Card */}
                  <Link href="/#jobs" style={{ textDecoration: 'none' }}>
                    <div style={{
                      minWidth: '280px',
                      maxWidth: '280px',
                      background: 'linear-gradient(135deg, var(--primary-orange) 0%, #e8590c 100%)',
                      borderRadius: '12px',
                      padding: '2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      color: 'white',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <i className="fas fa-briefcase" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.9 }}></i>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Browse All Jobs</h3>
                      <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Explore more opportunities</p>
                      <i className="fas fa-arrow-right" style={{ fontSize: '1.5rem', marginTop: '1rem' }}></i>
                    </div>
                  </Link>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--light-text)' }}>No similar jobs found in {job.category}</p>
            )}
          </div>
        </div>
      </Layout>
    </>
  )
}
