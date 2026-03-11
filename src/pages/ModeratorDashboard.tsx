import React, { useState } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import * as db from '@/services/supabaseDB';
import { generateLocalEvent } from '@/services/eventGenerator';
import type { EventType } from '@/types';
import '@/styles/PremiumPage.css';

export const ModeratorDashboard: React.FC = () => {
    const user = useGameStore(state => state.user);
    const addEvent = useGameStore(state => state.addEvent);
    const permissions = user?.permissions || [];
    
    const [selectedEventType, setSelectedEventType] = useState<EventType>('ANOMALY');
    const [targetSector, setTargetSector] = useState(0);

    const handleTriggerEvent = async () => {
        if (!permissions.includes('TRIGGER_EVENT')) return;
        
        // Generate a localized event
        const newEvent = generateLocalEvent([targetSector]);
        newEvent.eventType = selectedEventType;
        newEvent.title = `[MANUAL_OVERRIDE] ${selectedEventType}`;
        newEvent.threatLevel = 10;
        
        // Push to local store (which broadcasts to real-time if configured)
        addEvent(newEvent);
        
        // Log in Audit system
        await db.addAuditLog(user!.id, 'TRIGGER_EVENT', { eventType: selectedEventType, targetSector });
        alert(`Event ${selectedEventType} deployed to S-${targetSector.toString().padStart(2, '0')}.`);
    };

    if (user?.role !== 'MODERATOR' && user?.role !== 'ADMIN') {
        return <div style={{ color: 'var(--accent-danger)', padding: 20, fontFamily: 'var(--font-mono)' }}>[ACCESS_DENIED]</div>;
    }

    const hasPanopticon = permissions.includes('TRIGGER_EVENT') || user?.role === 'ADMIN';
    const hasOversight = permissions.includes('USER_WARN') || user?.role === 'ADMIN';

    return (
        <div className="ppage">
            <div className="ppage__title" style={{ color: 'var(--accent-info)' }}>[GRID_OVERSIGHT: MODERATOR]</div>
            <div className="ppage__title-divider" style={{ background: 'var(--accent-info)' }} />

            <div className="ppage__flex-col ppage__gap-lg">
                <div className="ppage__support">
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        CURRENT AUTHORIZATION FLAGS: [{permissions.join(', ') || 'NONE'}]
                    </div>
                </div>

                {/* Player Oversight */}
                <div className="ppage__setting" style={{ opacity: hasOversight ? 1 : 0.4 }}>
                    <div className="ppage__setting-label" style={{ color: 'var(--text-bright)' }}>PLAYER OVERSIGHT</div>
                    <div className="ppage__setting-desc">Resolve support tickets, warn users, and enforce behavioral protocols.</div>
                    {hasOversight ? (
                        <div className="ppage__card" style={{ background: 'rgba(0,0,0,0.3)', padding: 16 }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontStyle: 'italic' }}>
                                // Player Oversight module routing initialized. Awaiting player telemetry...
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: 'var(--accent-danger)', fontSize: '10px' }}>[INSUFFICIENT_CLEARANCE]</div>
                    )}
                </div>

                {/* The Panopticon */}
                <div className="ppage__setting" style={{ opacity: hasPanopticon ? 1 : 0.4 }}>
                    <div className="ppage__setting-label" style={{ color: 'var(--accent-danger)' }}>THE PANOPTICON</div>
                    <div className="ppage__setting-desc" style={{ marginBottom: 12 }}>Deploy localized hazards and manipulate core lore variables in real time.</div>
                    
                    {hasPanopticon ? (
                        <div className="ppage__card" style={{ background: 'rgba(20,0,0,0.3)', borderColor: 'var(--accent-danger)', padding: 16 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 100px auto', gap: 12, marginBottom: 16 }}>
                                <select 
                                    className="ppage__input" 
                                    value={selectedEventType} 
                                    onChange={(e) => setSelectedEventType(e.target.value as EventType)}
                                >
                                    <option value="ANOMALY">ANOMALY</option>
                                    <option value="FACTION_WAR">FACTION_WAR</option>
                                    <option value="INVASION">INVASION</option>
                                    <option value="DISCOVERY">DISCOVERY</option>
                                </select>
                                <input 
                                    type="number"
                                    className="ppage__input" 
                                    placeholder="Sector" 
                                    value={targetSector} 
                                    onChange={(e) => setTargetSector(Number(e.target.value))} 
                                />
                                <button 
                                    className="ppage__btn" 
                                    style={{ borderColor: 'var(--accent-danger)', color: 'var(--accent-danger)' }}
                                    onClick={handleTriggerEvent}
                                >
                                    DEPLOY HAZARD
                                </button>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Warning: Deploying hazards to heavily populated sectors will affect all active Architects in that region. Ensure narrative consistency.
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: 'var(--accent-danger)', fontSize: '10px' }}>[INSUFFICIENT_CLEARANCE]</div>
                    )}
                </div>
            </div>
        </div>
    );
};
