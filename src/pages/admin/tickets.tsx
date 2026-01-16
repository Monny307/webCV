import Head from 'next/head'
import AdminLayout from '@/components/AdminLayout'

export default function SupportTickets() {
  const tickets = [
    { id: 1, user: 'john@example.com', subject: 'Cannot upload CV', status: 'open', priority: 'high', date: '2 hours ago' },
    { id: 2, user: 'jane@example.com', subject: 'Job application not showing', status: 'in-progress', priority: 'medium', date: '5 hours ago' },
    { id: 3, user: 'bob@example.com', subject: 'Profile picture upload issue', status: 'resolved', priority: 'low', date: '1 day ago' },
    { id: 4, user: 'alice@example.com', subject: 'Password reset not working', status: 'open', priority: 'high', date: '3 hours ago' },
  ]

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'open': return { bg: '#fee2e2', text: '#991b1b' }
      case 'in-progress': return { bg: '#fed7aa', text: '#9a3412' }
      case 'resolved': return { bg: '#dcfce7', text: '#166534' }
      default: return { bg: '#f3f4f6', text: '#374151' }
    }
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return '#ef4444'
      case 'medium': return '#f97316'
      case 'low': return '#10b981'
      default: return '#64748b'
    }
  }

  return (
    <>
      <Head>
        <title>Support Tickets - Admin</title>
      </Head>

      <AdminLayout activePage="tickets">
        <div className="admin-content">
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>
                <i className="fas fa-ticket-alt"></i> Support Tickets
              </h2>
              <p style={{ margin: 0, color: '#64748b' }}>
                Manage and respond to user support requests
              </p>
            </div>
            <button style={{
              padding: '0.875rem 1.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}>
              <i className="fas fa-plus"></i> New Ticket
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: '8px' }}>
              <p style={{ margin: 0, color: '#991b1b', fontSize: '0.9rem' }}>Open Tickets</p>
              <p style={{ margin: '0.5rem 0 0 0', color: '#991b1b', fontSize: '2rem', fontWeight: 700 }}>2</p>
            </div>
            <div style={{ padding: '1rem', background: '#fed7aa', borderRadius: '8px' }}>
              <p style={{ margin: 0, color: '#9a3412', fontSize: '0.9rem' }}>In Progress</p>
              <p style={{ margin: '0.5rem 0 0 0', color: '#9a3412', fontSize: '2rem', fontWeight: 700 }}>1</p>
            </div>
            <div style={{ padding: '1rem', background: '#dcfce7', borderRadius: '8px' }}>
              <p style={{ margin: 0, color: '#166534', fontSize: '0.9rem' }}>Resolved Today</p>
              <p style={{ margin: '0.5rem 0 0 0', color: '#166534', fontSize: '2rem', fontWeight: 700 }}>1</p>
            </div>
          </div>

          {/* Tickets Table */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>User</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Subject</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Priority</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => {
                  const statusColors = getStatusColor(ticket.status)
                  return (
                    <tr key={ticket.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem', color: '#1e293b' }}>#{ticket.id}</td>
                      <td style={{ padding: '1rem', color: '#1e293b' }}>{ticket.user}</td>
                      <td style={{ padding: '1rem', color: '#1e293b' }}>{ticket.subject}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: getPriorityColor(ticket.priority),
                          display: 'inline-block',
                          marginRight: '0.5rem'
                        }}></span>
                        {ticket.priority}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          background: statusColors.bg,
                          color: statusColors.text,
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}>
                          {ticket.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#64748b' }}>{ticket.date}</td>
                      <td style={{ padding: '1rem' }}>
                        <button style={{
                          padding: '0.5rem 1rem',
                          background: '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}>
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}
