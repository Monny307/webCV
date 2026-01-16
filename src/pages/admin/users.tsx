import Head from 'next/head'
import AdminLayout from '@/components/AdminLayout'

export default function AdminUsers() {
  return (
    <>
      <Head>
        <title>Manage Users - Admin</title>
      </Head>

      <AdminLayout activePage="users">
        <div className="admin-content">
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
            User management features coming soon...
          </p>
        </div>
      </AdminLayout>
    </>
  )
}
