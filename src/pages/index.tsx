import { useEffect, useState, useRef } from 'react'
import Layout from '@/components/Layout'
import { Job } from '@/lib/types'
import Head from 'next/head'
import Link from 'next/link'
import { API_ENDPOINTS, apiRequest } from '@/lib/api'

export default function Home() {
  const [activeSection, setActiveSection] = useState('jobs')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [savedJobIds, setSavedJobIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setMounted(true)

    // Check authentication status - SSR safe
    if (typeof window !== 'undefined') {
      const currentUser = localStorage.getItem('currentUser')
      setIsLoggedIn(!!currentUser)
    }

    // Load jobs
    fetchJobs(currentPage)

    // Load saved job IDs (for heart icons)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        fetchSavedJobIds()
      }
    }

    // Function to handle hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1)
      if (hash && (hash === 'cv' || hash === 'jobs' || hash === 'my-jobs' || hash === 'profile')) {
        setActiveSection(hash)
        // Scroll to top when switching sections
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (!hash) {
        setActiveSection('jobs')
      }
    }

    // Initial hash check with small delay to ensure DOM is ready
    setTimeout(handleHashChange, 100)

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange, false)

    // Also listen for clicks on hash links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href^="#"]')
      if (link) {
        setTimeout(handleHashChange, 50)
      }
    }

    document.addEventListener('click', handleClick, false)

    return () => {
      window.removeEventListener('hashchange', handleHashChange, false)
      document.removeEventListener('click', handleClick, false)
    }
  }, [])

  const fetchSavedJobIds = async () => {
    try {
      const data = await apiRequest(API_ENDPOINTS.SAVED_JOB_IDS)
      if (data?.success) {
        setSavedJobIds(Array.isArray(data.job_ids) ? data.job_ids : [])
      }
    } catch (error) {
      // If user isn't logged in / token expired, just ignore.
      console.error('Error fetching saved job IDs:', error)
    }
  }

  const toggleSavedJob = async (jobId: string) => {
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('access_token')
    if (!token) {
      alert('Please log in to save jobs.')
      return
    }

    const currentlySaved = savedJobIds.includes(jobId)

    // Optimistic update for snappy UI
    setSavedJobIds((prev) => {
      if (currentlySaved) return prev.filter((id) => id !== jobId)
      return [...prev, jobId]
    })

    try {
      if (currentlySaved) {
        await apiRequest(API_ENDPOINTS.SAVED_JOB(jobId), { method: 'DELETE' })
      } else {
        await apiRequest(API_ENDPOINTS.SAVED_JOB(jobId), { method: 'POST' })
      }
    } catch (error) {
      // Revert on failure
      setSavedJobIds((prev) => {
        if (currentlySaved) return [...prev, jobId]
        return prev.filter((id) => id !== jobId)
      })
      console.error('Error toggling saved job:', error)
      alert('Failed to update saved job. Please try again.')
    }
  }

  const fetchJobs = async (page = 1) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/jobs?page=${page}&per_page=100`)
      const data = await response.json()
      if (data.success) {
        setJobs(data.jobs)
        setTotalPages(data.pages || 1)
        setCurrentPage(data.page || 1)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchJobs(page)
      // Scroll to jobs section
      const jobsElement = document.getElementById('jobs')
      if (jobsElement) {
        jobsElement.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <>
      <Head>
        <title>AhhChip - Smart Resume Tracker</title>
      </Head>
      <Layout>
        {/* CV Section */}
        <section id="cv" className={`section ${activeSection === 'cv' ? 'active' : ''}`} style={{ display: activeSection === 'cv' ? 'block' : 'none', minHeight: '100vh' }}>
          <div className="section-container">
            <CVSection />
          </div>
        </section>

        {/* Jobs Section */}
        <section id="jobs" className={`section ${activeSection === 'jobs' ? 'active' : ''}`} style={{ display: activeSection === 'jobs' ? 'block' : 'none', minHeight: '100vh' }}>
          <JobsSection
            jobs={jobs}
            loading={loading}
            savedJobIds={savedJobIds}
            onToggleSave={toggleSavedJob}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>

        {/* My Jobs Section */}
        <section id="my-jobs" className={`section ${activeSection === 'my-jobs' ? 'active' : ''}`} style={{ display: activeSection === 'my-jobs' ? 'block' : 'none', minHeight: '100vh' }}>
          <MyJobsSection />
        </section>

        {/* Profile Section */}
        <section id="profile" className={`section ${activeSection === 'profile' ? 'active' : ''}`} style={{ display: activeSection === 'profile' ? 'block' : 'none', minHeight: '100vh' }}>
          <ProfileSection />
        </section>
      </Layout>
    </>
  )
}

// CV Section Component
function CVSection() {
  const [showCVMenu, setShowCVMenu] = useState<number | null>(null)
  const [showCVViewer, setShowCVViewer] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageContent, setMessageContent] = useState('')
  const [selectedCV, setSelectedCV] = useState<string | null>(null)
  const [profilePhoto, setProfilePhoto] = useState('/noprofile.png')
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cvUploadRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)

    if (typeof window !== 'undefined') {
      const currentUser = localStorage.getItem('currentUser')
      setIsLoggedIn(!!currentUser)
    }
  }, [])

  const showMessage = (message: string) => {
    setMessageContent(message)
    setShowMessageModal(true)
  }

  const [profileData, setProfileData] = useState({
    fullName: 'Not provided',
    email: 'Not provided',
    phone: 'Not provided',
    gender: 'Not provided',
    dateOfBirth: 'Not provided',
    location: 'Not provided',
    education: 'No education information provided',
    workExperience: 'No work experience provided',
    skills: 'No skills provided',
    languages: 'No languages provided',
    certifications: 'No certifications provided',
    professionalSummary: 'No professional summary provided'
  })

  const [pastCVs, setPastCVs] = useState<any[]>([])
  const [loadingCVs, setLoadingCVs] = useState(false)

  // Fetch CVs from backend
  useEffect(() => {
    const fetchCVs = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) return

      setLoadingCVs(true)
      try {
        const response = await fetch('/api/profile/cvs', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setPastCVs(data.cvs || [])
        }
      } catch (error) {
        console.error('Error fetching CVs:', error)
      } finally {
        setLoadingCVs(false)
      }
    }

    if (isLoggedIn) {
      fetchCVs()
    }
  }, [isLoggedIn])

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
      showMessage('Profile photo updated successfully!')
    }
  }

  const handleSetAsCurrent = (id: number) => {
    showMessage(`CV ${id} set as current! ML model will analyze automatically...`)
    setShowCVMenu(null)
  }

  const handleViewCV = (cvName: string) => {
    setSelectedCV(cvName)
    setShowCVViewer(true)
    setShowCVMenu(null)
  }

  const handleDeleteCV = (id: number) => {
    if (confirm('Are you sure you want to delete this CV?')) {
      showMessage(`CV ${id} deleted!`)
      setShowCVMenu(null)
    }
  }

  const handleDownloadCV = () => {
    showMessage('Downloading CV...')
  }

  const handleEditSection = (section: string) => {
    setEditingSection(section)
  }

  const handleSaveSection = () => {
    showMessage('Profile information saved successfully!')
    setEditingSection(null)
  }

  const handleUploadCV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const fileType = file.name.split('.').pop()?.toLowerCase()
      if (fileType === 'pdf' || fileType === 'doc' || fileType === 'docx') {
        showMessage(`CV "${file.name}" uploaded successfully! ML model will analyze automatically...`)
        setShowUploadModal(false)
      } else {
        showMessage('Please upload a PDF, DOC, or DOCX file.')
      }
    }
  }

  const scrollToProfileInfo = () => {
    const profileSection = document.querySelector('.profile-fields')
    if (profileSection) {
      profileSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (!isLoggedIn) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
        <i className="fas fa-lock" style={{ fontSize: '4rem', color: '#f97316', marginBottom: '1.5rem', display: 'block' }}></i>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1e293b' }}>Sign In Required</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Please sign in to upload and manage your CV, and access personalized job recommendations.
        </p>
        <Link href="/login">
          <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            <i className="fas fa-sign-in-alt"></i> Sign In Now
          </button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <aside className="cv-sidebar">
        <h3>Past CVs</h3>
        <div className="cv-list">
          {pastCVs.map((cv) => (
            <div key={cv.id} className={`cv-item ${cv.isCurrent ? 'active' : ''}`} style={{ position: 'relative' }}>
              <div className="cv-icon"><i className="fas fa-file-pdf"></i></div>
              <div className="cv-info">
                <h4>{cv.name}</h4>
                <span className="cv-date">{cv.date}</span>
              </div>
              <button
                onClick={() => setShowCVMenu(showCVMenu === cv.id ? null : cv.id)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: 'var(--light-text)',
                  padding: '0.5rem'
                }}
              >
                <i className="fas fa-ellipsis-v"></i>
              </button>
              {showCVMenu === cv.id && (
                <div style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '100%',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  minWidth: '180px',
                  zIndex: 100,
                  overflow: 'hidden',
                  marginTop: '0.5rem'
                }}>
                  {!cv.isCurrent && (
                    <button
                      onClick={() => handleSetAsCurrent(cv.id)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '0.95rem',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <i className="fas fa-check-circle" style={{ color: 'var(--primary-orange)' }}></i>
                      Set as Current
                    </button>
                  )}
                  <button
                    onClick={() => handleViewCV(cv.name)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.95rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <i className="fas fa-eye" style={{ color: 'var(--primary-orange)' }}></i>
                    View CV
                  </button>
                  <button
                    onClick={() => handleDeleteCV(cv.id)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.95rem',
                      color: '#ef4444',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <i className="fas fa-trash"></i>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      <div className="cv-main">
        <div className="cv-hero">
          <div className="cv-header">
            <div className="cv-title-section">
              <h2>Current Active CV</h2>
              {pastCVs.find(cv => cv.is_active) ? (
                <div className="cv-meta">
                  <span className="cv-name">{pastCVs.find(cv => cv.is_active)?.name}</span>
                  <span className="cv-upload-date">Uploaded: {new Date(pastCVs.find(cv => cv.is_active)?.upload_date).toLocaleDateString()}</span>
                  <span className="cv-status completed">{pastCVs.find(cv => cv.is_active)?.status}</span>
                </div>
              ) : (
                <div className="cv-meta">
                  <span style={{ color: '#64748b' }}>No active CV. Upload your CV to get started.</span>
                </div>
              )}
            </div>
            <div className="cv-actions">
              <button className="btn-action" onClick={scrollToProfileInfo}><i className="fas fa-edit"></i> Edit Profile</button>
              {pastCVs.find(cv => cv.is_active) && (
                <button className="btn-action" onClick={() => handleViewCV(pastCVs.find(cv => cv.is_active)?.name)}><i className="fas fa-eye"></i> View Full CV</button>
              )}
              <button className="btn-action" onClick={() => setShowUploadModal(true)}><i className="fas fa-upload"></i> Upload CV</button>
            </div>
          </div>
        </div>

        <div className="profile-fields">
          <h3>Profile Information</h3>

          <div className="profile-header-section">
            <div className="profile-image-container">
              <img src={profilePhoto} alt="Profile" className="profile-image" />
              <button className="btn-edit-image" onClick={handlePhotoClick}>
                <i className="fas fa-camera"></i>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="field-group">
            <div className="field-header">
              <h4><i className="fas fa-user"></i> Personal Details</h4>
              <button className="btn-edit-field" onClick={() => handleEditSection('personal')}>
                <i className="fas fa-edit"></i>
              </button>
            </div>
            <div className="field-content">
              {editingSection === 'personal' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input type="text" placeholder="Full Name" defaultValue={profileData.fullName} style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
                  <input type="email" placeholder="Email" defaultValue={profileData.email} style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
                  <input type="tel" placeholder="Phone" defaultValue={profileData.phone} style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
                  <input type="text" placeholder="Gender" defaultValue={profileData.gender} style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
                  <input type="date" placeholder="Date of Birth" defaultValue={profileData.dateOfBirth} style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
                  <input type="text" placeholder="Location" defaultValue={profileData.location} style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
                  <button className="btn-primary" onClick={handleSaveSection} style={{ alignSelf: 'flex-start' }}>Save</button>
                </div>
              ) : (
                <div className="info-display">
                  <div className="info-row">
                    <span className="info-label">Full Name:</span>
                    <span className="info-value">{profileData.fullName}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{profileData.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Phone:</span>
                    <span className="info-value">{profileData.phone}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Gender:</span>
                    <span className="info-value">{profileData.gender}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Date of Birth:</span>
                    <span className="info-value">{profileData.dateOfBirth}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Location:</span>
                    <span className="info-value">{profileData.location}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="field-group">
            <div className="field-header">
              <h4><i className="fas fa-graduation-cap"></i> Education</h4>
              <button className="btn-edit-field" onClick={() => handleEditSection('education')}>
                <i className="fas fa-edit"></i>
              </button>
            </div>
            <div className="field-content">
              {editingSection === 'education' ? (
                <div>
                  <textarea placeholder="Add education information..." defaultValue={profileData.education} style={{ width: '100%', minHeight: '100px', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontFamily: 'inherit' }} />
                  <button className="btn-primary" onClick={handleSaveSection} style={{ marginTop: '1rem' }}>Save</button>
                </div>
              ) : (
                <p style={{ color: 'var(--light-text)', fontStyle: 'italic' }}>{profileData.education}</p>
              )}
            </div>
          </div>

          <div className="field-group">
            <div className="field-header">
              <h4><i className="fas fa-briefcase"></i> Work Experience</h4>
              <button className="btn-edit-field" onClick={() => handleEditSection('work')}>
                <i className="fas fa-edit"></i>
              </button>
            </div>
            <div className="field-content">
              {editingSection === 'work' ? (
                <div>
                  <textarea placeholder="Add work experience..." defaultValue={profileData.workExperience} style={{ width: '100%', minHeight: '100px', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontFamily: 'inherit' }} />
                  <button className="btn-primary" onClick={handleSaveSection} style={{ marginTop: '1rem' }}>Save</button>
                </div>
              ) : (
                <p style={{ color: 'var(--light-text)', fontStyle: 'italic' }}>{profileData.workExperience}</p>
              )}
            </div>
          </div>

          <div className="field-group">
            <div className="field-header">
              <h4><i className="fas fa-tools"></i> Skills</h4>
              <button className="btn-edit-field" onClick={() => handleEditSection('skills')}>
                <i className="fas fa-edit"></i>
              </button>
            </div>
            <div className="field-content">
              {editingSection === 'skills' ? (
                <div>
                  <textarea placeholder="Add skills..." defaultValue={profileData.skills} style={{ width: '100%', minHeight: '100px', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontFamily: 'inherit' }} />
                  <button className="btn-primary" onClick={handleSaveSection} style={{ marginTop: '1rem' }}>Save</button>
                </div>
              ) : (
                <p style={{ color: 'var(--light-text)', fontStyle: 'italic' }}>{profileData.skills}</p>
              )}
            </div>
          </div>

          <div className="field-group">
            <div className="field-header">
              <h4><i className="fas fa-language"></i> Languages</h4>
              <button className="btn-edit-field" onClick={() => handleEditSection('languages')}>
                <i className="fas fa-edit"></i>
              </button>
            </div>
            <div className="field-content">
              {editingSection === 'languages' ? (
                <div>
                  <textarea placeholder="Add languages..." defaultValue={profileData.languages} style={{ width: '100%', minHeight: '100px', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontFamily: 'inherit' }} />
                  <button className="btn-primary" onClick={handleSaveSection} style={{ marginTop: '1rem' }}>Save</button>
                </div>
              ) : (
                <p style={{ color: 'var(--light-text)', fontStyle: 'italic' }}>{profileData.languages}</p>
              )}
            </div>
          </div>

          <div className="field-group">
            <div className="field-header">
              <h4><i className="fas fa-certificate"></i> Certifications</h4>
              <button className="btn-edit-field" onClick={() => handleEditSection('certifications')}>
                <i className="fas fa-edit"></i>
              </button>
            </div>
            <div className="field-content">
              {editingSection === 'certifications' ? (
                <div>
                  <textarea placeholder="Add certifications..." defaultValue={profileData.certifications} style={{ width: '100%', minHeight: '100px', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontFamily: 'inherit' }} />
                  <button className="btn-primary" onClick={handleSaveSection} style={{ marginTop: '1rem' }}>Save</button>
                </div>
              ) : (
                <p style={{ color: 'var(--light-text)', fontStyle: 'italic' }}>{profileData.certifications}</p>
              )}
            </div>
          </div>

          <div className="field-group">
            <div className="field-header">
              <h4><i className="fas fa-file-alt"></i> Professional Summary</h4>
              <button className="btn-edit-field" onClick={() => handleEditSection('summary')}>
                <i className="fas fa-edit"></i>
              </button>
            </div>
            <div className="field-content">
              {editingSection === 'summary' ? (
                <div>
                  <textarea placeholder="Add professional summary..." defaultValue={profileData.professionalSummary} style={{ width: '100%', minHeight: '100px', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontFamily: 'inherit' }} />
                  <button className="btn-primary" onClick={handleSaveSection} style={{ marginTop: '1rem' }}>Save</button>
                </div>
              ) : (
                <p style={{ color: 'var(--light-text)', fontStyle: 'italic' }}>{profileData.professionalSummary}</p>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Upload CV Modal */}
      {showUploadModal && (
        <div className="modal-overlay active" onClick={() => setShowUploadModal(false)} style={{ zIndex: 1000 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Upload New CV</h2>
              <button className="close-btn" onClick={() => setShowUploadModal(false)}>&times;</button>
            </div>

            <div style={{ padding: '1rem 0' }}>
              <div style={{
                border: '2px dashed #d1d5db',
                borderRadius: '12px',
                padding: '3rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
                onClick={() => cvUploadRef.current?.click()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary-orange)'
                  e.currentTarget.style.background = 'rgba(255, 140, 66, 0.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <i className="fas fa-cloud-upload-alt" style={{ fontSize: '3rem', color: 'var(--primary-orange)', marginBottom: '1rem' }}></i>
                <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Click to upload or drag and drop</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--light-text)' }}>Supported formats: PDF, DOC, DOCX</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--light-text)', marginTop: '0.5rem' }}>Maximum file size: 10MB</p>
              </div>
              <input
                ref={cvUploadRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleUploadCV}
                style={{ display: 'none' }}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowUploadModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CV Viewer Modal */}
      {showCVViewer && (
        <div className="modal-overlay active" onClick={() => setShowCVViewer(false)} style={{ zIndex: 1000 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh' }}>
            <div className="modal-header">
              <h2>View CV: {selectedCV}</h2>
              <button className="close-btn" onClick={() => setShowCVViewer(false)}>&times;</button>
            </div>

            <div style={{ padding: '2rem', background: '#f9fafb', borderRadius: '8px', minHeight: '500px', maxHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
              <div style={{ textAlign: 'center' }}>
                <i className="fas fa-file-pdf" style={{ fontSize: '4rem', color: 'var(--primary-orange)', marginBottom: '1rem' }}></i>
                <p style={{ color: 'var(--light-text)' }}>CV Preview: {selectedCV}</p>
                <p style={{ color: 'var(--light-text)', fontSize: '0.9rem' }}>Full PDF viewer would be integrated here</p>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowCVViewer(false)}>
                <i className="fas fa-times"></i> Close
              </button>
              <button className="btn-primary" onClick={handleDownloadCV}>
                <i className="fas fa-download"></i> Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="modal-overlay active" onClick={() => setShowMessageModal(false)} style={{ zIndex: 1001 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Notification</h2>
              <button className="close-btn" onClick={() => setShowMessageModal(false)}>&times;</button>
            </div>

            <div style={{ padding: '1.5rem 0' }}>
              <p style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--dark-text)' }}>{messageContent}</p>
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setShowMessageModal(false)} style={{ width: '100%', justifyContent: 'center' }}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Jobs Section Component
function JobsSection({
  jobs,
  loading,
  savedJobIds,
  onToggleSave,
  currentPage,
  totalPages,
  onPageChange
}: {
  jobs: Job[],
  loading: boolean,
  savedJobIds: string[],
  onToggleSave: (jobId: string) => void,
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void
}) {
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [activeFilterType, setActiveFilterType] = useState<string | null>(null)
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(jobs)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    categories: [] as string[],
    locations: [] as string[],
    salaryRanges: [] as string[],
    jobTypes: [] as string[]
  })

  // Apply filters and search whenever jobs, filter values, or search term change
  useEffect(() => {
    let result = [...jobs]

    // Apply search term filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      result = result.filter(job =>
        job.title.toLowerCase().includes(search) ||
        job.company.toLowerCase().includes(search) ||
        job.description.toLowerCase().includes(search) ||
        job.category.toLowerCase().includes(search)
      )
    }

    if (filters.categories.length > 0) {
      result = result.filter(job => filters.categories.includes(job.category))
    }

    if (filters.locations.length > 0) {
      result = result.filter(job =>
        filters.locations.some(loc => job.location.toLowerCase().includes(loc.toLowerCase()))
      )
    }

    if (filters.jobTypes.length > 0) {
      result = result.filter(job => filters.jobTypes.includes(job.jobType))
    }

    if (filters.salaryRanges.length > 0) {
      result = result.filter(job => {
        const salaryMatch = job.salary.match(/\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/g)
        if (!salaryMatch || salaryMatch.length === 0) return false

        const jobSalaryMin = parseInt(salaryMatch[0].replace(/[$,]/g, ''))
        const jobSalaryMax = salaryMatch.length > 1
          ? parseInt(salaryMatch[1].replace(/[$,]/g, ''))
          : jobSalaryMin

        return filters.salaryRanges.some(range => {
          if (range === '$3000+') return jobSalaryMin >= 3000
          const [min, max] = range.replace(/\$/g, '').split(' - ').map(n => parseInt(n))
          return jobSalaryMin <= max && jobSalaryMax >= min
        })
      })
    }

    setFilteredJobs(result)
  }, [jobs, filters, searchTerm])

  const toggleFilter = (type: 'categories' | 'locations' | 'salaryRanges' | 'jobTypes', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }))
  }

  const resetFilters = () => {
    setFilters({
      categories: [],
      locations: [],
      salaryRanges: [],
      jobTypes: []
    })
  }

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0) || searchTerm.trim() !== ''

  const scrollToSection = (sectionId: string) => {
    setTimeout(() => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  return (
    <div className="jobs-container">
      <div className="jobs-hero-banner">
        <div className="hero-overlay"></div>
        <div className="hero-banner-content">
          <h1>Find Your Perfect Job</h1>

          <div className="hero-search-box">
            <div className="search-input-wrapper">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Job title, keywords, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    // Search is already applied via useEffect
                  }
                }}
              />
            </div>
            <button
              className="btn-hero-search"
              onClick={() => {
                // Search is already applied via useEffect, this is just for UX
                if (searchTerm.trim()) {
                  // Scroll to results
                  const jobsList = document.querySelector('.jobs-list')
                  if (jobsList) {
                    jobsList.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }
              }}
            >
              <i className="fas fa-search"></i>
              Search
            </button>
          </div>

          <div className="filter-bar-container">
            <div className="filter-chips">
              <button className="filter-chip" onClick={() => {
                setActiveFilterType('category')
                setShowFilterModal(true)
              }}>
                <i className="fas fa-briefcase"></i>
                <span>Career Category</span>
                <i className="fas fa-chevron-down"></i>
              </button>
              <button className="filter-chip" onClick={() => {
                setActiveFilterType('location')
                setShowFilterModal(true)
              }}>
                <i className="fas fa-map-marker-alt"></i>
                <span>Location</span>
                <i className="fas fa-chevron-down"></i>
              </button>
              <button className="filter-chip" onClick={() => {
                setActiveFilterType('salary')
                setShowFilterModal(true)
              }}>
                <i className="fas fa-dollar-sign"></i>
                <span>Salary Range</span>
                <i className="fas fa-chevron-down"></i>
              </button>
              <button className="filter-chip" onClick={() => {
                setActiveFilterType('jobType')
                setShowFilterModal(true)
              }}>
                <i className="fas fa-clock"></i>
                <span>Job Type</span>
                <i className="fas fa-chevron-down"></i>
              </button>
            </div>
            <button className="btn-filter-icon" onClick={() => {
              setActiveFilterType('all')
              setShowFilterModal(true)
            }}>
              <i className="fas fa-sliders-h"></i>
              <span>All Filters</span>
            </button>
          </div>

          <div className="quick-filters"></div>
        </div>
      </div>

      <h2 style={{
        textAlign: 'center',
        marginTop: '3rem',
        marginBottom: '2rem',
        fontSize: '2rem',
        fontWeight: 700,
        color: '#1e293b'
      }}>
        Available Jobs
      </h2>

      <div className="jobs-list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#f97316', marginBottom: '1rem' }}></i>
            <p>Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <i className="fas fa-search" style={{ fontSize: '3rem', color: '#64748b', marginBottom: '1rem', display: 'block' }}></i>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1e293b' }}>No Jobs Found</h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results.'
                : 'No jobs available at the moment. Check back later!'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--primary-orange)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          filteredJobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="job-card" style={{ cursor: 'pointer' }}>
                <div>
                  <div className="job-header">
                    <div className="job-company-logo">
                      {job.logo ? (
                        <img src={job.logo} alt={job.company} />
                      ) : (
                        <i className="fas fa-building"></i>
                      )}
                    </div>
                    <div className="job-header-content">
                      <div className="job-header-top">
                        <p className="company-name">{job.company}</p>
                        <button
                          className="btn-save-job"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onToggleSave(job.id)
                          }}
                          title={savedJobIds.includes(job.id) ? 'Unsave job' : 'Save job'}
                        >
                          <i className={savedJobIds.includes(job.id) ? 'fas fa-heart' : 'far fa-heart'}></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <h3 className="job-title">{job.title}</h3>
                  <p className="job-salary">{job.salary}</p>

                  <div className="job-info-row">
                    <span className="job-info-item">
                      <i className="fas fa-map-marker-alt"></i>
                      {job.location}
                    </span>
                  </div>

                  <div className="job-info-row">
                    <span className="job-info-item">
                      <i className="fas fa-briefcase"></i>
                      {job.jobType}
                    </span>
                    <span className="job-info-item">
                      <i className="fas fa-calendar"></i>
                      {job.postedDate ? new Date(job.postedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '15 Jan 2026'}
                    </span>
                  </div>
                </div>

                <button className="btn-view-more">View More</button>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination component */}
      {!loading && totalPages > 1 && (
        <div className="pagination-wrapper front-pagination">
          <button
            className="pagination-btn prev-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="fas fa-angle-double-left"></i>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="pagination-btn next-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <i className="fas fa-angle-double-right"></i>
          </button>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="modal-overlay active" onClick={() => setShowFilterModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            maxWidth: '480px',
            width: '90%',
            maxHeight: '85vh',
            background: 'white',
            borderRadius: '12px',
            padding: '0',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              padding: '1.5rem 2rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
                Filter Jobs
              </h2>
              <button
                onClick={() => setShowFilterModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: 0,
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Scrollable Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem 2rem'
            }}>
              {activeFilterType === 'category' ? (
                /* Career Category Section Only */
                <div id="filter-category" style={{ marginBottom: '2rem' }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#1f2937',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <input type="checkbox" style={{ marginRight: '0.75rem', width: '18px', height: '18px' }} />
                    Career Category
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '2rem' }}>
                    {[
                      'Technology & IT',
                      'Marketing & Sales',
                      'Finance & Accounting',
                      'Healthcare',
                      'Education',
                      'Engineering',
                      'Hospitality & Tourism',
                      'Construction'
                    ].map(cat => (
                      <label key={cat} style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        color: '#4b5563'
                      }}>
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(cat)}
                          onChange={() => toggleFilter('categories', cat)}
                          style={{ marginRight: '0.75rem', width: '16px', height: '16px' }}
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : activeFilterType === 'location' ? (
                /* Location Section Only */
                <div id="filter-location" style={{ marginBottom: '2rem' }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#1f2937',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <input type="checkbox" style={{ marginRight: '0.75rem', width: '18px', height: '18px' }} />
                    Location (Province)
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '2rem' }}>
                    {[
                      'Phnom Penh',
                      'Siem Reap',
                      'Battambang',
                      'Sihanoukville',
                      'Kampong Cham',
                      'Kampot',
                      'Remote'
                    ].map(loc => (
                      <label key={loc} style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        color: '#4b5563'
                      }}>
                        <input type="checkbox" style={{ marginRight: '0.75rem', width: '16px', height: '16px' }} />
                        <span>{loc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : activeFilterType === 'salary' ? (
                /* Salary Range Section Only */
                <div id="filter-salary" style={{ marginBottom: '2rem' }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#1f2937',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <input type="checkbox" style={{ marginRight: '0.75rem', width: '18px', height: '18px' }} />
                    Salary Range
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '2rem' }}>
                    {[
                      '$500 - $1000',
                      '$1000 - $1500',
                      '$1500 - $2000',
                      '$2000 - $3000',
                      '$3000+'
                    ].map(range => (
                      <label key={range} style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        color: '#4b5563'
                      }}>
                        <input
                          type="checkbox"
                          checked={filters.salaryRanges.includes(range)}
                          onChange={() => toggleFilter('salaryRanges', range)}
                          style={{ marginRight: '0.75rem', width: '16px', height: '16px' }}
                        />
                        <span>{range}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : activeFilterType === 'jobType' ? (
                /* Job Type Section Only */
                <div id="filter-jobType" style={{ marginBottom: '2rem' }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#1f2937',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <input type="checkbox" style={{ marginRight: '0.75rem', width: '18px', height: '18px' }} />
                    Job Type
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '2rem' }}>
                    {[
                      'Full-time',
                      'Part-time',
                      'Contract',
                      'Internship',
                      'Freelance'
                    ].map(type => (
                      <label key={type} style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        color: '#4b5563'
                      }}>
                        <input
                          type="checkbox"
                          checked={filters.jobTypes.includes(type)}
                          onChange={() => toggleFilter('jobTypes', type)}
                          style={{ marginRight: '0.75rem', width: '16px', height: '16px' }}
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Career Category Section */}
                  <div id="filter-category" style={{ marginBottom: '2rem' }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#1f2937',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <input type="checkbox" style={{ marginRight: '0.75rem', width: '18px', height: '18px' }} />
                      Career Category
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '2rem' }}>
                      {[
                        'Technology & IT',
                        'Marketing & Sales',
                        'Finance & Accounting',
                        'Healthcare',
                        'Education',
                        'Engineering',
                        'Hospitality & Tourism',
                        'Construction'
                      ].map(cat => (
                        <label key={cat} style={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          color: '#4b5563'
                        }}>
                          <input
                            type="checkbox"
                            checked={filters.categories.includes(cat)}
                            onChange={() => toggleFilter('categories', cat)}
                            style={{ marginRight: '0.75rem', width: '16px', height: '16px' }}
                          />
                          <span>{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Location Section */}
                  <div id="filter-location" style={{ marginBottom: '2rem' }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#1f2937',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <input type="checkbox" style={{ marginRight: '0.75rem', width: '18px', height: '18px' }} />
                      Location (Province)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '2rem' }}>
                      {[
                        'Phnom Penh',
                        'Siem Reap',
                        'Battambang',
                        'Sihanoukville',
                        'Kampong Cham',
                        'Kampot',
                        'Remote'
                      ].map(loc => (
                        <label key={loc} style={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          color: '#4b5563'
                        }}>
                          <input
                            type="checkbox"
                            checked={filters.locations.includes(loc)}
                            onChange={() => toggleFilter('locations', loc)}
                            style={{ marginRight: '0.75rem', width: '16px', height: '16px' }}
                          />
                          <span>{loc}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Salary Range Section */}
                  <div id="filter-salary" style={{ marginBottom: '2rem' }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#1f2937',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <input type="checkbox" style={{ marginRight: '0.75rem', width: '18px', height: '18px' }} />
                      Salary Range
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '2rem' }}>
                      {[
                        '$500 - $1000',
                        '$1000 - $1500',
                        '$1500 - $2000',
                        '$2000 - $3000',
                        '$3000+'
                      ].map(range => (
                        <label key={range} style={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          color: '#4b5563'
                        }}>
                          <input
                            type="checkbox"
                            checked={filters.salaryRanges.includes(range)}
                            onChange={() => toggleFilter('salaryRanges', range)}
                            style={{ marginRight: '0.75rem', width: '16px', height: '16px' }}
                          />
                          <span>{range}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Job Type Section */}
                  <div id="filter-jobType" style={{ marginBottom: '1rem' }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#1f2937',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <input type="checkbox" style={{ marginRight: '0.75rem', width: '18px', height: '18px' }} />
                      Job Type
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '2rem' }}>
                      {[
                        'Full-time',
                        'Part-time',
                        'Contract',
                        'Internship',
                        'Freelance'
                      ].map(type => (
                        <label key={type} style={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          color: '#4b5563'
                        }}>
                          <input
                            type="checkbox"
                            checked={filters.jobTypes.includes(type)}
                            onChange={() => toggleFilter('jobTypes', type)}
                            style={{ marginRight: '0.75rem', width: '16px', height: '16px' }}
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '1.5rem 2rem',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '1rem'
            }}>
              <button
                onClick={() => {
                  resetFilters()
                }}
                style={{
                  flex: 1,
                  padding: '0.875rem 1.5rem',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <i className="fas fa-undo" style={{ marginRight: '0.5rem' }}></i>
                Reset All
              </button>
              <button
                onClick={() => {
                  setShowFilterModal(false)
                }}
                style={{
                  flex: 1,
                  padding: '0.875rem 1.5rem',
                  background: 'var(--primary-orange)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <i className="fas fa-check" style={{ marginRight: '0.5rem' }}></i>
                Apply {hasActiveFilters ? `(${Object.values(filters).reduce((acc, arr) => acc + arr.length, 0)})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// My Jobs Section Component with Working Tabs
function MyJobsSection() {
  const [activeTab, setActiveTab] = useState('recommended')
  const [showAppDetailModal, setShowAppDetailModal] = useState(false)
  const [showAddAppModal, setShowAddAppModal] = useState(false)
  const [showUploadCVModal, setShowUploadCVModal] = useState(false)
  const [uploadOption, setUploadOption] = useState<'upload' | 'past' | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [newAppData, setNewAppData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    status: 'Applied',
    notes: ''
  })
  const [pastCVs, setPastCVs] = useState<any[]>([])
  const [savedJobs, setSavedJobs] = useState<any[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [mlRecommendedTitles, setMlRecommendedTitles] = useState<string[]>([])
  const [extractedText, setExtractedText] = useState('')
  const [isAnalyzingCV, setIsAnalyzingCV] = useState(false)
  const [activeCVNotifications, setActiveCVNotifications] = useState<any[]>([])
  const [allCVNotifications, setAllCVNotifications] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Helper function to clean and capitalize job titles
  const cleanJobTitle = (title: string): string => {
    // Remove extra whitespace and trim
    let cleaned = title.trim().replace(/\s+/g, ' ')

    // Capitalize first letter of each word
    cleaned = cleaned.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')

    // Limit to first 50 characters for very long titles
    if (cleaned.length > 50) {
      cleaned = cleaned.substring(0, 47) + '...'
    }

    return cleaned
  }

  // Fetch user's CVs
  useEffect(() => {
    const fetchCVs = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) return

      try {
        const response = await fetch('/api/profile/cvs', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setPastCVs(data.cvs || [])
        }
      } catch (error) {
        console.error('Error fetching CVs:', error)
      }
    }

    if (isLoggedIn) {
      fetchCVs()
    }
  }, [isLoggedIn])

  // Fetch ML keywords from active CV on page load
  useEffect(() => {
    const fetchActiveKeywords = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        console.log('❌ No token, skipping keyword fetch')
        return
      }

      try {
        console.log('🔍 Fetching active CV keywords...')
        const response = await fetch('/api/profile/cvs/active-keywords', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          console.log('📥 Keywords response:', data)
          if (data.keywords && data.keywords.length > 0) {
            console.log('🎯 Loading keywords and matching jobs...')
            await loadKeywordsAndMatchJobs(data.keywords)
          } else {
            console.log('⚠️ No keywords found in active CV')
            setMlRecommendedTitles([])
            setRecommendedJobs([])
          }
        } else {
          console.log('❌ Failed to fetch keywords:', response.status)
        }
      } catch (error) {
        console.error('❌ Error fetching active keywords:', error)
      }
    }

    if (isLoggedIn) {
      fetchActiveKeywords()
    }
  }, [isLoggedIn])

  // Function to load keywords and match jobs
  const loadKeywordsAndMatchJobs = async (keywords: string[]) => {
    console.log('🔄 loadKeywordsAndMatchJobs called with:', keywords)

    if (!keywords || keywords.length === 0) {
      console.log('⚠️ No keywords provided, clearing recommendations')
      setMlRecommendedTitles([])
      setRecommendedJobs([])
      return 0
    }

    setMlRecommendedTitles(keywords)
    console.log('✅ Set keywords:', keywords)

    const token = localStorage.getItem('access_token')

    // Fetch jobs matching keywords
    console.log('🌐 Fetching jobs from backend...')
    const jobsResponse = await fetch('/api/jobs?per_page=100', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })

    if (jobsResponse.ok) {
      const jobsData = await jobsResponse.json()
      const allJobs = jobsData.jobs || []

      console.log(`📊 Total jobs in database: ${allJobs.length}`)

      // Calculate match percentage for each job
      const jobsWithMatch = allJobs.map((job: any) => {
        let bestMatchPercentage = 0
        let matchedKeyword = ''

        keywords.forEach((title: string) => {
          // Use translated English title for Khmer jobs
          const jobTitleToMatch = job.title_en ? job.title_en.toLowerCase() : job.title.toLowerCase()
          const keyword = title.toLowerCase()

          // Exact match = 100%
          if (jobTitleToMatch === keyword) {
            bestMatchPercentage = 100
            matchedKeyword = title
          }
          // Job title contains full keyword
          else if (jobTitleToMatch.includes(keyword)) {
            const match = Math.round((keyword.length / jobTitleToMatch.length) * 100)
            if (match > bestMatchPercentage) {
              bestMatchPercentage = match
              matchedKeyword = title
            }
          }
          // Keyword contains job title
          else if (keyword.includes(jobTitleToMatch)) {
            const match = Math.round((jobTitleToMatch.length / keyword.length) * 100)
            if (match > bestMatchPercentage) {
              bestMatchPercentage = match
              matchedKeyword = title
            }
          }
          // Partial word match
          else {
            const jobWords = jobTitleToMatch.split(' ')
            const keywordWords = keyword.split(' ')
            const matchedWords = jobWords.filter((jw: string) =>
              keywordWords.some((kw: string) => jw.includes(kw) || kw.includes(jw))
            )
            if (matchedWords.length > 0) {
              const match = Math.round((matchedWords.length / Math.max(jobWords.length, keywordWords.length)) * 100)
              if (match > bestMatchPercentage) {
                bestMatchPercentage = match
                matchedKeyword = title
              }
            }
          }
        })

        return { ...job, matchPercentage: bestMatchPercentage, matchedKeyword }
      })

      // Filter jobs with at least 30% match and sort by match percentage
      const matchedJobs = jobsWithMatch
        .filter((job: any) => job.matchPercentage >= 30)
        .sort((a: any, b: any) => b.matchPercentage - a.matchPercentage)

      console.log(`✅ Matched ${matchedJobs.length} jobs (${matchedJobs.length > 0 ? matchedJobs[0].matchPercentage : 0}% best match)`)
      setRecommendedJobs(matchedJobs)
      return matchedJobs.length
    }

    return 0
  }

  // Fetch notifications for active CV and all CVs
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      // Fetch active CV notifications
      console.log('🔔 Fetching Current CV Alert notifications...')
      const activeCVRes = await fetch('/api/notifications/active-cv', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (activeCVRes.ok) {
        const data = await activeCVRes.json()
        setActiveCVNotifications(data.notifications || [])
        console.log(`✅ Found ${data.notifications?.length || 0} Current CV Alert notifications`)
      }

      // Fetch all CVs notifications
      console.log('🔔 Fetching All CV Notifications...')
      const allCVRes = await fetch('/api/notifications/all-cvs', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (allCVRes.ok) {
        const data = await allCVRes.json()
        setAllCVNotifications(data.notifications || [])
        console.log(`✅ Found ${data.notifications?.length || 0} All CV Notifications`)
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error)
    }
  }

  const fetchUserJobs = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      // Fetch saved jobs from backend
      const saved = await apiRequest(API_ENDPOINTS.SAVED_JOBS)
      if (saved?.success) {
        const jobs = (saved.saved_jobs || []).map((s: any) => s.job).filter(Boolean)
        setSavedJobs(jobs)
      } else {
        setSavedJobs([])
      }

      // Fetch applications from backend
      const apps = await apiRequest(API_ENDPOINTS.APPLICATIONS)
      if (apps?.success) {
        setApplications(apps.applications || [])
      } else {
        setApplications([])
      }

      // Note: Recommended jobs are loaded separately via fetchActiveKeywords
    } catch (error) {
      console.error('Error fetching user jobs:', error)
    }
  }

  // Function to call ML API and get job recommendations
  const handleCVUploadForML = async (file: File) => {
    setIsAnalyzingCV(true)

    try {
      console.log('📤 Uploading CV to ML API:', file.name, file.type, file.size)

      const formData = new FormData()
      formData.append('file', file)

      // Call our Flask backend with OCR support
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 180000) // 3 minute timeout

      const token = localStorage.getItem('access_token')
      const response = await fetch('/api/analyze-cv', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      console.log('📥 API Response Status:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API Error Response:', errorData)
        throw new Error(errorData.error || `API returned ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ API Response Data:', data)

      // Extract data from ML response
      const extractedText = data.extracted_text || ''
      const recommendations = data.recommendations || []
      const ocrUsed = data.ocr_used || false
      const extractionMethod = data.extraction_method || 'text'

      console.log(`📊 Extracted ${extractedText.length} chars, ${recommendations.length} recommendations`)
      console.log(`🔍 Extraction method: ${extractionMethod}${ocrUsed ? ' (OCR applied for scanned document)' : ''}`)

      // Store extracted text
      setExtractedText(extractedText)

      // Extract job titles from recommendations
      const jobTitles = recommendations.map((rec: any) => rec.job_title)
      setMlRecommendedTitles(jobTitles)

      console.log('🎯 Recommended job titles:', jobTitles)

      // Fetch actual jobs matching these titles from our backend
      if (jobTitles.length > 0) {
        const token = localStorage.getItem('access_token')
        const jobsResponse = await fetch('/api/jobs?per_page=100', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })

        let matchedJobsCount = 0

        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json()
          const allJobs = jobsData.jobs || []

          // Calculate match percentage for each job
          const jobsWithMatch = allJobs.map((job: any) => {
            let bestMatchPercentage = 0
            let matchedKeyword = ''

            jobTitles.forEach((title: string) => {
              const jobTitle = job.title.toLowerCase()
              const keyword = title.toLowerCase()

              // Exact match = 100%
              if (jobTitle === keyword) {
                bestMatchPercentage = 100
                matchedKeyword = title
              }
              // Job title contains full keyword
              else if (jobTitle.includes(keyword)) {
                const match = Math.round((keyword.length / jobTitle.length) * 100)
                if (match > bestMatchPercentage) {
                  bestMatchPercentage = match
                  matchedKeyword = title
                }
              }
              // Keyword contains job title
              else if (keyword.includes(jobTitle)) {
                const match = Math.round((jobTitle.length / keyword.length) * 100)
                if (match > bestMatchPercentage) {
                  bestMatchPercentage = match
                  matchedKeyword = title
                }
              }
              // Partial word match
              else {
                const jobWords = jobTitle.split(' ')
                const keywordWords = keyword.split(' ')
                const matchedWords = jobWords.filter((jw: string) =>
                  keywordWords.some((kw: string) => jw.includes(kw) || kw.includes(jw))
                )
                if (matchedWords.length > 0) {
                  const match = Math.round((matchedWords.length / Math.max(jobWords.length, keywordWords.length)) * 100)
                  if (match > bestMatchPercentage) {
                    bestMatchPercentage = match
                    matchedKeyword = title
                  }
                }
              }
            })

            return { ...job, matchPercentage: bestMatchPercentage, matchedKeyword }
          })

          // Filter jobs with at least 30% match and sort by match percentage
          const matchedJobs = jobsWithMatch
            .filter((job: any) => job.matchPercentage >= 30)
            .sort((a: any, b: any) => b.matchPercentage - a.matchPercentage)

          matchedJobsCount = matchedJobs.length
          console.log(`✅ Matched ${matchedJobsCount} jobs from database`)
          setRecommendedJobs(matchedJobs)
        }

        // Refresh CV list to show newly uploaded CV
        const fetchCVs = async () => {
          const token = localStorage.getItem('access_token')
          if (!token) return

          try {
            const cvResponse = await fetch('/api/profile/cvs', {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            if (cvResponse.ok) {
              const cvData = await cvResponse.json()
              setPastCVs(cvData.cvs || [])
              console.log(`✅ Refreshed CV list: ${cvData.cvs?.length || 0} CVs`)
            }
          } catch (error) {
            console.error('Error fetching CVs:', error)
          }
        }

        await fetchCVs()

        const ocrMessage = ocrUsed ? '\n🔍 OCR: Applied for scanned document' : ''
        const cvSavedMessage = data.cv_id ? `\n💾 CV saved to your profile: ${data.cv_name}` : ''
        alert(`✅ CV Analyzed Successfully!${cvSavedMessage}\n\n📄 Extracted: ${extractedText.length} characters${ocrMessage}\n🎯 AI Recommendations: ${recommendations.length} job titles\n💼 Matched Jobs: ${matchedJobsCount} from our database`)
      }
    } catch (error: any) {
      console.error('❌ Error analyzing CV:', error)

      let errorMessage = '❌ Failed to analyze CV.\n\n'

      if (error.name === 'AbortError') {
        errorMessage += 'Request timeout. The ML server may be starting up (first request can take 1-3 minutes). Please try again.'
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage += 'Cannot connect to ML API server. Please check:\n- Server is running at http://138.197.13.244:8000\n- Your internet connection\n- CORS is enabled on the ML server'
      } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        errorMessage += 'ML server error. The file might not be text-based or the server encountered an issue.'
      } else {
        errorMessage += `Error: ${error.message}\n\nPlease ensure you upload a text-based PDF or DOCX (not a scanned image).`
      }

      alert(errorMessage)
    } finally {
      setIsAnalyzingCV(false)
    }
  }

  // Check auth status and load data accordingly
  useEffect(() => {
    setMounted(true)

    if (typeof window !== 'undefined') {
      const currentUser = localStorage.getItem('currentUser')
      const loggedIn = !!currentUser
      setIsLoggedIn(loggedIn)

      // Clear data if not logged in
      if (!loggedIn) {
        setSavedJobs([])
        setRecommendedJobs([])
        setApplications([])
        setActiveCVNotifications([])
        setAllCVNotifications([])
      } else {
        // Load user's data from backend
        fetchUserJobs()
        fetchNotifications()
      }
    }
  }, [])

  const handleUnsaveJob = async (jobId: string) => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('access_token')
    if (!token) return

    try {
      await apiRequest(API_ENDPOINTS.SAVED_JOB(jobId), { method: 'DELETE' })
      setSavedJobs((prev) => prev.filter((job) => job.id !== jobId))
    } catch (error) {
      console.error('Error unsaving job:', error)
      alert('Failed to unsave job. Please try again.')
    }
  }

  const handleSaveJob = async (jobId: string) => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('access_token')
    if (!token) {
      alert('Please log in to save jobs.')
      return
    }

    try {
      const res = await apiRequest(API_ENDPOINTS.SAVED_JOB(jobId), { method: 'POST' })
      if (res?.success && res.saved_job?.job) {
        setSavedJobs((prev) => {
          if (prev.some((j) => j.id === jobId)) return prev
          return [res.saved_job.job, ...prev]
        })
      }
    } catch (error) {
      console.error('Error saving job:', error)
      alert('Failed to save job. Please try again.')
    }
  }

  const handleRefresh = async () => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('access_token')
    if (!token) return

    // Refresh data based on active tab
    await fetchUserJobs()
    alert('Data refreshed successfully!')
  }

  const handleAddApplication = async () => {
    if (!newAppData.title || !newAppData.company) {
      alert('Please fill in required fields')
      return
    }

    if (typeof window === 'undefined') return
    const token = localStorage.getItem('access_token')
    if (!token) {
      alert('Please log in to add applications.')
      return
    }

    try {
      const appData = {
        title: newAppData.title,
        company: newAppData.company,
        location: newAppData.location || 'Not specified',
        salary: newAppData.salary || 'Not specified',
        status: newAppData.status.toLowerCase(),
        notes: newAppData.notes
      }

      const response = await apiRequest(API_ENDPOINTS.MANUAL_APPLICATION, {
        method: 'POST',
        body: JSON.stringify(appData)
      })

      if (response?.success) {
        alert('Application added successfully!')
        setShowAddAppModal(false)

        // Reset form
        setNewAppData({
          title: '',
          company: '',
          location: '',
          salary: '',
          status: 'Applied',
          notes: ''
        })

        // Refresh applications list
        await fetchUserJobs()
      } else {
        alert(response?.message || 'Failed to add application')
      }
    } catch (error) {
      console.error('Error adding application:', error)
      alert('Failed to add application. Please try again.')
    }
  }

  const handleViewAppDetail = (app: any) => {
    setSelectedApplication(app)
    setShowAppDetailModal(true)
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedApplication) return

    if (typeof window === 'undefined') return
    const token = localStorage.getItem('access_token')
    if (!token) return

    try {
      const data = await apiRequest(API_ENDPOINTS.APPLICATION_DETAIL(selectedApplication.id), {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      })

      if (data?.success) {
        // Update local state
        const updatedApplications = applications.map(app =>
          app.id === selectedApplication.id ? { ...app, status: newStatus } : app
        )
        setApplications(updatedApplications)
        setSelectedApplication({ ...selectedApplication, status: newStatus })
        alert(`Application status updated to: ${newStatus}`)
      } else {
        alert(data?.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update application status. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case 'applied': return '#3b82f6'
      case 'reviewed': return '#f59e0b'
      case 'interview': return '#10b981'
      case 'offer': return '#8b5cf6'
      case 'rejected': return '#ef4444'
      case 'withdrawn': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const formatApplicationDate = (isoDate: string) => {
    try {
      const date = new Date(isoDate)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return isoDate
    }
  }

  return (
    <div className="my-jobs-container">
      <h1>My Jobs</h1>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'recommended' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommended')}
        >
          <i className="fas fa-star"></i> Recommended ({recommendedJobs.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <i className="fas fa-heart"></i> Saved Jobs ({savedJobs.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          <i className="fas fa-paper-plane"></i> Applications ({applications.length})
        </button>
      </div>

      {activeTab === 'recommended' && (
        <div className="tab-content active">
          <div className="tab-header">
            <h2>Recommended Jobs</h2>
            <button className="btn-refresh" onClick={handleRefresh}>
              <i className="fas fa-sync"></i> Refresh
            </button>
          </div>

          {/* Upload CV Button and Keywords */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <button
                onClick={() => setShowUploadCVModal(true)}
                className="btn-primary"
                disabled={isAnalyzingCV}
                style={{
                  alignSelf: 'flex-start',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  opacity: isAnalyzingCV ? 0.7 : 1,
                  cursor: isAnalyzingCV ? 'not-allowed' : 'pointer'
                }}
              >
                <i className={isAnalyzingCV ? "fas fa-spinner fa-spin" : "fas fa-upload"}></i>
                {isAnalyzingCV ? 'Analyzing CV...' : 'Upload CV for Job Matching'}
              </button>
            </div>

            {/* Keywords Display */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>
                Jobs that may fit you {isAnalyzingCV && <span style={{ color: '#f97316' }}>(Analyzing...)</span>}:
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {mlRecommendedTitles.length > 0 ? (
                  mlRecommendedTitles.slice(0, 10).map((title, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '0.375rem 0.75rem',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        color: '#1e293b',
                        fontWeight: 500
                      }}
                    >
                      {cleanJobTitle(title)}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    {isAnalyzingCV ? 'Analyzing your CV...' : 'No match - Upload CV to get AI-powered recommendations'}
                  </span>
                )}
              </div>
            </div>


          </div>

          <div className="jobs-list">
            {!isLoggedIn ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <i className="fas fa-lock" style={{ fontSize: '4rem', color: '#f97316', marginBottom: '1.5rem', display: 'block' }}></i>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Sign In Required</h3>
                <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.1rem' }}>
                  Please sign in to view personalized job recommendations based on your CV and preferences.
                </p>
                <Link href="/login">
                  <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                    <i className="fas fa-sign-in-alt"></i> Sign In Now
                  </button>
                </Link>
              </div>
            ) : mlRecommendedTitles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--light-text)' }}>
                <i className="fas fa-star" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block', color: '#f97316' }}></i>
                <p>Upload your CV to get AI-powered job recommendations!</p>
              </div>
            ) : recommendedJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--light-text)' }}>
                <i className="fas fa-briefcase" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block', color: '#64748b' }}></i>
                <p>No matching jobs found for your keywords. Try uploading a different CV or check back later for new opportunities!</p>
              </div>
            ) : recommendedJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="job-card" style={{ marginBottom: '1rem', cursor: 'pointer' }}>
                  <div className="job-header" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <img
                      src={job.logo}
                      alt={job.company}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        flexShrink: 0
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.setAttribute('style', 'display: flex');
                      }}
                    />
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      background: '#f3f4f6',
                      display: 'none',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <i className="fas fa-building" style={{ fontSize: '2rem', color: '#9ca3af' }}></i>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>{job.company}</h3>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                            <span style={{
                              background: job.matchPercentage >= 80 ? '#10b981' : job.matchPercentage >= 60 ? '#f97316' : '#eab308',
                              color: 'white',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '12px',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              display: 'inline-block'
                            }}>
                              {job.matchPercentage}% Match
                            </span>
                            {job.matchedKeyword && (
                              <span style={{
                                background: '#e0f2fe',
                                color: '#0369a1',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '12px',
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                display: 'inline-block'
                              }}>
                                {cleanJobTitle(job.matchedKeyword)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          className="btn-save-job"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleSaveJob(job.id)
                          }}
                          style={{ fontSize: '1.5rem', color: '#e5e7eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <i className={savedJobs.some((j) => j.id === job.id) ? 'fas fa-heart' : 'far fa-heart'}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>{job.title}</h2>
                  <p style={{ color: 'var(--primary-orange)', fontWeight: 600, fontSize: '1rem', margin: '0 0 0.75rem 0' }}>
                    {job.salary}
                  </p>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary-orange)' }}></i> {job.location}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary-orange)' }}></i> Phnom Penh
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {job.type}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <i className="fas fa-calendar" style={{ color: 'var(--primary-orange)' }}></i> {job.postedDate}
                    </span>
                  </div>
                  <button style={{
                    width: '100%',
                    padding: '0.875rem',
                    background: 'var(--primary-orange)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}>
                    View More
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="tab-content active">
          <div className="tab-header">
            <h2>Saved Jobs</h2>
            <button className="btn-refresh" onClick={handleRefresh}>
              <i className="fas fa-sync"></i> Refresh
            </button>
          </div>


          <div className="jobs-list">
            {!isLoggedIn ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <i className="fas fa-lock" style={{ fontSize: '4rem', color: '#ef4444', marginBottom: '1.5rem', display: 'block' }}></i>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Sign In Required</h3>
                <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.1rem' }}>
                  Please sign in to save jobs and access them later.
                </p>
                <Link href="/login">
                  <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                    <i className="fas fa-sign-in-alt"></i> Sign In Now
                  </button>
                </Link>
              </div>
            ) : savedJobs.length > 0 ? (
              savedJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="job-card" style={{ marginBottom: '1rem', cursor: 'pointer' }}>
                    <div className="job-header" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <img
                        src={job.logo}
                        alt={job.company}
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          flexShrink: 0
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.setAttribute('style', 'display: flex');
                        }}
                      />
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '8px',
                        background: '#f3f4f6',
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <i className="fas fa-building" style={{ fontSize: '2rem', color: '#9ca3af' }}></i>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>{job.company}</h3>
                          <button
                            className="btn-save-job"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleUnsaveJob(job.id)
                            }}
                            style={{ fontSize: '1.5rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            <i className="fas fa-heart"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>{job.title}</h2>
                    <p style={{ color: 'var(--primary-orange)', fontWeight: 600, fontSize: '1rem', margin: '0 0 0.75rem 0' }}>
                      {job.salary}
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary-orange)' }}></i> {job.location}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary-orange)' }}></i> Phnom Penh
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {job.type}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <i className="fas fa-calendar" style={{ color: 'var(--primary-orange)' }}></i> {job.postedDate}
                      </span>
                    </div>
                    <button style={{
                      width: '100%',
                      padding: '0.875rem',
                      background: 'var(--primary-orange)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}>
                      View More
                    </button>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--light-text)' }}>
                <i className="far fa-heart" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
                <p>No saved jobs yet. Start saving jobs you&apos;re interested in!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="tab-content active">
          <div className="tab-header">
            <h2>My Applications</h2>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {isLoggedIn && (
                <button
                  className="btn-primary"
                  onClick={() => setShowAddAppModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <i className="fas fa-plus"></i> Add Application
                </button>
              )}
              <button className="btn-refresh" onClick={handleRefresh}>
                <i className="fas fa-sync"></i> Refresh
              </button>
            </div>
          </div>


          {!isLoggedIn ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginTop: '2rem' }}>
              <i className="fas fa-lock" style={{ fontSize: '4rem', color: '#3b82f6', marginBottom: '1.5rem', display: 'block' }}></i>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Sign In Required</h3>
              <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.1rem' }}>
                Please sign in to track your job applications and manage your application pipeline.
              </p>
              <Link href="/login">
                <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                  <i className="fas fa-sign-in-alt"></i> Sign In Now
                </button>
              </Link>
            </div>
          ) : applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px', marginTop: '2rem' }}>
              <i className="fas fa-paper-plane" style={{ fontSize: '3rem', color: '#3b82f6', marginBottom: '1rem', display: 'block' }}></i>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#1e293b' }}>No Applications Yet</h3>
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>Start applying to jobs to track your applications here.</p>
            </div>
          ) : (
            <>
              {/* Kanban Board - 3 Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {/* Column 1: Applied */}
                <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #3b82f6' }}>
                    <h3 style={{ margin: 0, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fas fa-paper-plane"></i> Applied
                    </h3>
                    <span style={{ background: '#3b82f6', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                      {applications.filter(a => a.status.toLowerCase() === 'applied').length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {applications.filter(a => a.status.toLowerCase() === 'applied').map((app) => (
                      <div key={app.id} style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #bfdbfe', cursor: 'pointer' }} onClick={() => handleViewAppDetail(app)}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#1e293b' }}>{app.job?.title || 'Unknown Position'}</h4>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748b' }}>{app.job?.company || 'Unknown Company'}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                          <i className="fas fa-clock"></i> {formatApplicationDate(app.applied_date)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Reviewed */}
                <div style={{ background: '#fffbeb', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #f59e0b' }}>
                    <h3 style={{ margin: 0, color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fas fa-eye"></i> Reviewed
                    </h3>
                    <span style={{ background: '#f59e0b', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                      {applications.filter(a => a.status.toLowerCase() === 'reviewed').length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {applications.filter(a => a.status.toLowerCase() === 'reviewed').map((app) => (
                      <div key={app.id} style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #fde68a', cursor: 'pointer' }} onClick={() => handleViewAppDetail(app)}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#1e293b' }}>{app.job?.title || 'Unknown Position'}</h4>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748b' }}>{app.job?.company || 'Unknown Company'}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                          <i className="fas fa-clock"></i> {formatApplicationDate(app.applied_date)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 3: Interview */}
                <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #10b981' }}>
                    <h3 style={{ margin: 0, color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fas fa-user-tie"></i> Interview
                    </h3>
                    <span style={{ background: '#10b981', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                      {applications.filter(a => a.status.toLowerCase() === 'interview').length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {applications.filter(a => a.status.toLowerCase() === 'interview').map((app) => (
                      <div key={app.id} style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #a7f3d0', cursor: 'pointer' }} onClick={() => handleViewAppDetail(app)}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#1e293b' }}>{app.job?.title || 'Unknown Position'}</h4>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748b' }}>{app.job?.company || 'Unknown Company'}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                          <i className="fas fa-clock"></i> {formatApplicationDate(app.applied_date)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Other Statuses (Offer, Rejected, etc.) */}
              {applications.filter(a => !['applied', 'reviewed', 'interview'].includes(a.status.toLowerCase())).length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem', color: '#475569' }}>
                    <i className="fas fa-list"></i> Other Statuses
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {applications.filter(a => !['applied', 'reviewed', 'interview'].includes(a.status.toLowerCase())).map((app) => (
                      <div
                        key={app.id}
                        style={{
                          background: 'white',
                          padding: '1.25rem',
                          borderRadius: '12px',
                          border: `2px solid ${getStatusColor(app.status)}`,
                          cursor: 'pointer'
                        }}
                        onClick={() => handleViewAppDetail(app)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>{app.job?.title || 'Unknown Position'}</h4>
                          <span style={{
                            background: getStatusColor(app.status),
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b' }}>{app.job?.company || 'Unknown Company'}</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                          <i className="fas fa-clock"></i> {formatApplicationDate(app.applied_date)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Notifications removed - now on /notifications page */}

      {/* Application Detail Modal with Enhanced Features */}
      {showAppDetailModal && selectedApplication && (
        <div className="modal-overlay active" onClick={() => setShowAppDetailModal(false)} style={{ zIndex: 1001 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2>Application Details</h2>
              <button className="close-btn" onClick={() => setShowAppDetailModal(false)}>&times;</button>
            </div>

            <div style={{ padding: '1.5rem 0' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>{selectedApplication.job?.title || 'N/A'}</h3>
                    <p style={{ margin: 0, fontSize: '1.1rem', color: '#64748b' }}>{selectedApplication.job?.company || 'N/A'}</p>
                  </div>
                  <span style={{
                    background: getStatusColor(selectedApplication.status),
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontWeight: 600
                  }}>
                    {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {/* Status Category Selector */}
                <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#92400e', fontWeight: 600 }}>
                    <i className="fas fa-tasks"></i> Update Application Status
                  </p>
                  <select
                    value={selectedApplication.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #fde68a',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: 'white',
                      fontWeight: 600,
                      color: '#92400e',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="applied">Applied</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#92400e' }}>
                    Select a status to move this application to the corresponding column
                  </p>
                </div>

                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Location</p>
                  <p style={{ margin: 0, fontSize: '1rem' }}>
                    <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary-orange)' }}></i> {selectedApplication.job?.location || 'Not specified'}
                  </p>
                </div>

                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Salary Range</p>
                  <p style={{ margin: 0, fontSize: '1rem', color: 'var(--primary-orange)', fontWeight: 600 }}>
                    <i className="fas fa-dollar-sign"></i> {selectedApplication.job?.salary || 'Not specified'}
                  </p>
                </div>

                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Applied Date</p>
                  <p style={{ margin: 0, fontSize: '1rem' }}>
                    <i className="fas fa-calendar"></i> {formatApplicationDate(selectedApplication.applied_date)}
                  </p>
                </div>

                {/* Notes Section */}
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                      <i className="fas fa-sticky-note"></i> Notes
                    </p>
                  </div>
                  <textarea
                    defaultValue={selectedApplication.notes || 'No notes added yet'}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Additional Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this application?')) {
                        try {
                          const response = await apiRequest(API_ENDPOINTS.APPLICATION_DETAIL(selectedApplication.id), {
                            method: 'DELETE'
                          })
                          if (response?.success) {
                            alert('Application deleted successfully')
                            setShowAppDetailModal(false)
                            await fetchUserJobs()
                          } else {
                            alert('Failed to delete application')
                          }
                        } catch (error) {
                          console.error('Error deleting application:', error)
                          alert('Failed to delete application')
                        }
                      }
                    }}
                    style={{
                      padding: '0.75rem',
                      background: '#fef2f2',
                      border: '1px solid #fca5a5',
                      borderRadius: '8px',
                      color: '#991b1b',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}>
                    <i className="fas fa-trash"></i> Delete Application
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowAppDetailModal(false)}>
                Close
              </button>
              {selectedApplication.job?.status !== 'manual' && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    if (selectedApplication.job_id) {
                      window.open(`/jobs/${selectedApplication.job_id}`, '_blank')
                    }
                  }}
                >
                  <i className="fas fa-external-link-alt"></i> View Job Posting
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Application Modal */}
      {showAddAppModal && (
        <div className="modal-overlay active" onClick={() => setShowAddAppModal(false)} style={{ zIndex: 1002 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2>Add Application</h2>
              <button className="close-btn" onClick={() => setShowAddAppModal(false)}>&times;</button>
            </div>

            <div style={{ padding: '1.5rem 0' }}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                  Job Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={newAppData.title}
                  onChange={(e) => setNewAppData({ ...newAppData, title: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                  Company <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={newAppData.company}
                  onChange={(e) => setNewAppData({ ...newAppData, company: e.target.value })}
                  placeholder="e.g., Tech Corp Inc."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                  Location
                </label>
                <input
                  type="text"
                  value={newAppData.location}
                  onChange={(e) => setNewAppData({ ...newAppData, location: e.target.value })}
                  placeholder="e.g., Phnom Penh"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                  Salary Range
                </label>
                <input
                  type="text"
                  value={newAppData.salary}
                  onChange={(e) => setNewAppData({ ...newAppData, salary: e.target.value })}
                  placeholder="e.g., $1000-1500"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                  Status <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={newAppData.status}
                  onChange={(e) => setNewAppData({ ...newAppData, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'white'
                  }}
                >
                  <option value="Applied">Applied</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                  Notes
                </label>
                <textarea
                  value={newAppData.notes}
                  onChange={(e) => setNewAppData({ ...newAppData, notes: e.target.value })}
                  placeholder="Add any notes about this application..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowAddAppModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddApplication}>
                <i className="fas fa-plus"></i> Add Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload CV Modal */}
      {showUploadCVModal && (
        <div className="modal-overlay active" onClick={() => {
          setShowUploadCVModal(false)
          setUploadOption(null)
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Upload CV</h2>
              <button className="close-btn" onClick={() => {
                setShowUploadCVModal(false)
                setUploadOption(null)
              }}>&times;</button>
            </div>

            {/* Direct Upload Form (Selection Removed) */}
            <div style={{ padding: '2rem' }}>
              <div style={{
                background: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '0.75rem'
              }}>
                <i className="fas fa-exclamation-triangle" style={{ color: '#f59e0b', fontSize: '1.25rem', flexShrink: 0 }}></i>
                <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
                  <strong>Important:</strong> Please upload a text-based resume (not a scanned image).
                  Our AI will extract your resume text and analyze it. If the analysis seems wrong, please fix your resume and upload again.
                </div>
              </div>
              <div style={{
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                padding: '3rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: '1.5rem'
              }}
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="fas fa-cloud-upload-alt" style={{ fontSize: '3rem', color: '#9ca3af', marginBottom: '1rem', display: 'block' }}></i>
                <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>Click to upload or drag and drop</p>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>PDF, DOC, DOCX (MAX. 5MB)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    // Validate file type
                    const fileExt = file.name.split('.').pop()?.toLowerCase()
                    if (!['pdf', 'doc', 'docx'].includes(fileExt || '')) {
                      alert('❌ Please upload a PDF, DOC, or DOCX file')
                      return
                    }

                    setShowUploadCVModal(false)
                    setUploadOption(null)

                    // Call ML API to analyze CV
                    await handleCVUploadForML(file)
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Profile Section Component
function ProfileSection() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [profileData, setProfileData] = useState({
    fullname: 'John Doe',
    email: 'john@example.com',
    phone: '+855 12 345 678',
    location: 'Phnom Penh, Cambodia',
    bio: 'Passionate software developer with 5+ years of experience in web development.',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python'],
    experience: '5+ years',
    education: 'Bachelor in Computer Science'
  })

  useEffect(() => {
    setMounted(true)

    if (typeof window !== 'undefined') {
      const currentUser = localStorage.getItem('currentUser')
      setIsLoggedIn(!!currentUser)
    }
  }, [])

  if (!isLoggedIn) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
        <i className="fas fa-lock" style={{ fontSize: '4rem', color: '#3b82f6', marginBottom: '1.5rem', display: 'block' }}></i>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1e293b' }}>Sign In Required</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Please sign in to view and edit your profile information.
        </p>
        <Link href="/login">
          <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            <i className="fas fa-sign-in-alt"></i> Sign In Now
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="profile-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>My Profile</h1>
        <button
          className="btn-primary"
          onClick={() => setIsEditing(!isEditing)}
        >
          <i className={`fas fa-${isEditing ? 'times' : 'edit'}`}></i> {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Profile Header */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'var(--light-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            color: 'var(--primary-orange)',
            flexShrink: 0
          }}>
            <i className="fas fa-user"></i>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ marginBottom: '0.5rem' }}>{profileData.fullname}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--light-text)' }}>
              <p style={{ margin: 0 }}><i className="fas fa-envelope"></i> {profileData.email}</p>
              <p style={{ margin: 0 }}><i className="fas fa-phone"></i> {profileData.phone}</p>
              <p style={{ margin: 0 }}><i className="fas fa-map-marker-alt"></i> {profileData.location}</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Me */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fas fa-user-circle" style={{ color: 'var(--primary-orange)' }}></i>
          About Me
        </h3>
        {isEditing ? (
          <textarea
            value={profileData.bio}
            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '1rem',
              fontFamily: 'inherit'
            }}
          />
        ) : (
          <p style={{ lineHeight: '1.8', color: 'var(--text-color)' }}>{profileData.bio}</p>
        )}
      </div>

      {/* Skills */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fas fa-code" style={{ color: 'var(--primary-orange)' }}></i>
          Skills
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {profileData.skills.map((skill, index) => (
            <span key={index} style={{
              padding: '0.5rem 1rem',
              background: 'var(--light-bg)',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Experience & Education */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-briefcase" style={{ color: 'var(--primary-orange)' }}></i>
            Experience
          </h3>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{profileData.experience}</p>
        </div>

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-graduation-cap" style={{ color: 'var(--primary-orange)' }}></i>
            Education
          </h3>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{profileData.education}</p>
        </div>
      </div>

      {isEditing && (
        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
          <button
            className="btn-secondary"
            onClick={() => setIsEditing(false)}
            style={{ marginRight: '1rem' }}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              alert('Profile updated successfully!')
              setIsEditing(false)
            }}
          >
            <i className="fas fa-save"></i> Save Changes
          </button>
        </div>
      )}
    </div>
  )
}
