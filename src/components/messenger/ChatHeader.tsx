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
    /* Mobile props */
    channels?: ChatChannel[];
    onSelectChannel?: (id: string) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    channel, sidebarCollapsed, onToggleSidebar,
    channels, onSelectChannel,
}) => {
    return (
        <div className="msger-chat__header">
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

            {/* Type badge */}
            <span className="msger-chat__header-badge">{channel.type}</span>
        </div>
    );
};
