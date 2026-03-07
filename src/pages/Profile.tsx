import React, { useState, useRef } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FACTIONS } from '@/constants/factions';
import { DEFAULT_ABILITIES } from '@/constants/abilities';
import { compressImage } from '@/utils/imageCompressor';
import type { Equipment, Ability, EquipmentSlot, Alignment, Rarity } from '@/types';
import '@/styles/PremiumPage.css';

type ProfileTab = 'OVERVIEW' | 'ABILITIES' | 'EQUIPMENT' | 'BACKSTORY' | 'MEMORY LOG';

const ALIGNMENT_LABELS: Record<Alignment, string> = {
    LAWFUL_GOOD: 'Lawful Good', NEUTRAL_GOOD: 'Neutral Good', CHAOTIC_GOOD: 'Chaotic Good',
    LAWFUL_NEUTRAL: 'Lawful Neutral', TRUE_NEUTRAL: 'True Neutral', CHAOTIC_NEUTRAL: 'Chaotic Neutral',
    LAWFUL_EVIL: 'Lawful Evil', NEUTRAL_EVIL: 'Neutral Evil', CHAOTIC_EVIL: 'Chaotic Evil',
};

const RARITY_COLORS: Record<Rarity, string> = {
    COMMON: '#AAAAAA', UNCOMMON: '#00FF41', RARE: '#00D4FF', EPIC: '#9B59B6', LEGENDARY: '#FFD700',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
    quest: '#00D4FF', combat: '#FF3333', discovery: '#00FF41', social: '#9B59B6', achievement: '#FFD700',
};

const EQUIPMENT_SLOTS: EquipmentSlot[] = ['WEAPON', 'ARMOR', 'ACCESSORY', 'COMPANION', 'IMPLANT', 'RELIC'];
const ALL_ALIGNMENTS: Alignment[] = [
    'LAWFUL_GOOD', 'NEUTRAL_GOOD', 'CHAOTIC_GOOD',
    'LAWFUL_NEUTRAL', 'TRUE_NEUTRAL', 'CHAOTIC_NEUTRAL',
    'LAWFUL_EVIL', 'NEUTRAL_EVIL', 'CHAOTIC_EVIL',
];

export const Profile: React.FC = () => {
    const { user, updateUser } = useGameStore();
    const [activeTab, setActiveTab] = useState<ProfileTab>('OVERVIEW');
    const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);
    const [backstoryDraft, setBackstoryDraft] = useState('');
    const [mottoDraft, setMottoDraft] = useState('');
    const [songDraft, setSongDraft] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [backstoryInit, setBackstoryInit] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!user) {
        return <div className="ppage"><div className="ppage__empty">ARCHITECT PROFILE NOT FOUND. Please re-authenticate.</div></div>;
    }

    if (!backstoryInit) {
        setBackstoryDraft(user.characterProfile?.backstory || '');
        setMottoDraft(user.characterProfile?.personalMotto || '');
        setSongDraft(user.characterProfile?.themeSong || '');
        setBackstoryInit(true);
    }

    const factionData = FACTIONS.find(f => f.id === user.faction);
    const profile = user.characterProfile || {
        backstory: '', alignment: 'TRUE_NEUTRAL' as Alignment, strengths: [], weaknesses: [],
        allies: [], enemies: [], personalMotto: '', themeSong: '', memoryLog: [], privacyLevel: 'public' as const,
    };
    const abilities = user.abilities?.length > 0 ? user.abilities : DEFAULT_ABILITIES;
    const equipment = user.equipment || [];

    const getEquippedItem = (slot: EquipmentSlot): Equipment | undefined => {
        const itemId = user.equippedItems?.[slot];
        return itemId ? equipment.find(e => e.id === itemId) : equipment.find(e => e.slot === slot);
    };

    const saveBackstory = () => {
        updateUser({ characterProfile: { ...profile, backstory: backstoryDraft, personalMotto: mottoDraft, themeSong: songDraft } });
    };

    const updateAlignment = (alignment: Alignment) => updateUser({ characterProfile: { ...profile, alignment } });
    const updatePrivacy = (privacyLevel: 'public' | 'faction_only' | 'private') => updateUser({ characterProfile: { ...profile, privacyLevel } });

    const addTag = (field: 'strengths' | 'weaknesses' | 'allies' | 'enemies') => {
        if (!tagInput.trim()) return;
        const current = profile[field] || [];
        if (!current.includes(tagInput.trim())) {
            updateUser({ characterProfile: { ...profile, [field]: [...current, tagInput.trim()] } });
        }
        setTagInput('');
    };

    const removeTag = (field: 'strengths' | 'weaknesses' | 'allies' | 'enemies', idx: number) => {
        const current = [...(profile[field] || [])];
        current.splice(idx, 1);
        updateUser({ characterProfile: { ...profile, [field]: current } });
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarUploading(true);
        try {
            const dataUrl = await compressImage(file);
            updateUser({ avatarDataUrl: dataUrl });
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to process image.');
        } finally {
            setAvatarUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAvatarDelete = () => updateUser({ avatarDataUrl: undefined });

    /* ── RENDER HELPERS ── */

    const renderTagField = (label: string, field: 'strengths' | 'weaknesses' | 'allies' | 'enemies') => (
        <div style={{ marginBottom: 16 }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: 6 }}>{label}</div>
            <div className="ppage__flex-wrap" style={{ marginBottom: 6 }}>
                {(profile[field] || []).map((tag, i) => (
                    <span key={i} className="ppage__tag" onClick={() => removeTag(field, i)} title="Click to remove">
                        {tag} ✕
                    </span>
                ))}
            </div>
            <div className="ppage__flex-row">
                <input className="ppage__input" style={{ flex: 1 }} placeholder={`Add ${label.toLowerCase()}...`}
                    value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addTag(field); }} />
                <button className="ppage__btn ppage__btn--primary ppage__btn--sm" onClick={() => addTag(field)}>[+]</button>
            </div>
        </div>
    );

    /* ── TAB: OVERVIEW ── */
    const renderOverview = () => (
        <>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />

            <div style={{ display: 'flex', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
                {/* Avatar */}
                <div className="ppage__avatar-wrap">
                    {user.avatarDataUrl ? (
                        <>
                            <img src={user.avatarDataUrl} alt={user.designation} className="ppage__avatar-img" />
                            <div className="ppage__flex-row" style={{ marginTop: 10 }}>
                                <button className="ppage__btn ppage__btn--sm ppage__btn--primary" onClick={() => fileInputRef.current?.click()} disabled={avatarUploading}>[CHANGE]</button>
                                <button className="ppage__btn ppage__btn--sm ppage__btn--danger" onClick={handleAvatarDelete} disabled={avatarUploading}>[DELETE]</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <pre className="ppage__avatar-ascii">{`    ╔══════╗\n    ║ ◉  ◉ ║\n    ║  ──  ║\n    ║ ╲__╱ ║\n    ╚══════╝\n    ╔══════╗\n    ║      ║\n    ║      ║\n    ╚══╤╤══╝\n      ││`}</pre>
                            <button className="ppage__btn ppage__btn--primary ppage__btn--sm" style={{ marginTop: 10 }} onClick={() => fileInputRef.current?.click()} disabled={avatarUploading}>
                                {avatarUploading ? '[PROCESSING...]' : '[UPLOAD AVATAR]'}
                            </button>
                        </>
                    )}
                    <div className="ppage__avatar-name">{user.designation}</div>
                </div>

                {/* Info panel */}
                <div style={{ flex: 1, minWidth: 220 }} className="ppage__flex-col">
                    <div style={{ fontSize: '18px', color: 'var(--faction-active)', fontWeight: 700, fontFamily: 'var(--font-ui)' }}>{user.designation || 'UNKNOWN'}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>ID: {user.id?.split('-')[0] || '???'}</div>
                    <div className="ppage__stat-row"><span className="ppage__stat-key">RANK</span><span className="ppage__stat-val">{user.rank || 'UNRANKED'}</span></div>
                    <div className="ppage__stat-row"><span className="ppage__stat-key">LEVEL</span><span className="ppage__stat-val ppage__stat-val--accent">{user.level || 1}</span></div>
                    <div className="ppage__stat-row"><span className="ppage__stat-key">FACTION</span><span className="ppage__stat-val ppage__stat-val--accent">{factionData?.name || 'UNALIGNED'}</span></div>
                    <div className="ppage__stat-row"><span className="ppage__stat-key">SECTOR</span><span className="ppage__stat-val">S-{String(user.currentSector ?? 0).padStart(2, '0')}</span></div>
                    <div className="ppage__stat-row"><span className="ppage__stat-key">PRESTIGE</span><span className="ppage__stat-val">{user.prestige || 0}</span></div>
                    <div className="ppage__stat-row"><span className="ppage__stat-key">ALIGNMENT</span><span className="ppage__stat-val">{ALIGNMENT_LABELS[profile.alignment] || 'Unknown'}</span></div>
                    <div style={{ marginTop: 6 }}>
                        <ProgressBar label="XP" current={user.xp || 0} max={user.xpToNextRank || 100} color="var(--faction-active)" />
                    </div>
                </div>
            </div>

            {/* Core Skills */}
            <div style={{ marginBottom: 24 }}>
                <h3 className="ppage__section">CORE SKILLS</h3>
                <div className="ppage__flex-col ppage__gap-sm" style={{ maxWidth: 500 }}>
                    {Object.entries(user.skills || {}).map(([skill, value]) => (
                        <ProgressBar key={skill} label={skill} current={value as number} max={100} color="var(--faction-active)" showValue />
                    ))}
                </div>
            </div>

            {/* Elemental Affinity */}
            <div style={{ marginBottom: 24 }}>
                <h3 className="ppage__section">ELEMENTAL AFFINITY</h3>
                <div className="ppage__stat-row"><span className="ppage__stat-key">PRIMARY</span><span className="ppage__stat-val ppage__stat-val--accent">{user.primaryElement || 'NONE'}</span></div>
                <div className="ppage__stat-row"><span className="ppage__stat-key">SECONDARY</span><span className="ppage__stat-val">{user.secondaryElement || 'NONE'}</span></div>
            </div>

            {/* Titles */}
            <div>
                <h3 className="ppage__section">TITLES</h3>
                {user.titles && user.titles.length > 0 ? (
                    <div className="ppage__flex-wrap">
                        {user.titles.map((t, i) => <span key={i} className="ppage__tag ppage__tag--accent">◆ {t}</span>)}
                    </div>
                ) : (
                    <div className="ppage__muted">No titles earned yet.</div>
                )}
            </div>
        </>
    );

    /* ── TAB: ABILITIES ── */
    const renderAbilities = () => {
        const categories: Record<string, Ability[]> = { OFFENSIVE: [], DEFENSIVE: [], UTILITY: [], PASSIVE: [] };
        abilities.forEach(a => { if (categories[a.category]) categories[a.category].push(a); });

        return (
            <>
                {Object.entries(categories).map(([cat, items]) => items.length > 0 && (
                    <div key={cat} style={{ marginBottom: 20 }}>
                        <h3 className="ppage__section">▸ {cat}</h3>
                        <div className="ppage__flex-col">
                            {items.map(ability => {
                                const locked = !ability.unlocked && (user.level || 1) < ability.levelRequired;
                                return (
                                    <div key={ability.id} className={`ppage__card ${locked ? 'ppage__card--dim' : ''}`}
                                        style={{ borderColor: locked ? undefined : 'rgba(0,255,65,0.15)' }}>
                                        <div className="ppage__flex-between" style={{ marginBottom: 4 }}>
                                            <span style={{ color: locked ? 'var(--text-muted)' : 'var(--faction-active)', fontWeight: 700, fontSize: '13px' }}>{ability.name}</span>
                                            {locked ? (
                                                <span className="ppage__badge" style={{ color: 'var(--accent-warning)', borderColor: 'var(--accent-warning)' }}>REQUIRES LV.{ability.levelRequired}</span>
                                            ) : (
                                                <span className="ppage__badge" style={{ color: 'var(--text-muted)', borderColor: 'rgba(255,255,255,0.1)' }}>LV.{ability.levelRequired}</span>
                                            )}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: 6 }}>{ability.description}</div>
                                        {!locked && (
                                            <div className="ppage__flex-row" style={{ fontSize: '10px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                                                <span>COOLDOWN: {ability.cooldown}</span>
                                                <span>COST: {ability.cost}</span>
                                                <span style={{ color: 'var(--text-secondary)' }}>EFFECT: {ability.effect}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </>
        );
    };

    /* ── TAB: EQUIPMENT ── */
    const renderEquipment = () => {
        const selectedItem = selectedSlot ? getEquippedItem(selectedSlot) : null;

        return (
            <>
                <div className="ppage__card" style={{ marginBottom: 16 }}>
                    <div style={{ textAlign: 'center', color: 'var(--faction-active)', marginBottom: 12, fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        ┌─────────── EQUIPMENT LOADOUT ───────────┐
                    </div>
                    {EQUIPMENT_SLOTS.map(slot => {
                        const item = getEquippedItem(slot);
                        const isSelected = selectedSlot === slot;
                        return (
                            <div key={slot} onClick={() => setSelectedSlot(isSelected ? null : slot)}
                                className={`ppage__stat-row ppage__card--interactive`}
                                style={{
                                    padding: '8px 10px', borderRadius: 8, marginBottom: 4,
                                    borderLeft: isSelected ? '3px solid var(--faction-active)' : '3px solid transparent',
                                    background: isSelected ? 'rgba(0,255,65,0.04)' : 'transparent',
                                }}>
                                <span className="ppage__stat-key">[{slot}]</span>
                                <span style={{ color: item ? RARITY_COLORS[item.rarity] : 'var(--text-muted)', fontWeight: item ? 700 : 400 }}>
                                    {item ? item.name : '(empty)'}
                                </span>
                            </div>
                        );
                    })}
                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.1)', marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                        └─────────────────────────────────────────┘
                    </div>
                </div>

                {selectedItem && (
                    <div className="ppage__card ppage__card--active">
                        <div style={{ fontSize: '14px', fontWeight: 700, color: RARITY_COLORS[selectedItem.rarity], marginBottom: 8 }}>{selectedItem.name}</div>
                        <div className="ppage__flex-row" style={{ marginBottom: 8 }}>
                            <span className="ppage__badge" style={{ color: RARITY_COLORS[selectedItem.rarity], borderColor: RARITY_COLORS[selectedItem.rarity] }}>{selectedItem.rarity}</span>
                            <span className="ppage__badge" style={{ color: 'var(--text-muted)', borderColor: 'rgba(255,255,255,0.1)' }}>{selectedItem.slot}</span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: 8, fontSize: '12px' }}>{selectedItem.description}</div>
                        {Object.keys(selectedItem.stats).length > 0 && (
                            <div className="ppage__flex-row" style={{ marginBottom: 8, flexWrap: 'wrap' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>STAT BONUSES:</span>
                                {Object.entries(selectedItem.stats).map(([stat, val]) => (
                                    <span key={stat} className="ppage__badge" style={{ color: 'var(--faction-active)', borderColor: 'rgba(0,255,65,0.2)' }}>{stat} +{val}</span>
                                ))}
                            </div>
                        )}
                        <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontStyle: 'italic', marginBottom: 4 }}>"{selectedItem.lore}"</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Source: {selectedItem.source}</div>
                    </div>
                )}
                {selectedSlot && !selectedItem && <div className="ppage__empty">No item equipped in {selectedSlot} slot.</div>}
            </>
        );
    };

    /* ── TAB: BACKSTORY ── */
    const renderBackstory = () => (
        <>
            <div style={{ marginBottom: 20 }}>
                <h3 className="ppage__section">BACKSTORY</h3>
                <textarea className="ppage__textarea" value={backstoryDraft} onChange={e => setBackstoryDraft(e.target.value.slice(0, 10000))}
                    maxLength={10000} rows={8} placeholder="Write your Architect's backstory... (max 10000 characters)" />
                <div style={{ color: 'var(--text-muted)', fontSize: '10px', textAlign: 'right', marginTop: 4 }}>{backstoryDraft.length}/10000</div>
            </div>

            <div style={{ marginBottom: 20 }}>
                <h3 className="ppage__section">ALIGNMENT</h3>
                <select className="ppage__select" value={profile.alignment} onChange={e => updateAlignment(e.target.value as Alignment)}>
                    {ALL_ALIGNMENTS.map(a => <option key={a} value={a}>{ALIGNMENT_LABELS[a]}</option>)}
                </select>
            </div>

            {renderTagField('STRENGTHS', 'strengths')}
            {renderTagField('WEAKNESSES', 'weaknesses')}
            {renderTagField('ALLIES', 'allies')}
            {renderTagField('ENEMIES', 'enemies')}

            <div style={{ marginBottom: 20 }}>
                <h3 className="ppage__section">PERSONAL MOTTO</h3>
                <input className="ppage__input" value={mottoDraft} onChange={e => setMottoDraft(e.target.value)} placeholder="Enter your motto..." maxLength={200} />
            </div>

            <div style={{ marginBottom: 20 }}>
                <h3 className="ppage__section">THEME SONG</h3>
                <input className="ppage__input" value={songDraft} onChange={e => setSongDraft(e.target.value)} placeholder="Paste a YouTube or Spotify URL..." />
                {songDraft && songDraft.includes('youtube.com') && (
                    <div style={{ marginTop: 10 }}>
                        <iframe width="100%" height="200" src={`https://www.youtube.com/embed/${songDraft.split('v=')[1]?.split('&')[0] || ''}`}
                            style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }} allow="autoplay; encrypted-media" title="Theme song preview" />
                    </div>
                )}
            </div>

            <div style={{ marginBottom: 20 }}>
                <h3 className="ppage__section">PRIVACY</h3>
                <div className="ppage__flex-row">
                    {(['public', 'faction_only', 'private'] as const).map(level => (
                        <button key={level} onClick={() => updatePrivacy(level)}
                            className={`ppage__tab ${profile.privacyLevel === level ? 'ppage__tab--active' : ''}`}>
                            [{level.replace('_', ' ')}]
                        </button>
                    ))}
                </div>
            </div>

            <button className="ppage__btn ppage__btn--primary-solid ppage__btn--full" onClick={saveBackstory}>
                ▸ SAVE DOSSIER CHANGES
            </button>
        </>
    );

    /* ── TAB: MEMORY LOG ── */
    const renderMemoryLog = () => {
        const log = profile.memoryLog || [];
        if (log.length === 0) return <div className="ppage__empty">No memory entries recorded yet. Your journey has just begun, Architect.</div>;

        return (
            <div className="ppage__flex-col">
                {log.slice().reverse().map(entry => (
                    <div key={entry.id} className="ppage__timeline-item" style={{ borderLeft: `3px solid ${EVENT_TYPE_COLORS[entry.type] || 'var(--text-muted)'}` }}>
                        <div className="ppage__timeline-date">
                            {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <span className="ppage__badge" style={{ color: EVENT_TYPE_COLORS[entry.type] || 'var(--text-muted)', borderColor: EVENT_TYPE_COLORS[entry.type] || 'var(--text-muted)', flexShrink: 0 }}>
                            {entry.type}
                        </span>
                        <div className="ppage__timeline-event">{entry.event}</div>
                    </div>
                ))}
            </div>
        );
    };

    /* ── MAIN RENDER ── */
    return (
        <div className="ppage">
            <div className="ppage__title">ARCHITECT DOSSIER</div>
            <div className="ppage__title-divider" />

            <div className="ppage__tabs">
                {(['OVERVIEW', 'ABILITIES', 'EQUIPMENT', 'BACKSTORY', 'MEMORY LOG'] as ProfileTab[]).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`ppage__tab ${activeTab === tab ? 'ppage__tab--active' : ''}`}>
                        [{tab}]
                    </button>
                ))}
            </div>

            {activeTab === 'OVERVIEW' && renderOverview()}
            {activeTab === 'ABILITIES' && renderAbilities()}
            {activeTab === 'EQUIPMENT' && renderEquipment()}
            {activeTab === 'BACKSTORY' && renderBackstory()}
            {activeTab === 'MEMORY LOG' && renderMemoryLog()}
        </div>
    );
};
