import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Settings() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('account')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState('')
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    location: '',
    emailNotifications: true,
    jobAlerts: true,
    profilePublic: false
  })

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const currentUser = localStorage.getItem('currentUser')
      
      if (!token || !currentUser) {
        router.push('/login')
        return
      }

      const user = JSON.parse(currentUser)
      
      const response = await fetch('http://localhost:5000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({
          fullname: data.profile.fullname || user.fullname || '',
          email: data.profile.email || user.email || '',
          phone: data.profile.phone || '',
          location: data.profile.location || '',
          emailNotifications: true,
          jobAlerts: true,
          profilePublic: false
        })
        setProfilePhoto(data.profile.profile_photo || '')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('access_token')
      
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: formData.phone,
          location: formData.location
        })
      })

      if (response.ok) {
        alert('Settings saved successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    const firstConfirm = confirm('⚠️ WARNING: Are you sure you want to delete your account? This will permanently delete:\n\n• Your profile and personal information\n• All uploaded CVs and applications\n• Saved jobs and job alerts\n• All notification history\n\nThis action CANNOT be undone!')
    
    if (!firstConfirm) return

    const secondConfirm = confirm('This is your FINAL WARNING!\n\nType DELETE in the next prompt to confirm account deletion.')
    
    if (!secondConfirm) return

    const userInput = prompt('Type DELETE (in uppercase) to permanently delete your account:')
    
    if (userInput !== 'DELETE') {
      alert('Account deletion cancelled. You must type DELETE exactly.')
      return
    }

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:5000/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('Your account has been permanently deleted. You will now be logged out.')
        localStorage.clear()
        router.push('/login')
      } else {
        const error = await response.json()
        alert(`Failed to delete account: ${error.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account. Please try again or contact support.')
    }
  }

  const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' }
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' }
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' }
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' }
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*...)' }
    }
    return { valid: true, message: '' }
  }

  const handlePasswordChange = async () => {
    setPasswordError('')
    setPasswordSuccess('')

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All password fields are required')
      return
    }

    const validation = validatePassword(passwordData.newPassword)
    if (!validation.valid) {
      setPasswordError(validation.message)
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    setChangingPassword(true)

    try {
      const token = localStorage.getItem('access_token')
      
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordSuccess('Password changed successfully!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        setPasswordError(data.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setPasswordError('Cannot connect to server. Please try again.')
    } finally {
      setChangingPassword(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setUploadingPhoto(true)
    
    try {
      const token = localStorage.getItem('access_token')
      const formData = new FormData()
      formData.append('profile_photo', file)

      const response = await fetch('http://localhost:5000/api/profile/photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setProfilePhoto(data.profile_photo)
        alert('Profile photo updated successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('Failed to upload photo. Please try again.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div>Loading...</div>
        </div>
      </Layout>
    )
  }

  return (
    <>
      <Head>
        <title>Settings - AhhChip</title>
      </Head>
      <Layout>
        <div className="info-page">
          <div className="info-container" style={{ maxWidth: '1000px' }}>
            <h1>Settings</h1>
            <p className="info-subtitle">Manage your account settings and preferences</p>
            
            {/* Settings Tabs */}
            <div className="settings-tabs" style={{ 
              display: 'flex', 
              gap: '1rem', 
              borderBottom: '2px solid var(--light-bg)',
              marginTop: '2rem',
              marginBottom: '2rem'
            }}>
              <button
                onClick={() => setActiveTab('account')}
                style={{
                  padding: '1rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'account' ? '3px solid var(--primary-orange)' : '3px solid transparent',
                  color: activeTab === 'account' ? 'var(--primary-orange)' : 'var(--text-color)',
                  fontWeight: activeTab === 'account' ? 600 : 400,
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                <i className="fas fa-user"></i> Account
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                style={{
                  padding: '1rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'notifications' ? '3px solid var(--primary-orange)' : '3px solid transparent',
                  color: activeTab === 'notifications' ? 'var(--primary-orange)' : 'var(--text-color)',
                  fontWeight: activeTab === 'notifications' ? 600 : 400,
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                <i className="fas fa-bell"></i> Notifications
              </button>
            </div>

            {/* Account Settings */}
            {activeTab === 'account' && (
              <div className="settings-content">
                {/* Profile Photo Section */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h2 style={{ marginBottom: '1.5rem' }}>Profile Photo</h2>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: profilePhoto ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}>
                        {profilePhoto ? (
                          <img 
                            src={`http://localhost:5000${profilePhoto}`} 
                            alt="Profile" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          formData.fullname?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      {uploadingPhoto && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0,0,0,0.5)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <i className="fas fa-spinner fa-spin" style={{ color: 'white', fontSize: '2rem' }}></i>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <input
                        type="file"
                        id="profile-photo-upload"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        style={{ display: 'none' }}
                        disabled={uploadingPhoto}
                      />
                      <label 
                        htmlFor="profile-photo-upload" 
                        style={{
                          display: 'inline-block',
                          padding: '0.75rem 1.5rem',
                          background: 'var(--primary-orange)',
                          color: 'white',
                          borderRadius: '8px',
                          cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                          fontSize: '1rem',
                          fontWeight: 500,
                          opacity: uploadingPhoto ? 0.6 : 1,
                          marginBottom: '0.5rem'
                        }}
                      >
                        <i className="fas fa-upload"></i> Upload Photo
                      </label>
                      <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                        JPG, PNG or GIF. Max size 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h2 style={{ marginBottom: '1.5rem' }}>Account Information</h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label htmlFor="fullname" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullname"
                        name="fullname"
                        value={formData.fullname}
                        disabled
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          background: '#f9fafb',
                          color: '#6b7280'
                        }}
                      />
                      <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>Cannot be changed</small>
                    </div>

                    <div>
                      <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        disabled
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          background: '#f9fafb',
                          color: '#6b7280'
                        }}
                      />
                      <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>Cannot be changed</small>
                    </div>

                    <div>
                      <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="location" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., Phnom Penh, Cambodia"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleSave} 
                    className="btn-primary" 
                    disabled={saving}
                    style={{ marginTop: '1.5rem' }}
                  >
                    <i className="fas fa-save"></i> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

                {/* Change Password */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h2 style={{ marginBottom: '1.5rem' }}>Change Password</h2>
                  
                  {passwordError && (
                    <div style={{ 
                      background: '#fee2e2', 
                      border: '1px solid #ef4444', 
                      color: '#ef4444', 
                      padding: '0.75rem', 
                      borderRadius: '8px', 
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <i className="fas fa-exclamation-circle"></i>
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div style={{ 
                      background: '#dcfce7', 
                      border: '1px solid #22c55e', 
                      color: '#22c55e', 
                      padding: '0.75rem', 
                      borderRadius: '8px', 
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <i className="fas fa-check-circle"></i>
                      {passwordSuccess}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label htmlFor="currentPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handlePasswordChange} 
                    className="btn-primary" 
                    style={{ marginTop: '1.5rem' }}
                    disabled={changingPassword}
                  >
                    {changingPassword ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-key"></i> Update Password
                      </>
                    )}
                  </button>
                </div>

                {/* Delete Account - Moved under Change Password */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '2px solid #ef4444', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginTop: '2rem' }}>
                  <h2 style={{ marginBottom: '1rem', color: '#ef4444' }}>Danger Zone</h2>
                  <p style={{ marginBottom: '1.5rem', color: 'var(--light-text)' }}>
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button 
                    onClick={handleDeleteAccount}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 600
                    }}
                  >
                    <i className="fas fa-trash"></i> Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="settings-content">
                <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h2 style={{ marginBottom: '1.5rem' }}>Notification Preferences</h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--light-bg)', borderRadius: '8px' }}>
                      <div>
                        <h3 style={{ margin: 0, marginBottom: '0.25rem' }}>Job Notification</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--light-text)' }}>Get notified when new jobs match your preferences</p>
                      </div>
                      <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                        <input
                          type="checkbox"
                          name="jobAlerts"
                          checked={formData.jobAlerts}
                          onChange={handleChange}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: formData.jobAlerts ? 'var(--primary-orange)' : '#ccc',
                          transition: '0.4s',
                          borderRadius: '34px'
                        }}>
                          <span style={{
                            position: 'absolute',
                            content: '',
                            height: '26px',
                            width: '26px',
                            left: formData.jobAlerts ? '30px' : '4px',
                            bottom: '4px',
                            backgroundColor: 'white',
                            transition: '0.4s',
                            borderRadius: '50%'
                          }}></span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  )
}
