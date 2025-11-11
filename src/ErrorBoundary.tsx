import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: any; info?: any };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('ErrorBoundary atrapó:', error, info);
    this.setState({ info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16 }}>
          <h2>Ocurrió un error en la UI.</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
