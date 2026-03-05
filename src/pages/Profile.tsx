import React, { useState, useRef } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { TerminalCard } from '@/components/ui/TerminalCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FACTIONS } from '@/constants/factions';
import { DEFAULT_ABILITIES } from '@/constants/abilities';
import { compressImage } from '@/utils/imageCompressor';
import type { Equipment, Ability, EquipmentSlot, Alignment, Rarity } from '@/types';

type ProfileTab = 'OVERVIEW' | 'ABILITIES' | 'EQUIPMENT' | 'BACKSTORY' | 'MEMORY LOG';

const ALIGNMENT_LABELS: Record<Alignment, string> = {
    LAWFUL_GOOD: 'Lawful Good',
    NEUTRAL_GOOD: 'Neutral Good',
    CHAOTIC_GOOD: 'Chaotic Good',
    LAWFUL_NEUTRAL: 'Lawful Neutral',
    TRUE_NEUTRAL: 'True Neutral',
    CHAOTIC_NEUTRAL: 'Chaotic Neutral',
    LAWFUL_EVIL: 'Lawful Evil',
    NEUTRAL_EVIL: 'Neutral Evil',
    CHAOTIC_EVIL: 'Chaotic Evil',
};

const RARITY_COLORS: Record<Rarity, string> = {
    COMMON: '#AAAAAA',
    UNCOMMON: '#00FF41',
    RARE: '#00D4FF',
    EPIC: '#9B59B6',
    LEGENDARY: '#FFD700',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
    quest: '#00D4FF',
    combat: '#FF3333',
    discovery: '#00FF41',
    social: '#9B59B6',
    achievement: '#FFD700',
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
        return (
            <TerminalCard title="SYSTEM ERROR">
                <div style={{ color: 'var(--accent-danger)' }}>
                    ARCHITECT PROFILE NOT FOUND. Please re-authenticate.
                </div>
            </TerminalCard>
        );
    }

    // Initialize drafts from user data on first render
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
        updateUser({
            characterProfile: {
                ...profile,
                backstory: backstoryDraft,
                personalMotto: mottoDraft,
                themeSong: songDraft,
            }
        });
    };

    const updateAlignment = (alignment: Alignment) => {
        updateUser({ characterProfile: { ...profile, alignment } });
    };

    const updatePrivacy = (privacyLevel: 'public' | 'faction_only' | 'private') => {
        updateUser({ characterProfile: { ...profile, privacyLevel } });
    };

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

    // Shared styles
    const sectionHeading: React.CSSProperties = {
        color: 'var(--text-secondary)', marginBottom: 8,
        borderBottom: '1px dashed var(--border-terminal)', paddingBottom: 4, fontSize: '0.9rem',
    };

    const tabBtn = (tab: ProfileTab): React.CSSProperties => ({
        background: activeTab === tab ? 'var(--faction-active)' : 'transparent',
        color: activeTab === tab ? 'var(--bg-dark)' : 'var(--text-muted)',
        border: `1px solid ${activeTab === tab ? 'var(--faction-active)' : 'var(--border-terminal)'}`,
        padding: '6px 10px', fontFamily: 'var(--font-mono)', fontSize: '11px',
        cursor: 'pointer', textTransform: 'uppercase',
    });

    const tagStyle: React.CSSProperties = {
        display: 'inline-block', padding: '2px 8px', marginRight: 4, marginBottom: 4,
        border: '1px solid var(--border-terminal)', color: 'var(--text-secondary)',
        fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer',
    };

    const inputStyle: React.CSSProperties = {
        background: 'var(--bg-dark)', border: '1px solid var(--border-terminal)',
        color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '12px',
        padding: '6px 8px', width: '100%', outline: 'none',
    };

    // ====== TAB PANELS ======

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
            // Reset input so re-selecting the same file triggers onChange
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAvatarDelete = () => {
        updateUser({ avatarDataUrl: undefined });
    };

    const avatarBtnStyle: React.CSSProperties = {
        background: 'transparent', border: '1px solid var(--faction-active)',
        color: 'var(--faction-active)', fontFamily: 'var(--font-mono)', fontSize: '9px',
        cursor: 'pointer', padding: '3px 8px', textTransform: 'uppercase',
    };
    const avatarBtnDangerStyle: React.CSSProperties = {
        ...avatarBtnStyle, borderColor: 'var(--accent-danger)', color: 'var(--accent-danger)',
    };

    const renderOverview = () => (
        <>
            {/* Hidden file input for avatar uploads */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarUpload}
            />

            <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                {/* Avatar area */}
                <div style={{
                    border: `1px solid var(--faction-active)`, padding: 12, minWidth: 140, maxWidth: 160,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                    {user.avatarDataUrl ? (
                        <>
                            <img
                                src={user.avatarDataUrl}
                                alt={user.designation}
                                style={{
                                    width: 120, height: 120, objectFit: 'cover',
                                    border: '1px solid var(--faction-active)',
                                    boxShadow: '0 0 8px var(--faction-active), 0 0 16px rgba(0,255,65,0.15)',
                                    imageRendering: 'auto',
                                }}
                            />
                            <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                                <button
                                    style={avatarBtnStyle}
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={avatarUploading}
                                >
                                    [CHANGE]
                                </button>
                                <button
                                    style={avatarBtnDangerStyle}
                                    onClick={handleAvatarDelete}
                                    disabled={avatarUploading}
                                >
                                    [DELETE]
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <pre style={{ fontSize: '0.55rem', color: 'var(--faction-active)', lineHeight: 1.2, margin: 0 }}>{
                                `    ╔══════╗
    ║ ◉  ◉ ║
    ║  ──  ║
    ║ ╲__╱ ║
    ╚══════╝
    ╔══════╗
    ║      ║
    ║      ║
    ╚══╤╤══╝
      ││`
                            }</pre>
                            <button
                                style={{ ...avatarBtnStyle, marginTop: 8 }}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={avatarUploading}
                            >
                                {avatarUploading ? '[PROCESSING...]' : '[UPLOAD AVATAR]'}
                            </button>
                        </>
                    )}
                    <div style={{ marginTop: 6, fontSize: '10px', color: 'var(--faction-active)', textAlign: 'center', wordBreak: 'break-all' }}>
                        {user.designation}
                    </div>
                </div>
                {/* Info panel */}
                <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ fontSize: '1.2rem', color: 'var(--faction-active)', fontWeight: 'bold' }}>
                        {user.designation || 'UNKNOWN'}
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: 12, fontSize: '11px' }}>
                        ID: {user.id?.split('-')[0] || '???'}
                    </div>
                    <div>RANK: <span style={{ color: 'var(--text-primary)' }}>{user.rank || 'UNRANKED'}</span></div>
                    <div>LEVEL: <span style={{ color: 'var(--faction-active)' }}>{user.level || 1}</span></div>
                    <div>FACTION: <span style={{ color: 'var(--faction-active)' }}>{factionData?.name || 'UNALIGNED'}</span></div>
                    <div>SECTOR: S-{String(user.currentSector ?? 0).padStart(2, '0')}</div>
                    <div>PRESTIGE: {user.prestige || 0}</div>
                    <div>ALIGNMENT: <span style={{ color: 'var(--text-secondary)' }}>{ALIGNMENT_LABELS[profile.alignment] || 'Unknown'}</span></div>
                    <div style={{ marginTop: 8 }}>
                        <ProgressBar label="XP" current={user.xp || 0} max={user.xpToNextRank || 100} color="var(--faction-active)" />
                    </div>
                </div>
            </div>

            {/* Core Skills */}
            <div style={{ marginBottom: 24 }}>
                <h3 style={sectionHeading}>CORE SKILLS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: 500 }}>
                    {Object.entries(user.skills || {}).map(([skill, value]) => (
                        <ProgressBar key={skill} label={skill} current={value as number} max={100} color="var(--faction-active)" showValue />
                    ))}
                </div>
            </div>

            {/* Elemental Affinity */}
            <div style={{ marginBottom: 24 }}>
                <h3 style={sectionHeading}>ELEMENTAL AFFINITY</h3>
                <div>PRIMARY: <span style={{ color: 'var(--faction-active)' }}>{user.primaryElement || 'NONE'}</span></div>
                <div>SECONDARY: <span style={{ color: 'var(--text-secondary)' }}>{user.secondaryElement || 'NONE'}</span></div>
            </div>

            {/* Titles */}
            <div>
                <h3 style={sectionHeading}>TITLES</h3>
                {user.titles && user.titles.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {user.titles.map((t, i) => (
                            <span key={i} style={{ ...tagStyle, color: 'var(--faction-active)', borderColor: 'var(--faction-active)' }}>◆ {t}</span>
                        ))}
                    </div>
                ) : (
                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No titles earned yet.</div>
                )}
            </div>
        </>
    );

    const renderAbilities = () => {
        const categories: Record<string, Ability[]> = { OFFENSIVE: [], DEFENSIVE: [], UTILITY: [], PASSIVE: [] };
        abilities.forEach(a => {
            if (categories[a.category]) categories[a.category].push(a);
        });

        return (
            <>
                {Object.entries(categories).map(([cat, items]) => items.length > 0 && (
                    <div key={cat} style={{ marginBottom: 20 }}>
                        <h3 style={sectionHeading}>▸ {cat}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {items.map(ability => {
                                const locked = !ability.unlocked && (user.level || 1) < ability.levelRequired;
                                return (
                                    <div key={ability.id} style={{
                                        border: `1px solid ${locked ? 'var(--border-terminal)' : 'var(--faction-active)'}`,
                                        padding: 12, opacity: locked ? 0.4 : 1, backgroundColor: 'var(--bg-surface)',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                            <span style={{ color: locked ? 'var(--text-muted)' : 'var(--faction-active)', fontWeight: 'bold', fontSize: '13px' }}>
                                                {ability.name}
                                            </span>
                                            {locked ? (
                                                <span style={{ fontSize: '10px', color: 'var(--accent-warning)' }}>REQUIRES LEVEL {ability.levelRequired}</span>
                                            ) : (
                                                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>LV.{ability.levelRequired}</span>
                                            )}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: 6 }}>{ability.description}</div>
                                        {!locked && (
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
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

    const renderEquipment = () => {
        const selectedItem = selectedSlot ? getEquippedItem(selectedSlot) : null;

        return (
            <>
                <div style={{
                    border: '1px solid var(--border-terminal)', padding: 16, marginBottom: 16,
                    fontFamily: 'var(--font-mono)', fontSize: '12px',
                }}>
                    <div style={{ textAlign: 'center', color: 'var(--faction-active)', marginBottom: 12, fontSize: '13px', fontWeight: 'bold' }}>
                        ┌─────────── EQUIPMENT LOADOUT ───────────┐
                    </div>
                    {EQUIPMENT_SLOTS.map(slot => {
                        const item = getEquippedItem(slot);
                        const isSelected = selectedSlot === slot;
                        return (
                            <div
                                key={slot}
                                onClick={() => setSelectedSlot(isSelected ? null : slot)}
                                style={{
                                    display: 'flex', justifyContent: 'space-between', padding: '6px 8px',
                                    cursor: 'pointer', borderLeft: isSelected ? '2px solid var(--faction-active)' : '2px solid transparent',
                                    backgroundColor: isSelected ? 'var(--bg-elevated)' : 'transparent',
                                }}
                            >
                                <span style={{ color: 'var(--text-muted)', minWidth: 100 }}>[{slot}]</span>
                                <span style={{
                                    color: item ? RARITY_COLORS[item.rarity] : 'var(--text-muted)',
                                    flex: 1, textAlign: 'right',
                                }}>
                                    {item ? item.name : '(empty)'}
                                </span>
                            </div>
                        );
                    })}
                    <div style={{ textAlign: 'center', color: 'var(--border-terminal)', marginTop: 12 }}>
                        └─────────────────────────────────────────┘
                    </div>
                </div>

                {/* Item detail panel */}
                {selectedItem && (
                    <TerminalCard title={selectedItem.name}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                            <span style={{ color: RARITY_COLORS[selectedItem.rarity], fontSize: '11px', border: `1px solid ${RARITY_COLORS[selectedItem.rarity]}`, padding: '1px 6px' }}>
                                {selectedItem.rarity}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{selectedItem.slot}</span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: 8, fontSize: '12px' }}>{selectedItem.description}</div>
                        {Object.keys(selectedItem.stats).length > 0 && (
                            <div style={{ marginBottom: 8 }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>STAT BONUSES: </span>
                                {Object.entries(selectedItem.stats).map(([stat, val]) => (
                                    <span key={stat} style={{ color: 'var(--faction-active)', fontSize: '11px', marginRight: 8 }}>
                                        {stat} +{val}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontStyle: 'italic', marginBottom: 4 }}>"{selectedItem.lore}"</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Source: {selectedItem.source}</div>
                    </TerminalCard>
                )}

                {selectedSlot && !selectedItem && (
                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: 16, textAlign: 'center' }}>
                        No item equipped in {selectedSlot} slot.
                    </div>
                )}
            </>
        );
    };

    const renderTagField = (label: string, field: 'strengths' | 'weaknesses' | 'allies' | 'enemies') => (
        <div style={{ marginBottom: 16 }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: 4 }}>{label}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                {(profile[field] || []).map((tag, i) => (
                    <span key={i} style={tagStyle} onClick={() => removeTag(field, i)} title="Click to remove">
                        {tag} ✕
                    </span>
                ))}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
                <input
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder={`Add ${label.toLowerCase()}...`}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addTag(field); }}
                />
                <button onClick={() => addTag(field)} style={{
                    ...inputStyle, width: 'auto', cursor: 'pointer', color: 'var(--faction-active)',
                    border: '1px solid var(--faction-active)',
                }}>[+]</button>
            </div>
        </div>
    );

    const renderBackstory = () => (
        <>
            {/* Backstory textarea */}
            <div style={{ marginBottom: 20 }}>
                <h3 style={sectionHeading}>BACKSTORY</h3>
                <textarea
                    value={backstoryDraft}
                    onChange={e => setBackstoryDraft(e.target.value.slice(0, 10000))}
                    maxLength={10000}
                    rows={8}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                    placeholder="Write your Architect's backstory... (max 10000 characters)"
                />
                <div style={{ color: 'var(--text-muted)', fontSize: '10px', textAlign: 'right' }}>
                    {backstoryDraft.length}/10000
                </div>
            </div>

            {/* Alignment */}
            <div style={{ marginBottom: 20 }}>
                <h3 style={sectionHeading}>ALIGNMENT</h3>
                <select
                    value={profile.alignment}
                    onChange={e => updateAlignment(e.target.value as Alignment)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                >
                    {ALL_ALIGNMENTS.map(a => <option key={a} value={a}>{ALIGNMENT_LABELS[a]}</option>)}
                </select>
            </div>

            {/* Tag fields */}
            {renderTagField('STRENGTHS', 'strengths')}
            {renderTagField('WEAKNESSES', 'weaknesses')}
            {renderTagField('ALLIES', 'allies')}
            {renderTagField('ENEMIES', 'enemies')}

            {/* Motto */}
            <div style={{ marginBottom: 20 }}>
                <h3 style={sectionHeading}>PERSONAL MOTTO</h3>
                <input
                    style={inputStyle}
                    value={mottoDraft}
                    onChange={e => setMottoDraft(e.target.value)}
                    placeholder="Enter your motto..."
                    maxLength={200}
                />
            </div>

            {/* Theme Song */}
            <div style={{ marginBottom: 20 }}>
                <h3 style={sectionHeading}>THEME SONG</h3>
                <input
                    style={inputStyle}
                    value={songDraft}
                    onChange={e => setSongDraft(e.target.value)}
                    placeholder="Paste a YouTube or Spotify URL..."
                />
                {songDraft && songDraft.includes('youtube.com') && (
                    <div style={{ marginTop: 8 }}>
                        <iframe
                            width="100%" height="200"
                            src={`https://www.youtube.com/embed/${songDraft.split('v=')[1]?.split('&')[0] || ''}`}
                            style={{ border: '1px solid var(--border-terminal)' }}
                            allow="autoplay; encrypted-media"
                            title="Theme song preview"
                        />
                    </div>
                )}
            </div>

            {/* Privacy Level */}
            <div style={{ marginBottom: 20 }}>
                <h3 style={sectionHeading}>PRIVACY</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                    {(['public', 'faction_only', 'private'] as const).map(level => (
                        <button
                            key={level}
                            onClick={() => updatePrivacy(level)}
                            style={{
                                background: profile.privacyLevel === level ? 'var(--faction-active)' : 'transparent',
                                color: profile.privacyLevel === level ? 'var(--bg-dark)' : 'var(--text-muted)',
                                border: `1px solid ${profile.privacyLevel === level ? 'var(--faction-active)' : 'var(--border-terminal)'}`,
                                padding: '6px 12px', fontFamily: 'var(--font-mono)', fontSize: '11px',
                                cursor: 'pointer', textTransform: 'uppercase',
                            }}
                        >
                            [{level.replace('_', ' ')}]
                        </button>
                    ))}
                </div>
            </div>

            {/* Save button */}
            <button onClick={saveBackstory} style={{
                background: 'var(--faction-active)', color: 'var(--bg-dark)',
                border: 'none', padding: '10px 24px', fontFamily: 'var(--font-mono)',
                fontSize: '13px', cursor: 'pointer', fontWeight: 'bold', width: '100%',
            }}>
                ▸ SAVE DOSSIER CHANGES
            </button>
        </>
    );

    const renderMemoryLog = () => {
        const log = profile.memoryLog || [];

        if (log.length === 0) {
            return (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 32, fontStyle: 'italic' }}>
                    No memory entries recorded yet. Your journey has just begun, Architect.
                </div>
            );
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {log.slice().reverse().map(entry => (
                    <div key={entry.id} style={{
                        display: 'flex', gap: 12, padding: '8px 10px', alignItems: 'flex-start',
                        borderLeft: `2px solid ${EVENT_TYPE_COLORS[entry.type] || 'var(--text-muted)'}`,
                        backgroundColor: 'var(--bg-surface)',
                    }}>
                        <div style={{ minWidth: 70, fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>
                            {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <span style={{
                            fontSize: '9px', padding: '1px 6px', textTransform: 'uppercase', flexShrink: 0,
                            color: EVENT_TYPE_COLORS[entry.type] || 'var(--text-muted)',
                            border: `1px solid ${EVENT_TYPE_COLORS[entry.type] || 'var(--text-muted)'}`,
                        }}>
                            {entry.type}
                        </span>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px', flex: 1 }}>
                            {entry.event}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <TerminalCard title="ARCHITECT DOSSIER">
            {/* Tab bar */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
                {(['OVERVIEW', 'ABILITIES', 'EQUIPMENT', 'BACKSTORY', 'MEMORY LOG'] as ProfileTab[]).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={tabBtn(tab)}>
                        [{tab}]
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'OVERVIEW' && renderOverview()}
            {activeTab === 'ABILITIES' && renderAbilities()}
            {activeTab === 'EQUIPMENT' && renderEquipment()}
            {activeTab === 'BACKSTORY' && renderBackstory()}
            {activeTab === 'MEMORY LOG' && renderMemoryLog()}
        </TerminalCard>
    );
};
