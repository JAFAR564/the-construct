import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGameStore } from '@/stores/useGameStore';
import type { Quest } from '@/types';
import './FeedLayout.css';

/* ─── Navigation items ─── */
const NAV_ITEMS = [
    { path: '/terminal', label: 'FEED', icon: '📡' },
    { path: '/quests', label: 'QUESTS', icon: '📋' },
    { path: '/world', label: 'WORLD', icon: '🗺' },
    { path: '/faction', label: 'FACTION', icon: '⚔' },
    { path: '/profile', label: 'PROFILE', icon: '👤' },
    { path: '/ranks', label: 'RANKS', icon: '🏆' },
    { path: '/config', label: 'CONFIG', icon: '⚙' },
];

/* ─── Sidebar: Profile Widget ─── */
const ProfileWidget: React.FC = () => {
    const user = useGameStore(s => s.user);
    if (!user) return null;

    const xpProgress = user.xpToNextRank > 0
        ? Math.min(100, Math.round((user.xp / user.xpToNextRank) * 100))
        : 0;

    const initial = user.designation ? user.designation.charAt(0).toUpperCase() : '?';

    return (
        <div className="sidebar-widget">
            <div className="sidebar-widget__title">Architect</div>
            <div className="profile-widget__avatar">
                {user.avatarDataUrl
                    ? <img src={user.avatarDataUrl} alt={user.designation} />
                    : initial
                }
            </div>
            <div className="profile-widget__name">{user.designation || 'UNKNOWN'}</div>
            <div className="profile-widget__rank">{user.rank} — Lv.{user.level ?? 1}</div>

            <div className="xp-bar-container">
                <div className="xp-bar-label">
                    <span>XP</span>
                    <span>{user.xp} / {user.xpToNextRank}</span>
                </div>
                <div className="xp-bar-track">
                    <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
                </div>
            </div>

            <div className="profile-widget__stats">
                <div className="profile-widget__stat">
                    <div className="profile-widget__stat-val">{user.prestige}</div>
                    <div className="profile-widget__stat-label">Prestige</div>
                </div>
                <div className="profile-widget__stat">
                    <div className="profile-widget__stat-val">S-{String(user.currentSector ?? 0).padStart(2, '0')}</div>
                    <div className="profile-widget__stat-label">Sector</div>
                </div>
            </div>
        </div>
    );
};

/* ─── Sidebar: Navigation Widget ─── */
const NavWidget: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="sidebar-widget">
            <div className="sidebar-widget__title">Navigation</div>
            <div className="nav-widget__links">
                {NAV_ITEMS.map(item => (
                    <button
                        key={item.path}
                        className={`nav-widget__link ${location.pathname === item.path ? 'nav-widget__link--active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        <span className="nav-widget__icon">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

/* ─── Right Panel: Sector Widget ─── */
const SectorWidget: React.FC = () => {
    const user = useGameStore(s => s.user);
    if (!user) return null;

    return (
        <div className="sidebar-widget">
            <div className="sidebar-widget__title">Current Sector</div>
            <div className="sector-widget__row">
                <span className="sector-widget__key">Location</span>
                <span className="sector-widget__val">S-{String(user.currentSector ?? 0).padStart(2, '0')}</span>
            </div>
            <div className="sector-widget__row">
                <span className="sector-widget__key">Element</span>
                <span className="sector-widget__val">{user.primaryElement || '—'}</span>
            </div>
        </div>
    );
};

/* ─── Right Panel: Faction Info ─── */
const FactionWidget: React.FC = () => {
    const user = useGameStore(s => s.user);
    if (!user) return null;

    const factionDisplay = user.faction?.replace(/_/g, ' ') || 'UNALIGNED';

    return (
        <div className="sidebar-widget">
            <div className="sidebar-widget__title">Faction</div>
            <div className="faction-widget__name">{factionDisplay}</div>
            <div className="faction-widget__prestige">
                ★ Prestige: {user.prestige}
            </div>
        </div>
    );
};

/* ─── Right Panel: Active Quest ─── */
const ActiveQuestWidget: React.FC = () => {
    const quests = useGameStore(s => s.quests);
    const safeQuests = Array.isArray(quests) ? quests : [];
    const activeQuest = safeQuests.find((q: Quest) => q?.status === 'ACTIVE');

    if (!activeQuest) return (
        <div className="sidebar-widget">
            <div className="sidebar-widget__title">Active Directive</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                No active directive.
            </div>
        </div>
    );

    return (
        <div className="sidebar-widget">
            <div className="sidebar-widget__title">Active Directive</div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'var(--faction-active)', marginBottom: 4 }}>
                {activeQuest.title}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                Stage {activeQuest.currentStage + 1} / {activeQuest.totalStages} · {activeQuest.difficulty}
            </div>
        </div>
    );
};


/* ─── FeedLayout Container ─── */

interface FeedLayoutProps {
    children: React.ReactNode;
    inputBar: React.ReactNode;
}

export const FeedLayout: React.FC<FeedLayoutProps> = ({ children, inputBar }) => {
    return (
        <div className="feed-layout">
            {/* LEFT SIDEBAR */}
            <aside className="feed-layout__sidebar">
                <ProfileWidget />
                <NavWidget />
            </aside>

            {/* CENTER FEED */}
            <main className="feed-layout__center">
                <div className="feed-layout__scroll" id="feed-scroll">
                    {children}
                </div>
                <div className="feed-layout__input-area">
                    {inputBar}
                </div>
            </main>

            {/* RIGHT PANEL */}
            <aside className="feed-layout__panel">
                <SectorWidget />
                <FactionWidget />
                <ActiveQuestWidget />
            </aside>
        </div>
    );
};
