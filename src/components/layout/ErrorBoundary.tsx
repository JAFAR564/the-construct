import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallbackRoute?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[CONSTRUCT OS] System malfunction:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleNavigateHome = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/terminal';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    backgroundColor: '#0D0D0D',
                    color: '#FF3333',
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    padding: '40px',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '20px'
                }}>
                    <pre style={{
                        color: '#FF3333',
                        fontSize: '14px',
                        textShadow: '0 0 10px #FF3333',
                        whiteSpace: 'pre-wrap',
                        maxWidth: '600px'
                    }}>
                        {`
╔══════════════════════════════════════╗
║     ▓▓▓ SYSTEM MALFUNCTION ▓▓▓      ║
╠══════════════════════════════════════╣
║                                      ║
║  CRITICAL ERROR IN CONSTRUCT OS      ║
║  Module: UI_RENDER_ENGINE            ║
║  Status: UNRECOVERABLE               ║
║                                      ║
║  Error: ${this.state.error?.message?.slice(0, 30) || 'UNKNOWN'}
║                                      ║
╚══════════════════════════════════════╝
`}
                    </pre>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
                        <button
                            onClick={this.handleReset}
                            style={{
                                backgroundColor: 'transparent',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--text-primary)',
                                padding: '10px 24px',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '14px',
                                cursor: 'pointer',
                                textShadow: '0 0 5px var(--text-primary)'
                            }}
                        >
                            [R] RETRY MODULE
                        </button>
                        <button
                            onClick={this.handleNavigateHome}
                            style={{
                                backgroundColor: 'transparent',
                                color: '#FFD700',
                                border: '1px solid #FFD700',
                                padding: '10px 24px',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '14px',
                                cursor: 'pointer',
                                textShadow: '0 0 5px #FFD700'
                            }}
                        >
                            [H] RETURN TO TERMINAL
                        </button>
                    </div>

                    {this.state.error && (
                        <details style={{
                            color: '#666666',
                            fontSize: '11px',
                            marginTop: '20px',
                            maxWidth: '500px',
                            textAlign: 'left'
                        }}>
                            <summary style={{ cursor: 'pointer', color: '#666666' }}>
                                [DIAGNOSTIC DATA]
                            </summary>
                            <pre style={{
                                marginTop: '10px',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all'
                            }}>
                                {this.state.error.stack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
