import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Layout from '@/components/Layout'
import Head from 'next/head'
import { useRouter } from 'next/router'

interface Education {
  id?: string
  degree: string
  institution: string
  year: string
  description: string
}

interface Experience {
  id?: string
  title: string
  company: string
  duration: string
  description: string
}

interface Skill {
  id?: string
  name: string
  level: string
}

interface Language {
  id?: string
  language: string
  proficiency: string
}

interface Certification {
  id?: string
  name: string
  organization: string
  year: string
  description: string
}

interface CV {
  id: string
  name: string
  upload_date: string
  is_active: boolean
  file_path: string | null
}

export default function CVBuilder() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [showUploadDiv, setShowUploadDiv] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [loadingCV, setLoadingCV] = useState(false)
  const [pastCVs, setPastCVs] = useState<CV[]>([])
  const [showCVMenu, setShowCVMenu] = useState<string | null>(null)
  const [selectedCV, setSelectedCV] = useState<CV | null>(null)
  const [menuPosition, setMenuPosition] = useState<{top: number, left: number}>({top: 0, left: 0})
  const [isMounted, setIsMounted] = useState(false)
  
  // Profile data
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [professionalSummary, setProfessionalSummary] = useState('')
  
  // Lists
  const [educationList, setEducationList] = useState<Education[]>([])
  const [experienceList, setExperienceList] = useState<Experience[]>([])
  const [skillsList, setSkillsList] = useState<Skill[]>([])
  const [languagesList, setLanguagesList] = useState<Language[]>([])
  const [certificationsList, setCertificationsList] = useState<Certification[]>([])
  
  // Current editing items
  const [currentEducation, setCurrentEducation] = useState<Education>({
    degree: '', institution: '', year: '', description: ''
  })
  const [currentExperience, setCurrentExperience] = useState<Experience>({
    title: '', company: '', duration: '', description: ''
  })
  const [currentSkill, setCurrentSkill] = useState<Skill>({ name: '', level: 'Beginner' })
  const [currentLanguage, setCurrentLanguage] = useState<Language>({ language: '', proficiency: 'Basic' })
  const [currentCertification, setCurrentCertification] = useState<Certification>({
    name: '', organization: '', year: '', description: ''
  })

  useEffect(() => {
    setIsMounted(true)
    // Don't load profile on mount - only when CV is clicked
    fetchCVs()
  }, [])

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (showCVMenu) {
        // Check if click is outside the menu
        const target = e.target as HTMLElement
        if (!target.closest('[data-cv-menu]') && !target.closest('[data-menu-button]')) {
          setShowCVMenu(null)
        }
      }
    }
    // Use setTimeout to add listener after current click event completes
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 0)
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showCVMenu])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('http://localhost:5000/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        const profile = data.profile
        
        setFullName(profile.fullname || '')
        setEmail(profile.email || '')
        setPhone(profile.phone || '')
        setLocation(profile.location || '')
        setProfessionalSummary(profile.professional_summary || '')
        setEducationList(profile.educations || [])
        setExperienceList(profile.experiences || [])
        setSkillsList(profile.skills || [])
        setLanguagesList(profile.languages || [])
        setCertificationsList(profile.certifications || [])
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchCVs = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:5000/api/profile/cvs', {
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

  const handleSaveAsCV = async () => {
    try {
      setSaving(true)
      let cvName = prompt('Enter a name for your CV:', 'My Professional CV')
      if (!cvName) {
        setSaving(false)
        return
      }

      // Check for duplicate names and auto-increment
      const existingNames = pastCVs.map(cv => cv.name)
      let finalName = cvName
      let counter = 1
      while (existingNames.includes(finalName)) {
        finalName = `${cvName} ${counter}`
        counter++
      }

      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:5000/api/profile/cvs/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: finalName })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`✅ CV saved successfully as "${finalName}"!`)
        setShowUploadDiv(false)
        fetchCVs()
        // Set the newly created CV as selected
        setSelectedCV(data.cv)
      } else {
        const data = await response.json()
        alert(`❌ Failed to save CV: ${data.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving CV:', error)
      alert('❌ Error saving CV. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingFile(true)
      const cvName = prompt('Enter a name for this CV:', file.name.replace(/\.[^/.]+$/, ''))
      if (!cvName) {
        setUploadingFile(false)
        return
      }

      const formData = new FormData()
      formData.append('cv', file)
      formData.append('name', cvName)

      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:5000/api/profile/cvs', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      if (response.ok) {
        alert('✅ CV uploaded successfully!')
        setShowUploadDiv(false)
        fetchCVs()
        e.target.value = '' // Reset file input
      } else {
        const data = await response.json()
        alert(`❌ Failed to upload CV: ${data.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error uploading CV:', error)
      alert('❌ Error uploading CV. Please try again.')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleDeleteCV = async (cvId: string) => {
    const confirmDelete = window.confirm('⚠️ Are you sure you want to delete this CV? This action cannot be undone.')
    if (!confirmDelete) return

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`http://localhost:5000/api/profile/cvs/${cvId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        alert('✅ CV deleted successfully!')
        fetchCVs()
      } else {
        const data = await response.json()
        alert(`❌ Failed to delete CV: ${data.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting CV:', error)
      alert('❌ Error deleting CV. Please try again.')
    }
  }

  const handleSetAsActive = async (cvId: string) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`http://localhost:5000/api/profile/cvs/${cvId}/set-active`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        alert('✅ CV set as active successfully!')
        fetchCVs()
      } else {
        const data = await response.json()
        alert(`❌ Failed to set CV as active: ${data.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error setting active CV:', error)
      alert('❌ Error setting active CV. Please try again.')
    } finally {
      setShowCVMenu(null)
    }
  }

  const handleLoadCV = async (cv: CV) => {
    try {
      setLoadingCV(true)
      setSelectedCV(cv)
      
      // Fetch CV-specific data from the new endpoint
      const token = localStorage.getItem('access_token')
      const response = await fetch(`http://localhost:5000/api/profile/cvs/${cv.id}/data`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const result = await response.json()
        const data = result.data
        
        // Load CV-specific data into the form
        setFullName(data.fullname || '')
        setEmail(data.email || '')
        setPhone(data.phone || '')
        setLocation(data.location || '')
        setProfessionalSummary(data.professional_summary || '')
        setEducationList(data.educations || [])
        setExperienceList(data.experiences || [])
        setSkillsList(data.skills || [])
        setLanguagesList(data.languages || [])
        setCertificationsList(data.certifications || [])
        
        console.log(`✅ Loaded CV "${cv.name}" with ${data.educations?.length || 0} educations, ${data.experiences?.length || 0} experiences, ${data.skills?.length || 0} skills`)
      } else {
        const error = await response.json()
        alert(`❌ Failed to load CV data: ${error.message || 'Unknown error'}`)
      }
      
      setLoadingCV(false)
    } catch (error) {
      console.error('Error loading CV:', error)
      alert('❌ Error loading CV. Please try again.')
      setLoadingCV(false)
    }
  }

  const clearCV = () => {
    setSelectedCV(null)
    setFullName('')
    setEmail('')
    setPhone('')
    setLocation('')
    setProfessionalSummary('')
    setEducationList([])
    setExperienceList([])
    setSkillsList([])
    setLanguagesList([])
    setCertificationsList([])
    setCurrentEducation({ degree: '', institution: '', year: '', description: '' })
    setCurrentExperience({ title: '', company: '', duration: '', description: '' })
    setCurrentSkill({ name: '', level: 'Beginner' })
    setCurrentLanguage({ language: '', proficiency: 'Basic' })
    setCurrentCertification({ name: '', organization: '', year: '', description: '' })
  }

  const handleDownloadCV = async () => {
    if (!selectedCV) {
      alert('⚠️ Please select a CV first')
      return
    }

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`http://localhost:5000/api/profile/cvs/${selectedCV.id}/set-active`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        alert('✅ CV set as active successfully!')
        fetchCVs()
      } else {
        const data = await response.json()
        alert(`❌ Failed to set CV as active: ${data.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error setting active CV:', error)
      alert('❌ Error setting active CV. Please try again.')
    } finally {
      setShowCVMenu(null)
    }
  }

  // Add items to lists
  const addEducation = () => {
    if (currentEducation.degree && currentEducation.institution) {
      setEducationList([...educationList, { ...currentEducation, id: Date.now().toString() }])
      setCurrentEducation({ degree: '', institution: '', year: '', description: '' })
    }
  }

  const addExperience = () => {
    if (currentExperience.title && currentExperience.company) {
      setExperienceList([...experienceList, { ...currentExperience, id: Date.now().toString() }])
      setCurrentExperience({ title: '', company: '', duration: '', description: '' })
    }
  }

  const addSkill = () => {
    if (currentSkill.name) {
      setSkillsList([...skillsList, { ...currentSkill, id: Date.now().toString() }])
      setCurrentSkill({ name: '', level: 'Beginner' })
    }
  }

  const addLanguage = () => {
    if (currentLanguage.language) {
      setLanguagesList([...languagesList, { ...currentLanguage, id: Date.now().toString() }])
      setCurrentLanguage({ language: '', proficiency: 'Basic' })
    }
  }

  const addCertification = () => {
    if (currentCertification.name) {
      setCertificationsList([...certificationsList, { ...currentCertification, id: Date.now().toString() }])
      setCurrentCertification({ name: '', organization: '', year: '', description: '' })
    }
  }

  return (
    <>
      <Head>
        <title>CV Builder - AhhChip</title>
      </Head>
      <Layout>
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', padding: '0', maxWidth: '1400px', margin: '0 auto', gap: '2rem' }}>
          
          {/* Sidebar - Past CVs */}
          <div style={{ width: '320px', flexShrink: 0, paddingLeft: '2rem', paddingTop: '2rem' }}>
            <div style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '1.5rem', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
              position: 'sticky', 
              top: '120px', 
              maxHeight: 'calc(100vh - 140px)', 
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem' }}>My CVs</h2>
                <button
                  onClick={() => fetchCVs()}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-orange)',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                  title="Refresh"
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary"
                style={{ width: '100%', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <i className="fas fa-plus"></i> Create New CV
              </button>

              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.75rem', 
                overflowY: 'auto', 
                overflowX: 'visible',
                flex: 1,
                paddingRight: '0.5rem'
              }}>
                {pastCVs.length === 0 ? (
                  <p style={{ color: 'var(--light-text)', textAlign: 'center', padding: '2rem 0' }}>
                    No CVs yet. Create your first CV!
                  </p>
                ) : (
                  pastCVs.map((cv) => (
                    <div
                      key={cv.id}
                      onClick={() => handleLoadCV(cv)}
                      style={{
                        border: selectedCV?.id === cv.id 
                          ? '3px solid var(--primary-orange)' 
                          : cv.is_active 
                          ? '2px solid var(--primary-orange)' 
                          : '2px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '1rem',
                        background: selectedCV?.id === cv.id
                          ? 'rgba(255, 140, 66, 0.15)'
                          : cv.is_active 
                          ? 'rgba(255, 140, 66, 0.05)' 
                          : 'white',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                        <i className="fas fa-file-alt" style={{ color: 'var(--primary-orange)', fontSize: '1.5rem', marginTop: '0.25rem', flexShrink: 0 }}></i>
                        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                          <h3 style={{ 
                            margin: 0, 
                            fontSize: '0.95rem', 
                            marginBottom: '0.25rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>{cv.name}</h3>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--light-text)' }}>
                            {new Date(cv.upload_date).toLocaleDateString()}
                          </p>
                          {cv.is_active && (
                            <span style={{
                              display: 'inline-block',
                              marginTop: '0.5rem',
                              padding: '0.2rem 0.5rem',
                              background: 'var(--primary-orange)',
                              color: 'white',
                              borderRadius: '12px',
                              fontSize: '0.7rem',
                              fontWeight: 600
                            }}>
                              Active
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                          {cv.file_path && (
                            <a
                              href={`http://localhost:5000${cv.file_path}`}
                              download
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#3b82f6',
                                padding: '0.5rem',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                              title="Download CV"
                            >
                              <i className="fas fa-download"></i>
                            </a>
                          )}
                          <button
                            data-menu-button
                            onClick={(e) => {
                              e.stopPropagation()
                              const rect = e.currentTarget.getBoundingClientRect()
                              setMenuPosition({
                                top: rect.bottom + window.scrollY,
                                left: rect.right - 180 + window.scrollX
                              })
                              setShowCVMenu(showCVMenu === cv.id ? null : cv.id)
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--light-text)',
                              padding: '0.25rem',
                              flexShrink: 0
                            }}
                          >
                            <i className="fas fa-ellipsis-v"></i>
                          </button>
                        </div>
                        {showCVMenu === cv.id && isMounted && createPortal(
                          <div 
                            data-cv-menu
                            style={{
                            position: 'fixed',
                            top: `${menuPosition.top}px`,
                            left: `${menuPosition.left}px`,
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                            minWidth: '180px',
                            zIndex: 10000
                          }}
                          onClick={(e) => e.stopPropagation()}
                          >
                          {!cv.is_active && (
                            <button
                              onClick={() => handleSetAsActive(cv.id)}
                              style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: 'none',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                            >
                              <i className="fas fa-check-circle" style={{ marginRight: '0.5rem', color: 'var(--primary-orange)' }}></i>
                              Use as Active CV
                            </button>
                          )}
                          {cv.file_path && (
                            <a
                              href={`http://localhost:5000${cv.file_path}`}
                              download
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowCVMenu(null)
                              }}
                              style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: 'none',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'background 0.2s',
                                display: 'block',
                                textDecoration: 'none',
                                color: 'inherit'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                            >
                              <i className="fas fa-download" style={{ marginRight: '0.5rem', color: '#3b82f6' }}></i>
                              Download CV
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setShowCVMenu(null)
                              handleDeleteCV(cv.id)
                            }}
                            style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              background: 'none',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              color: '#ef4444',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                          >
                            <i className="fas fa-trash" style={{ marginRight: '0.5rem' }}></i>
                            Delete CV
                          </button>
                        </div>,
                        document.body
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content - CV Storage Area */}
          <div style={{ flex: 1, paddingTop: '2rem', paddingRight: '2rem', paddingBottom: '2rem' }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h1 style={{ marginTop: 0, marginBottom: '0.5rem' }}>CV Storage</h1>
                  {selectedCV ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1rem', color: 'var(--primary-orange)', fontWeight: 600 }}>
                        Selected: {selectedCV.name}
                      </span>
                      {selectedCV.is_active && (
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          background: 'var(--primary-orange)',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          ACTIVE CV
                        </span>
                      )}
                    </div>
                  ) : (
                    <p style={{ margin: 0, color: 'var(--light-text)', fontSize: '0.95rem' }}>
                      Select a CV from the left panel or upload a new one
                    </p>
                  )}
                </div>
              </div>

              {/* Selected CV Actions */}
              {selectedCV && (
                <div style={{
                  background: 'white',
                  border: '2px solid var(--primary-orange)',
                  borderRadius: '12px',
                  padding: '2rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem'
                  }}>
                    <div>
                      <h3 style={{ 
                        margin: '0 0 0.5rem 0', 
                        fontSize: '1.3rem',
                        color: '#1e293b'
                      }}>
                        <i className="fas fa-file-alt" style={{ color: 'var(--primary-orange)', marginRight: '0.5rem' }}></i>
                        {selectedCV.name}
                      </h3>
                      <p style={{ margin: 0, color: 'var(--light-text)', fontSize: '0.9rem' }}>
                        <i className="fas fa-calendar"></i> Uploaded on {new Date(selectedCV.upload_date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    {selectedCV.is_active && (
                      <div style={{
                        background: '#dcfce7',
                        color: '#166534',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.95rem'
                      }}>
                        <i className="fas fa-check-circle"></i> Active for Job Matching
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                  }}>
                    {selectedCV.file_path && (
                      <a
                        href={`http://localhost:5000${selectedCV.file_path}`}
                        download
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '1rem',
                          background: 'var(--primary-orange)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#e67846'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary-orange)'}
                      >
                        <i className="fas fa-download"></i>
                        Download CV
                      </a>
                    )}
                    
                    {!selectedCV.is_active && (
                      <button
                        onClick={() => handleSetAsActive(selectedCV.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '1rem',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                      >
                        <i className="fas fa-check-circle"></i>
                        Set as Active
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this CV?')) {
                          handleDeleteCV(selectedCV.id)
                          setSelectedCV(null)
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '1rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                    >
                      <i className="fas fa-trash"></i>
                      Delete CV
                    </button>
                    
                    <button
                      onClick={() => setSelectedCV(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '1rem',
                        background: '#64748b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#475569'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#64748b'}
                    >
                      <i className="fas fa-times"></i>
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* No CV Selected State */}
              {!selectedCV && (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 2rem',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '2px dashed #cbd5e1'
                }}>
                  <i className="fas fa-hand-pointer" style={{ 
                    fontSize: '3rem', 
                    color: '#94a3b8', 
                    marginBottom: '1rem',
                    display: 'block'
                  }}></i>
                  <h3 style={{ 
                    fontSize: '1.3rem', 
                    marginBottom: '0.5rem',
                    color: '#475569'
                  }}>
                    Select a CV to Get Started
                  </h3>
                  <p style={{ 
                    color: '#64748b', 
                    fontSize: '1rem',
                    margin: '0 0 1.5rem 0'
                  }}>
                    Choose a CV from your library on the left, or upload a new one using the button above.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        {/* Upload Modal */}
        {showUploadModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
          onClick={() => setShowUploadModal(false)}
          >
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Create New CV</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: 'var(--light-text)'
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div style={{
                border: '2px dashed var(--primary-orange)',
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                marginBottom: '1.5rem',
                background: 'rgba(255, 140, 66, 0.05)'
              }}>
                <i className="fas fa-upload" style={{ fontSize: '2.5rem', color: 'var(--primary-orange)', marginBottom: '1rem' }}></i>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Upload Your CV</h3>
                <p style={{ color: 'var(--light-text)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  Have a CV file? Upload it here (PDF, DOC, DOCX)
                </p>
                <label className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <i className="fas fa-file-upload"></i>
                  {uploadingFile ? 'Uploading...' : 'Choose File'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      handleFileUpload(e)
                      setShowUploadModal(false)
                    }}
                    disabled={uploadingFile}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div style={{ textAlign: 'center', color: 'var(--light-text)', marginBottom: '1rem' }}>
                <p style={{ margin: '0.5rem 0' }}>OR</p>
              </div>

              <button
                onClick={() => {
                  clearCV()
                  setShowUploadModal(false)
                }}
                className="btn-secondary"
                style={{ width: '100%', fontSize: '1rem', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <i className="fas fa-edit"></i>
                Fill Form to Create CV from Scratch
              </button>
            </div>
          </div>
        )}
      </Layout>
    </>
  )
}

