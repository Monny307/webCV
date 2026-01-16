import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem', 
          maxWidth: '600px', 
          margin: '0 auto' 
        }}>
          <i className="fas fa-exclamation-triangle" style={{ 
            fontSize: '4rem', 
            color: '#ef4444', 
            marginBottom: '1.5rem', 
            display: 'block' 
          }}></i>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1e293b' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.1rem' }}>
            We apologize for the inconvenience. Please try refreshing the page.
          </p>
          <button 
            className="btn-primary" 
            onClick={() => window.location.reload()}
            style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
          >
            <i className="fas fa-redo"></i> Refresh Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
