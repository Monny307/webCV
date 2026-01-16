import { useState, useEffect } from 'react'
import Head from 'next/head'
import AdminLayout from '@/components/AdminLayout'
import api from '@/lib/api'

export default function AdminSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    site_name: 'CV Job Portal',
    contact_email: 'admin@cvjobportal.com'
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/settings')
      if (response.success) {
        setSettings(response.settings)
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await api.put('/api/admin/settings', settings)
      if (response.success) {
        alert('Settings saved successfully!')
      }
    } catch (error: any) {
      console.error('Error saving settings:', error)
      alert(error.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    fetchSettings()
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Settings - Admin</title>
        </Head>
        <AdminLayout activePage="settings">
          <div className="admin-content">
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
              <p style={{ marginTop: '1rem' }}>Loading settings...</p>
            </div>
          </div>
        </AdminLayout>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Settings - Admin</title>
      </Head>

      <AdminLayout activePage="settings">
        <div className="admin-content">
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>
              <i className="fas fa-cog"></i> Admin Settings
            </h2>
            <p style={{ margin: 0, color: '#64748b' }}>
              Configure platform settings
            </p>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Site Information */}
            <div style={{ padding: '1.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>Site Information</h3>
              
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.site_name}
                    onChange={(e) => setSettings({...settings, site_name: e.target.value})}
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
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => setSettings({...settings, contact_email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                  <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                    Email address for contact inquiries
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '0.875rem 2rem',
                  background: saving ? '#9ca3af' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                {saving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Save Settings
                  </>
                )}
              </button>
              <button 
                onClick={handleReset}
                disabled={saving}
                style={{
                  padding: '0.875rem 2rem',
                  background: 'white',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                <i className="fas fa-undo"></i> Reset
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}
