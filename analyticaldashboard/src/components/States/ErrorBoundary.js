import React from 'react';
import './States.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error, info) {
    console.error('Application error boundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="state-page">
          <div className="error-panel">
            <h1>Something went wrong</h1>
            <p>{this.state.message || 'Please refresh and try again.'}</p>
            <button onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
