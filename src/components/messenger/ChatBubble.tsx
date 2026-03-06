import React, { useState } from 'react';
import type { ChannelMessage } from '@/types';
import './MessengerLayout.css';

const FACTION_COLORS: Record<string, string> = {
    TECHNOCRATS: '#00D4FF',
    KEEPERS_OF_THE_VEIL: '#00FF41',
    IRONBORN_COLLECTIVE: '#FF6600',
};

const REACTION_EMOJIS = ['⚡', '🔥', '🗡️', '💀', '👍'];

function relativeTime(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 10) return 'now';
    const m = Math.floor(s / 60);
    if (m < 1) return `${s}s ago`;
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

interface ChatBubbleProps {
    message: ChannelMessage;
    isOwnMessage: boolean;
    isGrouped: boolean;
    onReact: (emoji: string) => void;
    currentUserId: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
    message, isOwnMessage, isGrouped, onReact, currentUserId
}) => {
    const [showReactions, setShowReactions] = useState(false);
    const isSystem = message.userId === 'SYSTEM';
    const factionColor = FACTION_COLORS[message.faction] || 'var(--text-primary)';

    /* ── System messages ── */
    if (isSystem) {
        return (
            <div className="bubble-row bubble-row--system">
                <div className="bubble--system">{message.content}</div>
            </div>
        );
    }

    /* ── Chat bubble ── */
    const rowClass = `bubble-row ${isOwnMessage ? 'bubble-row--own' : 'bubble-row--other'} ${isGrouped ? 'bubble-row--grouped' : ''}`;
    const initial = message.designation ? message.designation.charAt(0).toUpperCase() : '?';

    const cssVars = {
        '--bubble-faction-color': factionColor,
        '--bubble-avatar-bg': `${factionColor}12`,
        '--bubble-avatar-glow': `${factionColor}30`,
    } as React.CSSProperties;

    return (
        <div
            className={rowClass}
            style={cssVars}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
        >
            {/* Avatar (only for other users) */}
            {!isOwnMessage && (
                <div className="bubble__avatar">{initial}</div>
            )}

            {/* Bubble body */}
            <div>
                <div className="bubble__body">
                    {/* Header (skip for grouped or own) */}
                    {!isGrouped && !isOwnMessage && (
                        <div className="bubble__header">
                            <span className="bubble__author">[{message.designation}]</span>
                            <span className="bubble__rank">{message.rank}</span>
                        </div>
                    )}

                    {/* Content */}
                    <div className="bubble__content">{message.content}</div>
                </div>

                {/* Timestamp (only for non-grouped) */}
                {!isGrouped && (
                    <div className="bubble__time">{relativeTime(message.timestamp)}</div>
                )}

                {/* Existing reactions */}
                {Object.keys(message.reactions).length > 0 && (
                    <div className="bubble__reactions">
                        {Object.entries(message.reactions).map(([emoji, users]) =>
                            users.length > 0 ? (
                                <button
                                    key={emoji}
                                    className={`bubble__reaction-pill ${users.includes(currentUserId) ? 'bubble__reaction-pill--active' : ''}`}
                                    onClick={() => onReact(emoji)}
                                >
                                    {emoji}
                                    <span className="bubble__reaction-pill-count">{users.length}</span>
                                </button>
                            ) : null
                        )}
                    </div>
                )}

                {/* Reaction picker (on hover) */}
                {showReactions && (
                    <div className="bubble__react-bar">
                        {REACTION_EMOJIS.map(emoji => (
                            <button
                                key={emoji}
                                className="bubble__react-btn"
                                onClick={() => onReact(emoji)}
                                title={`React with ${emoji}`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
