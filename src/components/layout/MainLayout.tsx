import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Terminal, User, Map, ScrollText, Settings, Users } from 'lucide-react';
import { useGameStore } from '@/stores/useGameStore';
import { useOfflineDetect } from '@/hooks/useOfflineDetect';
import { useTheme } from '@/hooks/useTheme';
import { ScanlineOverlay } from '@/components/ui/ScanlineOverlay';
import { ParticleBackground } from '@/components/ui/ParticleBackground';
import { apiClient } from '@/services/client';

export const MainLayout: React.FC = () => {
    useTheme(); // Applies all CSS vars automatically
    const user = useGameStore(state => state.user);
    const { isOnline } = useOfflineDetect();
    const isBackendConnected = apiClient.isAvailable();

    if (!user) return null;

    return (
        <div className="main-layout">

            {/* CRT effects — fixed, covers entire screen, pointer-events: none */}
            <ScanlineOverlay />
            <ParticleBackground />

            {/* Top header bar */}
            <header className="hud-header">
                <span className="hud-title terminal-glow">
                    CONSTRUCT OS v3.0
                </span>
                <span className="hud-info">
                    {user.designation} | {user.rank} | S-{String(user.currentSector ?? 0).padStart(2, '0')}
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {!isOnline && (
                        <span className="hud-offline">[OFFLINE]</span>
                    )}
                    <span style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: isBackendConnected ? 'var(--text-secondary)' : 'var(--accent-warning)',
                    }}>
                        {isBackendConnected ? '[GRID: LINKED]' : '[GRID: LOCAL]'}
                    </span>
                </div>
            </header>

            {/* Page content — scrollable area between header and nav */}
            <main className="main-content">
                <Outlet />
            </main>

            {/* Bottom navigation */}
            <nav className="bottom-nav">
                <NavLink to="/terminal" className={({ isActive }) => `nav-item ${isActive ? 'active' : 'inactive'}`}>
                    <Terminal />
                    <span className="nav-label">TERM</span>
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : 'inactive'}`}>
                    <User />
                    <span className="nav-label">ARCH</span>
                </NavLink>
                <NavLink to="/world" className={({ isActive }) => `nav-item ${isActive ? 'active' : 'inactive'}`}>
                    <Map />
                    <span className="nav-label">GRID</span>
                </NavLink>
                <NavLink to="/quests" className={({ isActive }) => `nav-item ${isActive ? 'active' : 'inactive'}`}>
                    <ScrollText />
                    <span className="nav-label">DIR</span>
                </NavLink>
                <NavLink to="/faction" className={({ isActive }) => `nav-item ${isActive ? 'active' : 'inactive'}`}>
                    <Users />
                    <span className="nav-label">FAC</span>
                </NavLink>
                <NavLink to="/config" className={({ isActive }) => `nav-item ${isActive ? 'active' : 'inactive'}`}>
                    <Settings />
                    <span className="nav-label">SYS</span>
                </NavLink>
            </nav>

            {/* Micro-footer — barely visible, non-intrusive */}
            <div style={{
                textAlign: 'center',
                fontSize: '9px',
                color: 'var(--text-muted)',
                padding: '3px 0 2px',
                fontFamily: 'var(--font-mono)',
                opacity: 0.6,
            }}>
                CONSTRUCT OS — Community Funded |{' '}
                <a
                    href="https://ko-fi.com/litxarchitect"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none' }}
                >
                    ⚡ Support
                </a>
            </div>
        </div>
    );
};
