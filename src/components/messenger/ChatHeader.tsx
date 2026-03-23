import React from 'react';
import type { ChatChannel } from '@/types';
import './MessengerLayout.css';

const CHANNEL_ICONS: Record<string, string> = {
    general: '💬',
    combat: '⚔️',
    roleplay: '🎭',
    announcements: '📢',
    whisper: '🔒',
};

interface ChatHeaderProps {
    channel: ChatChannel;
    sidebarCollapsed: boolean;
    onToggleSidebar: () => void;
    showGlobe: boolean;
    onToggleGlobe: () => void;
    /* Mobile props */
    channels?: ChatChannel[];
    onSelectChannel?: (id: string) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    channel, sidebarCollapsed, onToggleSidebar,
    showGlobe, onToggleGlobe,
    channels, onSelectChannel,
}) => {
    return (
        <div className="msger-chat__header">
            <div className="msger-chat__header-left">
                {/* Sidebar open button (when collapsed) */}
                {sidebarCollapsed && (
                    <button
                        className="msger-sidebar__collapse-btn"
                        onClick={onToggleSidebar}
                        title="Open channels"
                        style={{ marginRight: 4 }}
                    >
                        ☰
                    </button>
                )}

                {/* Channel icon */}
                <div className="msger-chat__header-icon">
                    {CHANNEL_ICONS[channel.type] || '#'}
                </div>

                {/* Channel info */}
                <div className="msger-chat__header-info">
                    {/* Mobile dropdown */}
                    {sidebarCollapsed && channels && onSelectChannel && (
                        <select
                            className="msger-chat__mobile-select"
                            value={channel.id}
                            onChange={e => onSelectChannel(e.target.value)}
                        >
                            {channels.map(ch => (
                                <option key={ch.id} value={ch.id}>
                                    {CHANNEL_ICONS[ch.type]} {ch.name.replace('# ', '')}
                                </option>
                            ))}
                        </select>
                    )}
                    <div className="msger-chat__header-name">{channel.name}</div>
                    <div className="msger-chat__header-desc">{channel.description}</div>
                </div>
            </div>

            <div className="msger-chat__header-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                    className={`msger-chat__globe-btn ${showGlobe ? 'active' : ''}`}
                    onClick={onToggleGlobe}
                    title="Tactical Globe View"
                    style={{ 
                        background: 'transparent', 
                        border: '1px solid rgba(0, 255, 255, 0.2)',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        color: showGlobe ? '#00ffff' : 'rgba(0, 255, 255, 0.6)',
                        boxShadow: showGlobe ? '0 0 10px rgba(0, 255, 255, 0.3)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    🌍 {showGlobe ? 'CLOSE GRID' : 'TACTICAL GRID'}
                </button>
                <span className="msger-chat__header-badge">{channel.type}</span>
            </div>
        </div>
    );
};
