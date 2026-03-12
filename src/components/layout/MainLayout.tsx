import React, { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Terminal, User, Map, ScrollText, Settings, Users, BookOpen, Trophy } from 'lucide-react';
import { useGameStore } from '@/stores/useGameStore';
import { useOfflineDetect } from '@/hooks/useOfflineDetect';
import { useTheme } from '@/hooks/useTheme';
import { ScanlineOverlay } from '@/components/ui/ScanlineOverlay';
import { ParticleBackground } from '@/components/ui/ParticleBackground';
import { apiClient } from '@/services/client';
import { SoundManager } from '@/utils/soundManager';
import { supabase, isSupabaseConfigured } from '@/services/supabase';
import { generateLocalEvent } from '@/services/eventGenerator';
import type { WorldEvent } from '@/types';

export const MainLayout: React.FC = () => {
    useTheme(); // Applies all CSS vars automatically
    const user = useGameStore(state => state.user);
    const { isOnline } = useOfflineDetect();
    const isBackendConnected = apiClient.isAvailable();

    // Ambient audio lifecycle
    useEffect(() => {
        if (!user) return;
        const ambientEnabled = user.settings?.ambientEnabled ?? false;
        const ambientVolume = (user.settings?.ambientVolume ?? 15) / 100;

        if (ambientEnabled && !SoundManager.isAmbientPlaying()) {
            SoundManager.setAmbientVolume(ambientVolume);
            SoundManager.startAmbient(user.faction);
        } else if (!ambientEnabled && SoundManager.isAmbientPlaying()) {
            SoundManager.stopAmbient();
        }

        return () => {
            if (SoundManager.isAmbientPlaying()) {
                SoundManager.stopAmbient();
            }
        };
    }, [user, user?.settings?.ambientEnabled, user?.settings?.ambientVolume, user?.faction]);

    // Active World Events & Realtime Subscription
    const activeEvents = useGameStore(state => state.activeEvents);
    const addEvent = useGameStore(state => state.addEvent);
    const removeEvent = useGameStore(state => state.removeEvent);

    useEffect(() => {
        if (!user) return;

        let interval: ReturnType<typeof setInterval>;
        let channel: unknown;

        if (isSupabaseConfigured) {
            // Subscribe to real-time World Event insertions from Supabase
            channel = supabase.channel('public:world_events')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'world_events' }, (payload: Record<string, unknown>) => {
                    const newEvent = payload.new as WorldEvent;
                    if (newEvent.isActive) {
                        addEvent(newEvent);
                        // Auto-dismiss notification overlay after 10s (keeps it in store though)
                        setTimeout(() => removeEvent(newEvent.id), 10000);
                    }
                })
                .subscribe();
        } else {
            // Offline/Fallback mode: randomly generate events every few minutes
            const currentSector = user.currentSector;
            interval = setInterval(() => {
                // 10% chance every 2 minutes
                if (Math.random() < 0.1) {
                    const localEvent = generateLocalEvent(currentSector ? [currentSector] : []);
                    addEvent(localEvent);
                    setTimeout(() => removeEvent(localEvent.id), 10000);
                }
            }, 120000);
        }

        return () => {
            if (interval) clearInterval(interval);
            if (channel) supabase.removeChannel(channel);
        };
    }, [user, user?.id, user?.currentSector, addEvent, removeEvent]);

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
                    {user.role === 'ADMIN' && (
                        <NavLink to="/admin" style={{ color: 'var(--accent-warning)', textDecoration: 'none', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>[SYS_ADMIN]</NavLink>
                    )}
                    {user.role === 'MODERATOR' && (
                        <NavLink to="/moderator" style={{ color: 'var(--accent-info)', textDecoration: 'none', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>[SYS_MOD]</NavLink>
                    )}
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
            <main className="main-content" style={{ position: 'relative' }}>
                
                {/* Global Event Notification Overlay */}
                {activeEvents.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: 10,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 100,
                        width: '90%',
                        maxWidth: '400px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        animation: 'slideDown 0.3s ease-out',
                    }}>
                        {activeEvents.map(ev => (
                            <div key={ev.id} className="ppage__card" style={{
                                padding: '12px 16px',
                                background: 'rgba(20, 0, 0, 0.85)',
                                border: '1px solid var(--accent-danger)',
                                borderLeft: '4px solid var(--accent-danger)',
                                backdropFilter: 'blur(8px)',
                                boxShadow: '0 4px 12px rgba(255, 0, 0, 0.2), 0 0 0 1px rgba(255, 0, 0, 0.1) inset'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ color: 'var(--accent-danger)', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>
                                        ⚠ GLOBAL {ev.eventType} DETECTED
                                    </span>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>THREAT: {ev.threatLevel}/10</span>
                                </div>
                                <div style={{ color: 'var(--text-bright)', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-ui)', marginBottom: 4 }}>
                                    {ev.title}
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '11px', lineHeight: 1.4 }}>
                                    {ev.description}
                                </div>
                                <div style={{ marginTop: 6, fontSize: '10px', color: 'var(--text-muted)' }}>
                                    Affected Sectors: {ev.activeSectors.map(s => `S-${String(s).padStart(2, '0')}`).join(', ')}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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
                <NavLink to="/codex" className={({ isActive }) => `nav-item ${isActive ? 'active' : 'inactive'}`}>
                    <BookOpen />
                    <span className="nav-label">LORE</span>
                </NavLink>
                <NavLink to="/ranks" className={({ isActive }) => `nav-item ${isActive ? 'active' : 'inactive'}`}>
                    <Trophy />
                    <span className="nav-label">RANKS</span>
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
