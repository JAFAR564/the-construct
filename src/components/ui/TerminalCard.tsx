import React from 'react';

interface Props {
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export const TerminalCard: React.FC<Props> = ({ title, children, className = '' }) => {
    return (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-terminal)', borderRadius: 0, padding: 16 }} className={className}>
            {title && (
                <div style={{ marginBottom: 16 }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '1.2rem', color: 'var(--faction-active)', textTransform: 'uppercase' }} className="terminal-glow">
                        {title}
                    </h2>
                    <div style={{ color: 'var(--border-terminal)', letterSpacing: 2, overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        ├────────────────────────────────────────────────────────────────────────────────────────┤
                    </div>
                </div>
            )}
            {children}
        </div>
    );
};
