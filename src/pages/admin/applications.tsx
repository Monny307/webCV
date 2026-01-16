import Head from 'next/head'
import AdminLayout from '@/components/AdminLayout'

export default function AdminApplications() {
  return (
    <>
      <Head>
        <title>Manage Applications - Admin</title>
      </Head>

      <AdminLayout activePage="dashboard">
        <div className="admin-content">
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
            Application management features coming soon...
          </p>
        </div>
      </AdminLayout>
    </>
  )
}
