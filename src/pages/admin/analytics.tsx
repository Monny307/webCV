import Head from 'next/head'
import AdminLayout from '@/components/AdminLayout'

export default function Analytics() {
  return (
    <>
      <Head>
        <title>Analytics - Admin</title>
      </Head>

      <AdminLayout activePage="analytics">
        <div className="admin-content">
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>
              <i className="fas fa-chart-line"></i> Analytics & Reports
            </h2>
            <p style={{ margin: 0, color: '#64748b' }}>
              Track platform performance and user engagement
            </p>
          </div>

          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: 'white' }}>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Total Page Views</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '2.5rem', fontWeight: 700 }}>45,678</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                <i className="fas fa-arrow-up"></i> +12% from last month
              </p>
            </div>

            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '12px', color: 'white' }}>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Active Users</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '2.5rem', fontWeight: 700 }}>3,456</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                <i className="fas fa-arrow-up"></i> +8% from last month
              </p>
            </div>

            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '12px', color: 'white' }}>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Job Applications</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '2.5rem', fontWeight: 700 }}>890</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                <i className="fas fa-arrow-up"></i> +15% from last month
              </p>
            </div>

            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', borderRadius: '12px', color: 'white' }}>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Conversion Rate</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '2.5rem', fontWeight: 700 }}>23.5%</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                <i className="fas fa-arrow-up"></i> +3% from last month
              </p>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            <div style={{ padding: '1.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>User Growth</h3>
              <div style={{ 
                height: '300px', 
                background: '#f8fafc', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <i className="fas fa-chart-area" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
                  <p>Chart visualization coming soon</p>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Application Trends</h3>
              <div style={{ 
                height: '300px', 
                background: '#f8fafc', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <i className="fas fa-chart-line" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
                  <p>Chart visualization coming soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Jobs */}
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Top Performing Jobs</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {[
                { title: 'Senior React Developer', views: 1234, applications: 45 },
                { title: 'Full Stack Engineer', views: 987, applications: 38 },
                { title: 'UI/UX Designer', views: 856, applications: 32 },
              ].map((job, index) => (
                <div key={index} style={{
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#1e293b' }}>{job.title}</h4>
                  </div>
                  <div style={{ display: 'flex', gap: '2rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Views</p>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#1e293b', fontWeight: 600 }}>{job.views}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Applications</p>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#1e293b', fontWeight: 600 }}>{job.applications}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}
