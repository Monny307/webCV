interface LoadingOverlayProps {
  message?: string
}

export default function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <p className="loading-message">{message}</p>
      </div>

      <style jsx>{`
        .loading-overlay {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 9999;
          text-align: center;
        }

        .loading-content {
          text-align: center;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(102, 126, 234, 0.2);
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-message {
          margin-top: 1rem;
          font-size: 0.95rem;
          font-weight: 500;
          color: #64748b;
        }
      `}</style>
    </div>
  )
}
