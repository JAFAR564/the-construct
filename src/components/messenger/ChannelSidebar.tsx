import React, { useState, useMemo } from 'react';
import type { ChatChannel, Faction } from '@/types';
import './MessengerLayout.css';

const CHANNEL_ICONS: Record<string, string> = {
    general: '💬',
    combat: '⚔️',
    roleplay: '🎭',
    announcements: '📢',
    whisper: '🔒',
};

interface ChannelSidebarProps {
    channels: ChatChannel[];
    activeChannelId: string | null;
    userFaction: Faction;
    onSelectChannel: (id: string) => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
}

export const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
    channels, activeChannelId, userFaction,
    onSelectChannel, collapsed, onToggleCollapse,
}) => {
    const [search, setSearch] = useState('');

    const globalChannels = useMemo(() =>
        channels.filter(ch => ch.faction === 'GLOBAL'), [channels]);
    const factionChannels = useMemo(() =>
        channels.filter(ch => ch.faction === userFaction), [channels, userFaction]);

    const filterChannels = (list: ChatChannel[]) => {
        if (!search.trim()) return list;
        const q = search.toLowerCase();
        return list.filter(ch => ch.name.toLowerCase().includes(q));
    };

    if (collapsed) return null;

    return (
        <aside className="msger-sidebar">
            {/* Header */}
            <div className="msger-sidebar__header">
                <span className="msger-sidebar__title">Channels</span>
                <button
                    className="msger-sidebar__collapse-btn"
                    onClick={onToggleCollapse}
                    title="Collapse sidebar"
                >
                    ◂
                </button>
            </div>

            {/* Search */}
            <div className="msger-sidebar__search">
                <input
                    className="msger-sidebar__search-input"
                    type="text"
                    placeholder="Search channels..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                />
            </div>

            {/* Channel list */}
            <div className="msger-sidebar__list">
                {/* Global */}
                {filterChannels(globalChannels).length > 0 && (
                    <>
                        <div className="msger-sidebar__section">OPEN CHANNELS</div>
                        {filterChannels(globalChannels).map(ch => (
                            <button
                                key={ch.id}
                                className={`msger-channel ${ch.id === activeChannelId ? 'msger-channel--active' : ''}`}
                                onClick={() => onSelectChannel(ch.id)}
                            >
                                <span className="msger-channel__icon">{CHANNEL_ICONS[ch.type] || '#'}</span>
                                <span className="msger-channel__name">{ch.name.replace('# ', '')}</span>
                                {ch.isLocked && <span className="msger-channel__lock">🔒</span>}
                            </button>
                        ))}
                    </>
                )}

                {/* Faction */}
                {filterChannels(factionChannels).length > 0 && (
                    <>
                        <div className="msger-sidebar__section">{userFaction.replace(/_/g, ' ')}</div>
                        {filterChannels(factionChannels).map(ch => (
                            <button
                                key={ch.id}
                                className={`msger-channel ${ch.id === activeChannelId ? 'msger-channel--active' : ''}`}
                                onClick={() => onSelectChannel(ch.id)}
                            >
                                <span className="msger-channel__icon">{CHANNEL_ICONS[ch.type] || '#'}</span>
                                <span className="msger-channel__name">{ch.name.replace(/# .+ — /, '')}</span>
                                {ch.isLocked && <span className="msger-channel__lock">🔒</span>}
                            </button>
                        ))}
                    </>
                )}
            </div>
        </aside>
    );
};
