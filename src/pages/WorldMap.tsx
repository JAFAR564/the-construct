import React, { useEffect, useState } from 'react';
import { useFactionStore } from '@/stores/useFactionStore';
import { useGameStore } from '@/stores/useGameStore';
import { FACTIONS } from '@/constants/factions';
import type { Sector } from '@/types';
import '@/styles/PremiumPage.css';

// ── CONSTANTS ──

const WEATHER_ICONS: Record<string, string> = {
    clear: '☀', rain: '🌧', storm: '⛈', fog: '🌫', sandstorm: '🏜', anomaly: '◈',
};

const TERRAIN_LABELS: Record<string, string> = {
    urban: 'URBAN', wasteland: 'WASTELAND', forest: 'FOREST',
    underground: 'UNDERGROUND', aquatic: 'AQUATIC', void: 'VOID',
    mountain: 'MOUNTAIN', ruins: 'RUINS',
};

const POI_ICONS: Record<string, string> = {
    dungeon: '⚔', settlement: '🏘', landmark: '🏛', anomaly: '◈', vendor: '🏪',
};

const THREAT_COLOR = (t: number) => t <= 3 ? '#00FF41' : t <= 6 ? '#FFD700' : '#FF4444';

// ── SCOUT REPORT TEMPLATES ──

const SCOUT_REPORTS = [
    (s: Sector) => `SCAN COMPLETE — Sector S-${String(s.id).padStart(2, '0')} [${s.name}]. Terrain: ${s.terrain.toUpperCase()}. Threat assessment: ${s.threatLevel}/10. ${s.resources.length} resource signatures detected. ${s.pointsOfInterest.filter(p => !p.discovered).length} uncharted points of interest identified. Recommend caution.`,
    (s: Sector) => `SECTOR ANALYSIS — S-${String(s.id).padStart(2, '0')} yields ${s.resources.join(', ')}. Weather conditions: ${s.weather}. ${s.npcsPresent.length > 0 ? `Detected ${s.npcsPresent.length} active designation(s) in the area.` : 'No hostile designations detected.'} Scanner confidence: 87%.`,
    (s: Sector) => `GRID SCAN RESULTS — ${s.name} registers as ${s.controlledBy ? s.controlledBy.replace(/_/g, ' ') + ' territory' : 'contested zone'}. Environmental hazards: ${s.weather === 'clear' ? 'minimal' : s.weather.toUpperCase()}. ${s.pointsOfInterest.length} structural signatures found. Proceed with standard precautions, Architect.`,
];

const TRAVEL_NARRATIVES = [
    (from: string, to: string) => `Disconnecting from ${from}... Re-routing data streams... Grid coordinates locked. Materializing in ${to}. Welcome, Architect.`,
    (from: string, to: string) => `Transit initiated. ${from} fades to static. The Grid reshapes. ${to} renders around you — new sector, new possibilities.`,
    (from: string, to: string) => `You step through the sector boundary. ${from} dissolves behind you. ${to} loads in fragments: terrain first, then structures, then the ambient noise of a new world.`,
];

const ENCOUNTER_MESSAGES = [
    '⚠ ALERT: A rogue subroutine emerges from the data stream! It challenges you to prove your worth. (+15 XP)',
    '⚠ CONTACT: An unknown Architect hails you on a private frequency. They share intelligence about a hidden cache. (+20 XP)',
    '⚠ DISCOVERY: Your scanner picks up an anomalous energy signature. Investigation reveals a buried data fragment. (+10 XP)',
    '⚠ AMBUSH: Hostile constructs engage! Your defenses hold. Combat data logged for analysis. (+25 XP)',
    '⚠ EVENT: A faction patrol crosses your path. After tense negotiation, they let you pass — barely. (+5 XP)',
];

// ── MAIN COMPONENT ──

export const WorldMap: React.FC = () => {
    const user = useGameStore(state => state.user);
    const updateUser = useGameStore(state => state.updateUser);
    const {
        sectors, initializeSectors, discoverSector, discoverPOI,
        markScouted, isScouted, updateSectorControl,
    } = useFactionStore();

    const [selectedSectorId, setSelectedSectorId] = useState<number | null>(null);
    const [travelNarrative, setTravelNarrative] = useState<string | null>(null);
    const [scoutReport, setScoutReport] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [isActing, setIsActing] = useState(false);

    const currentSector = user?.currentSector || 1;

    useEffect(() => {
        if (user) initializeSectors(currentSector);
    }, [user, currentSector, initializeSectors]);

    if (!user) return null;

    const displaySectors = sectors.length > 0 ? sectors : [];
    const selectedSector = displaySectors.find(s => s.id === selectedSectorId);
    const playerSector = displaySectors.find(s => s.id === currentSector);

    // ── ACTIONS ──

    const handleScout = () => {
        if (!selectedSector || isActing) return;
        if (isScouted(selectedSector.id)) { setActionMessage('⚠ Sector already scouted this session.'); return; }
        setIsActing(true); setScoutReport(null);
        setTimeout(() => {
            const template = SCOUT_REPORTS[Math.floor(Math.random() * SCOUT_REPORTS.length)];
            setScoutReport(template(selectedSector));
            selectedSector.pointsOfInterest.forEach(poi => { if (!poi.discovered) discoverPOI(selectedSector.id, poi.id); });
            discoverSector(selectedSector.id);
            markScouted(selectedSector.id);
            if (Math.random() < 0.2) {
                const encounter = ENCOUNTER_MESSAGES[Math.floor(Math.random() * ENCOUNTER_MESSAGES.length)];
                setActionMessage(encounter);
                const xpMatch = encounter.match(/\+(\d+) XP/);
                if (xpMatch) updateUser({ xp: (user.xp || 0) + parseInt(xpMatch[1]), totalXP: (user.totalXP || 0) + parseInt(xpMatch[1]) });
            } else { setActionMessage(null); }
            setIsActing(false);
        }, 1500);
    };

    const handleTravel = () => {
        if (!selectedSector || isActing) return;
        if (!playerSector?.adjacentSectors.includes(selectedSector.id)) { setActionMessage('⚠ Cannot travel — sector is not adjacent.'); return; }
        setIsActing(true); setTravelNarrative(null);
        const fromName = playerSector?.name || 'Unknown';
        const template = TRAVEL_NARRATIVES[Math.floor(Math.random() * TRAVEL_NARRATIVES.length)];
        setTravelNarrative(template(fromName, selectedSector.name));
        setTimeout(() => {
            updateUser({ currentSector: selectedSector.id });
            discoverSector(selectedSector.id);
            selectedSector.adjacentSectors.forEach(adjId => discoverSector(adjId));
            if (Math.random() < 0.15) {
                const encounter = ENCOUNTER_MESSAGES[Math.floor(Math.random() * ENCOUNTER_MESSAGES.length)];
                setActionMessage(encounter);
                const xpMatch = encounter.match(/\+(\d+) XP/);
                if (xpMatch) updateUser({ xp: (user.xp || 0) + parseInt(xpMatch[1]), totalXP: (user.totalXP || 0) + parseInt(xpMatch[1]) });
            } else { setActionMessage(null); }
            setIsActing(false); setSelectedSectorId(null); setTravelNarrative(null);
        }, 2500);
    };

    const handleClaim = () => {
        if (!selectedSector || isActing) return;
        if (selectedSector.controlledBy) { setActionMessage('⚠ Only contested sectors can be claimed.'); return; }
        if (!playerSector?.adjacentSectors.includes(selectedSector.id) && selectedSector.id !== currentSector) { setActionMessage('⚠ Must be adjacent to or in the sector.'); return; }
        setIsActing(true);
        setActionMessage('⚔ Initiating faction claim protocol... Deploying beacons...');
        setTimeout(() => {
            const success = Math.random() < 0.55;
            if (success) {
                updateSectorControl(selectedSector.id, user.faction);
                setActionMessage(`✅ CLAIM SUCCESSFUL! S-${String(selectedSector.id).padStart(2, '0')} belongs to ${user.faction.replace(/_/g, ' ')}. +30 XP, +15 Prestige.`);
                updateUser({ xp: (user.xp || 0) + 30, totalXP: (user.totalXP || 0) + 30, prestige: (user.prestige || 0) + 15 });
            } else {
                setActionMessage(`❌ CLAIM FAILED. S-${String(selectedSector.id).padStart(2, '0')} resists. Try again later. +10 XP.`);
                updateUser({ xp: (user.xp || 0) + 10, totalXP: (user.totalXP || 0) + 10 });
            }
            setIsActing(false);
        }, 3000);
    };

    const isAdjacent = (sectorId: number) => playerSector?.adjacentSectors.includes(sectorId) || false;

    return (
        <div className="ppage">
            <div className="ppage__title">THE GRID — SECTOR MAP</div>
            <div className="ppage__title-divider" />

            {/* Travel Narrative Overlay */}
            {travelNarrative && (
                <div className="ppage__card" style={{ marginBottom: 14, borderLeft: '3px solid var(--faction-active)', borderRadius: '0 12px 12px 0' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>⟫ {travelNarrative}</div>
                </div>
            )}

            {/* Sector Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 3, marginBottom: 16, maxWidth: '100%', overflowX: 'auto' }}>
                {displaySectors.map(s => (
                    <SectorCell key={s.id} sector={s} isPlayerHere={s.id === currentSector} isSelected={s.id === selectedSectorId}
                        onClick={() => s.discovered ? setSelectedSectorId(s.id) : null} />
                ))}
            </div>

            {/* Detail Panel */}
            {selectedSector && (
                <SectorDetailPanel sector={selectedSector} isPlayerHere={selectedSector.id === currentSector}
                    isAdjacent={isAdjacent(selectedSector.id)} isContested={!selectedSector.controlledBy}
                    isScouted={isScouted(selectedSector.id)} isActing={isActing}
                    scoutReport={scoutReport} actionMessage={actionMessage}
                    onScout={handleScout} onTravel={handleTravel} onClaim={handleClaim}
                    onClose={() => { setSelectedSectorId(null); setScoutReport(null); setActionMessage(null); }} />
            )}

            {/* Legend */}
            <div className="ppage__card" style={{ padding: '10px 14px' }}>
                <div className="ppage__flex-row" style={{ flexWrap: 'wrap', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                    {FACTIONS.map(f => {
                        const count = displaySectors.filter(s => s.controlledBy === f.id).length;
                        return (
                            <div key={f.id} className="ppage__flex-row ppage__gap-sm">
                                <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: f.color }} />
                                <span style={{ color: f.color }}>{f.id.substring(0, 2)}: {count}</span>
                            </div>
                        );
                    })}
                    <div className="ppage__flex-row ppage__gap-sm">
                        <div style={{ width: 8, height: 8, border: '1px dotted var(--text-muted)', borderRadius: 2 }} />
                        <span style={{ color: 'var(--text-muted)' }}>??: {displaySectors.filter(s => !s.controlledBy).length}</span>
                    </div>

                    <span style={{ color: 'rgba(255,255,255,0.1)' }}>│</span>
                    <span style={{ color: 'var(--faction-active)' }}>📍 S-{String(currentSector).padStart(2, '0')}</span>
                    <span style={{ color: 'rgba(255,255,255,0.1)' }}>│</span>
                    <span style={{ color: 'var(--text-muted)' }}>🌫 {displaySectors.filter(s => !s.discovered).length} undiscovered</span>
                    <span style={{ color: 'rgba(255,255,255,0.1)' }}>│</span>
                    <span style={{ color: 'var(--text-muted)' }}>{Object.entries(WEATHER_ICONS).map(([k, v]) => `${v}${k.slice(0, 3)}`).join(' ')}</span>
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════
// SECTOR CELL COMPONENT
// ═══════════════════════════════════════

interface SectorCellProps {
    sector: Sector; isPlayerHere: boolean; isSelected: boolean; onClick: () => void;
}

const SectorCell: React.FC<SectorCellProps> = ({ sector, isPlayerHere, isSelected, onClick }) => {
    const faction = FACTIONS.find(f => f.id === sector.controlledBy);
    const fColor = faction ? faction.color : 'var(--text-muted)';
    const isContested = !sector.controlledBy;
    const abbr = sector.name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();

    if (!sector.discovered) {
        return (
            <div style={{
                minHeight: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 2,
                border: '1px solid rgba(255,255,255,0.04)', backgroundColor: 'rgba(20,20,20,0.6)', cursor: 'default',
                opacity: 0.35, fontSize: '9px', color: 'var(--text-muted)', borderRadius: 4,
            }}>
                <div style={{ fontSize: '8px' }}>S{String(sector.id).padStart(2, '0')}</div>
                <div style={{ fontWeight: 'bold' }}>???</div>
            </div>
        );
    }

    return (
        <div onClick={onClick} style={{
            minHeight: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 2,
            border: isSelected ? '2px solid var(--faction-active)' : isPlayerHere ? '2px solid var(--faction-active)' : `1px solid ${fColor}33`,
            backgroundColor: faction ? `${faction.color}12` : 'rgba(60,60,60,0.1)', borderRadius: 6,
            cursor: 'pointer', position: 'relative',
            animation: isPlayerHere ? 'pulse 2s infinite' : isContested && sector.discovered ? 'flicker 3s infinite' : 'none',
            boxShadow: isSelected ? '0 0 10px var(--faction-active)' : 'none',
            transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        }}>
            <span style={{ position: 'absolute', top: 1, left: 2, fontSize: '8px', lineHeight: 1 }}>{WEATHER_ICONS[sector.weather] || ''}</span>
            <span style={{ position: 'absolute', top: 3, right: 3, width: 5, height: 5, borderRadius: '50%', backgroundColor: THREAT_COLOR(sector.threatLevel), display: 'inline-block' }} />
            {sector.activeEvents.length > 0 && <span style={{ position: 'absolute', bottom: 1, left: 2, fontSize: '8px', color: 'var(--accent-warning)', animation: 'pulse 1.5s infinite' }}>!</span>}
            {isPlayerHere && <span style={{ position: 'absolute', bottom: 1, right: 2, fontSize: '7px', color: 'var(--faction-active)', fontWeight: 'bold' }}>[&gt;&gt;]</span>}
            <div style={{ fontSize: '7px', color: fColor, lineHeight: 1 }}>{sector.controlledBy ? sector.controlledBy.substring(0, 2) : '??'}</div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', lineHeight: 1.1, color: isPlayerHere ? 'var(--faction-active)' : 'var(--text-primary)' }}>S{String(sector.id).padStart(2, '0')}</div>
            <div style={{ fontSize: '7px', color: 'var(--text-secondary)', lineHeight: 1 }}>{abbr}</div>
        </div>
    );
};

// ═══════════════════════════════════════
// SECTOR DETAIL PANEL
// ═══════════════════════════════════════

interface SectorDetailPanelProps {
    sector: Sector; isPlayerHere: boolean; isAdjacent: boolean; isContested: boolean;
    isScouted: boolean; isActing: boolean; scoutReport: string | null; actionMessage: string | null;
    onScout: () => void; onTravel: () => void; onClaim: () => void; onClose: () => void;
}

const SectorDetailPanel: React.FC<SectorDetailPanelProps> = ({
    sector, isPlayerHere, isAdjacent, isContested,
    isScouted, isActing, scoutReport, actionMessage,
    onScout, onTravel, onClaim, onClose,
}) => {
    const faction = FACTIONS.find(f => f.id === sector.controlledBy);
    const fColor = faction ? faction.color : 'var(--text-muted)';
    const tColor = THREAT_COLOR(sector.threatLevel);

    const threatBar = () => {
        const filled = Math.round((sector.threatLevel / 10) * 10);
        return (
            <span>
                <span style={{ color: tColor }}>{'█'.repeat(filled)}</span>
                <span style={{ color: 'var(--text-muted)', opacity: 0.3 }}>{'░'.repeat(10 - filled)}</span>
                <span style={{ marginLeft: 4 }}>{sector.threatLevel}/10</span>
            </span>
        );
    };

    const weatherEffect = (): string => {
        switch (sector.weather) {
            case 'rain': return '(-10% visibility)';
            case 'storm': return '(-20% accuracy, lightning risk)';
            case 'fog': return '(-15% scan range)';
            case 'sandstorm': return '(-25% movement speed)';
            case 'anomaly': return '(unpredictable effects)';
            default: return '(no modifiers)';
        }
    };

    return (
        <div className="ppage__card" style={{ marginBottom: 16, padding: 18 }}>
            {/* Header */}
            <div className="ppage__flex-between" style={{ marginBottom: 14 }}>
                <h3 style={{ fontSize: '14px', color: 'var(--text-bright)', margin: 0, fontFamily: 'var(--font-ui)' }}>
                    SECTOR S-{String(sector.id).padStart(2, '0')}: {sector.name.toUpperCase()}
                </h3>
                <button className="ppage__btn ppage__btn--sm" onClick={onClose}>[X]</button>
            </div>

            {/* Stats */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }} className="ppage__flex-col ppage__gap-sm">
                <div className="ppage__stat-row"><span className="ppage__stat-key" style={{ minWidth: 80 }}>Control</span><span style={{ color: fColor, fontWeight: 700 }}>{sector.controlledBy ? sector.controlledBy.replace(/_/g, ' ') : 'CONTESTED'}</span></div>
                <div className="ppage__stat-row"><span className="ppage__stat-key" style={{ minWidth: 80 }}>Terrain</span><span className="ppage__stat-val">{TERRAIN_LABELS[sector.terrain] || sector.terrain.toUpperCase()}</span></div>
                <div className="ppage__stat-row"><span className="ppage__stat-key" style={{ minWidth: 80 }}>Weather</span><span>{WEATHER_ICONS[sector.weather]} {sector.weather.toUpperCase()} <span style={{ color: 'var(--accent-warning)', fontSize: '10px' }}>{weatherEffect()}</span></span></div>
                <div className="ppage__stat-row"><span className="ppage__stat-key" style={{ minWidth: 80 }}>Threat</span>{threatBar()}</div>
            </div>

            {/* Description */}
            <div className="ppage__card" style={{ marginTop: 14, borderLeft: `3px solid ${fColor}`, borderRadius: '0 10px 10px 0', padding: '10px 14px' }}>
                <div style={{ fontSize: '11px', lineHeight: 1.6, color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{sector.description}"</div>
            </div>

            {/* Resources */}
            {sector.resources.length > 0 && (
                <div style={{ marginTop: 14 }}>
                    <h3 className="ppage__section">RESOURCES</h3>
                    {sector.resources.map(r => <div key={r} style={{ fontSize: '11px', color: 'var(--text-secondary)', paddingLeft: 8 }}>• {r}</div>)}
                </div>
            )}

            {/* Points of Interest */}
            {sector.pointsOfInterest.length > 0 && (
                <div style={{ marginTop: 14 }}>
                    <h3 className="ppage__section">POINTS OF INTEREST</h3>
                    {sector.pointsOfInterest.map(poi => (
                        <div key={poi.id} style={{ fontSize: '11px', paddingLeft: 8, marginBottom: 2 }}>
                            {poi.discovered ? (
                                <span style={{ color: 'var(--text-secondary)' }}>{POI_ICONS[poi.type] || '•'} {poi.name} <span className="ppage__badge" style={{ color: 'var(--text-muted)', borderColor: 'rgba(255,255,255,0.1)', marginLeft: 4 }}>{poi.type}</span></span>
                            ) : (
                                <span className="ppage__muted">??? Uncharted — scout to reveal</span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* NPCs */}
            {sector.npcsPresent.length > 0 && (
                <div style={{ marginTop: 14 }}>
                    <h3 className="ppage__section">NPCs</h3>
                    {sector.npcsPresent.map(npc => <div key={npc} style={{ fontSize: '11px', color: 'var(--text-secondary)', paddingLeft: 8 }}>• {npc}</div>)}
                </div>
            )}

            {/* Active Events */}
            {sector.activeEvents.length > 0 && (
                <div style={{ marginTop: 14 }}>
                    <h3 className="ppage__section" style={{ color: 'var(--accent-warning)' }}>ACTIVE EVENTS</h3>
                    {sector.activeEvents.map(ev => <div key={ev} style={{ fontSize: '11px', color: 'var(--accent-warning)', paddingLeft: 8 }}>⚡ {ev}</div>)}
                </div>
            )}

            {/* Scout Report */}
            {scoutReport && (
                <div className="ppage__card ppage__card--success" style={{ marginTop: 14 }}>
                    <span style={{ color: 'var(--faction-active)', fontWeight: 700, fontSize: '11px' }}>SCOUT REPORT: </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '11px', lineHeight: 1.5 }}>{scoutReport}</span>
                </div>
            )}

            {/* Action Message */}
            {actionMessage && (
                <div style={{
                    marginTop: 10, padding: '8px 12px', fontSize: '11px', borderRadius: 8,
                    borderLeft: '3px solid currentColor',
                    color: actionMessage.startsWith('✅') ? 'var(--faction-active)' : actionMessage.startsWith('❌') ? 'var(--accent-danger)' : 'var(--accent-warning)',
                    background: actionMessage.startsWith('✅') ? 'rgba(0,255,65,0.04)' : actionMessage.startsWith('❌') ? 'rgba(255,60,60,0.04)' : 'rgba(255,215,0,0.04)',
                }}>
                    {actionMessage}
                </div>
            )}

            {/* Actions */}
            <div style={{ marginTop: 18 }}>
                <h3 className="ppage__section">ACTIONS</h3>
                <div className="ppage__flex-row" style={{ flexWrap: 'wrap' }}>
                    <button className={`ppage__btn ${!isActing && !isScouted ? 'ppage__btn--primary' : ''}`}
                        onClick={onScout} disabled={isActing || isScouted} title="Scan for encounters and reveal POIs">[S] SCOUT</button>
                    <button className={`ppage__btn ${!isActing && !isPlayerHere && isAdjacent ? 'ppage__btn--primary' : ''}`}
                        onClick={onTravel} disabled={isActing || isPlayerHere || !isAdjacent}
                        title={isPlayerHere ? 'You are already here' : !isAdjacent ? 'Not adjacent' : 'Travel'}>[T] TRAVEL</button>
                    <button className={`ppage__btn ${!isActing && isContested && (isAdjacent || isPlayerHere) ? 'ppage__btn--primary' : ''}`}
                        onClick={onClaim} disabled={isActing || !isContested || (!isAdjacent && !isPlayerHere)}
                        title={!isContested ? 'Not contested' : 'Claim for your faction'}>[C] CLAIM</button>
                    <button className="ppage__btn" onClick={onClose}>[X] CLOSE</button>
                </div>
                {isActing && <div className="ppage__muted" style={{ marginTop: 6 }}>⏳ Processing...</div>}
            </div>
        </div>
    );
};
