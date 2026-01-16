import { useState, useRef, useEffect } from 'react'
import Layout from '@/components/Layout'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'

export default function Profile() {
  const router = useRouter()
  const [profilePhoto, setProfilePhoto] = useState('https://via.placeholder.com/150')
  const [showCVMenu, setShowCVMenu] = useState<number | null>(null)
  const [showCVViewer, setShowCVViewer] = useState(false)
  const [selectedCV, setSelectedCV] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profileData, setProfileData] = useState({
    fullName: 'Not provided',
    email: 'Not provided',
    phone: 'Not provided',
    gender: 'Not provided',
    dateOfBirth: 'Not provided',
    location: 'Not provided',
    education: [],
    workExperience: [],
    skills: [],
    languages: [],
    certifications: [],
    professionalSummary: ''
  })

  const [pastCVs, setPastCVs] = useState<any[]>([])

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/login')
        return
      }

      // Fetch profile data
      const profileResponse = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setProfileData({
          fullName: profileData.profile.fullname || 'Not provided',
          email: profileData.profile.email || 'Not provided',
          phone: profileData.profile.phone || 'Not provided',
          gender: profileData.profile.gender || 'Not provided',
          dateOfBirth: profileData.profile.date_of_birth || 'Not provided',
          location: profileData.profile.location || 'Not provided',
          education: profileData.profile.education || [],
          workExperience: profileData.profile.work_experience || [],
          skills: profileData.profile.skills || [],
          languages: profileData.profile.languages || [],
          certifications: profileData.profile.certifications || [],
          professionalSummary: profileData.profile.professional_summary || ''
        })
      }

      // Fetch CVs
      const cvsResponse = await fetch('/api/profile/cvs', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (cvsResponse.ok) {
        const cvsData = await cvsResponse.json()
        setPastCVs(cvsData.cvs || [])
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

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
      alert('Profile photo updated successfully!')
    }
  }

  const handleSetAsCurrent = (id: number) => {
    alert(`CV ${id} set as current!`)
    setShowCVMenu(null)
  }

  const handleViewCV = (cvName: string) => {
    setSelectedCV(cvName)
    setShowCVViewer(true)
    setShowCVMenu(null)
  }

  const handleDeleteCV = (id: number) => {
    if (confirm('Are you sure you want to delete this CV?')) {
      alert(`CV ${id} deleted!`)
      setShowCVMenu(null)
    }
  }

  const handleDownloadCV = () => {
    alert('Downloading CV...')
  }

  return (
    <>
      <Head>
        <title>Profile - AhhChip</title>
      </Head>
      <Layout>
        <div className="info-page">
          <div className="info-container" style={{ maxWidth: '1000px' }}>
            <h1>Profile Information</h1>
            <p className="info-subtitle">View and manage your profile details</p>

            {/* Profile Photo Section */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', marginTop: '2rem', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Profile Photo</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ position: 'relative' }}>
                  <Image
                    src={profilePhoto}
                    alt="Profile"
                    width={150}
                    height={150}
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <button
                    className="btn-edit-image"
                    onClick={handlePhotoClick}
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--primary-orange)',
                      border: '3px solid white',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  >
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
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>Update Profile Photo</h3>
                  <p style={{ color: 'var(--light-text)', fontSize: '0.9rem' }}>
                    Click the camera icon to upload a new photo. Recommended size: 400x400px
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Personal Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <strong style={{ color: 'var(--light-text)', fontSize: '0.9rem' }}>Full Name:</strong>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>{profileData.fullName}</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--light-text)', fontSize: '0.9rem' }}>Email:</strong>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>{profileData.email}</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--light-text)', fontSize: '0.9rem' }}>Phone:</strong>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>{profileData.phone}</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--light-text)', fontSize: '0.9rem' }}>Gender:</strong>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>{profileData.gender}</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--light-text)', fontSize: '0.9rem' }}>Date of Birth:</strong>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>{profileData.dateOfBirth}</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--light-text)', fontSize: '0.9rem' }}>Location:</strong>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>{profileData.location}</p>
                </div>
              </div>
            </div>

            {/* Education */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Education</h2>
              <p style={{ color: 'var(--light-text)' }}>No education information provided</p>
            </div>

            {/* Work Experience */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Work Experience</h2>
              <p style={{ color: 'var(--light-text)' }}>No work experience provided</p>
            </div>

            {/* Skills */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Skills</h2>
              <p style={{ color: 'var(--light-text)' }}>No skills provided</p>
            </div>

            {/* Languages */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Languages</h2>
              <p style={{ color: 'var(--light-text)' }}>No languages provided</p>
            </div>

            {/* Certifications */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Certifications</h2>
              <p style={{ color: 'var(--light-text)' }}>No certifications provided</p>
            </div>

            {/* Professional Summary */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Professional Summary</h2>
              <p style={{ color: 'var(--light-text)' }}>No professional summary provided</p>
            </div>

            {/* Past CVs */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Past CVs</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pastCVs.map((cv) => (
                  <div
                    key={cv.id}
                    style={{
                      border: cv.isCurrent ? '2px solid var(--primary-orange)' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: cv.isCurrent ? 'rgba(255, 140, 66, 0.05)' : 'white',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <i className="fas fa-file-pdf" style={{ fontSize: '2.5rem', color: 'var(--primary-orange)' }}></i>
                      <div>
                        <h3 style={{ margin: 0, marginBottom: '0.25rem', fontSize: '1.1rem' }}>{cv.name}</h3>
                        <p style={{ margin: 0, color: 'var(--light-text)', fontSize: '0.9rem' }}>{cv.date}</p>
                        {cv.isCurrent && (
                          <span style={{
                            display: 'inline-block',
                            marginTop: '0.5rem',
                            padding: '0.25rem 0.75rem',
                            background: 'var(--primary-orange)',
                            color: 'white',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            Current CV
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setShowCVMenu(showCVMenu === cv.id ? null : cv.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1.5rem',
                          color: 'var(--light-text)',
                          padding: '0.5rem'
                        }}
                      >
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                      {showCVMenu === cv.id && (
                        <div style={{
                          position: 'absolute',
                          right: 0,
                          top: '100%',
                          background: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          minWidth: '180px',
                          zIndex: 10,
                          overflow: 'hidden'
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CV Viewer Modal */}
        {showCVViewer && (
          <div className="modal-overlay active" onClick={() => setShowCVViewer(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh' }}>
              <div className="modal-header">
                <h2>View CV: {selectedCV}</h2>
                <button className="close-btn" onClick={() => setShowCVViewer(false)}>&times;</button>
              </div>

              <div style={{ padding: '2rem', background: '#f9fafb', borderRadius: '8px', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
      </Layout>
    </>
  )
}
