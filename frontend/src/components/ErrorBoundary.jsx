import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#0f172a',
          color: '#f1f5f9',
        }}>
          <div style={{
            background: '#1e293b',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            textAlign: 'center',
            border: '1px solid rgba(148, 163, 184, 0.16)',
          }}>
            <h2 style={{ margin: '0 0 1rem', color: '#ef4444' }}>
              Terjadi Kesalahan
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              Aplikasi mengalami error yang tidak terduga. Silakan muat ulang atau hubungi admin.
            </p>
            {this.state.error && (
              <details style={{
                marginBottom: '1.5rem',
                textAlign: 'left',
                background: '#0b1220',
                padding: '1rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                color: '#94a3b8',
              }}>
                <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                  Detail Error
                </summary>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: '#f1f5f9',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                Coba Lagi
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  background: '#2563eb',
                  border: 'none',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Muat Ulang
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
