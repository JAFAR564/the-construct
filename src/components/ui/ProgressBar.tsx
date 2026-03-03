import type { CSSProperties } from 'react';

interface ProgressBarProps {
    label: string;
    current: number;
    max: number;
    color?: string;
    showValue?: boolean;
}

export function ProgressBar({
    label,
    current,
    max,
    color = 'var(--text-primary)',
    showValue = true
}: ProgressBarProps) {
    const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;

    // Generate block characters for visual representation
    const totalBlocks = 20;
    const filledBlocks = Math.round((percentage / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    const filledStr = '█'.repeat(filledBlocks);
    const emptyStr = '░'.repeat(emptyBlocks);

    return (
        <div style={styles.container}>
            <span style={styles.label}>{label}</span>
            <div style={styles.barWrapper}>
                <span style={{ ...styles.filled, color }}>{filledStr}</span>
                <span style={styles.empty}>{emptyStr}</span>
            </div>
            {showValue && (
                <span style={styles.value}>{current}/{max}</span>
            )}
        </div>
    );
}

const styles: Record<string, CSSProperties> = {
    container: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        minWidth: 0,                      // Prevents flex blowout
        fontFamily: "var(--font-mono)",
        fontSize: '13px',
        lineHeight: '1.4',
        padding: '4px 0',
    },
    label: {
        color: 'var(--text-muted)',
        width: '100px',
        minWidth: '100px',
        flexShrink: 0,                    // CRITICAL — never crush the label
        textTransform: 'uppercase' as const,
        fontSize: '11px',
        letterSpacing: '0.5px',
        textAlign: 'right' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const,
    },
    barWrapper: {
        display: 'flex',
        alignItems: 'center',
        flex: 1,                          // Take remaining space
        minWidth: 0,                      // Allow shrinking of bar, not label
        overflow: 'hidden',
        fontFamily: "var(--font-mono)",
        fontSize: '12px',
        lineHeight: '1',
        letterSpacing: '-0.5px',          // Tighten block characters
    },
    filled: {
        // color is set dynamically via prop
        textShadow: '0 0 4px currentColor',
        whiteSpace: 'nowrap' as const,
    },
    empty: {
        color: 'var(--text-muted)',
        opacity: 0.3,
        whiteSpace: 'nowrap' as const,
    },
    value: {
        color: 'var(--text-secondary)',
        width: '60px',
        minWidth: '60px',
        flexShrink: 0,                    // CRITICAL — never crush the value
        textAlign: 'right' as const,
        fontSize: '12px',
        whiteSpace: 'nowrap' as const,
    },
};
