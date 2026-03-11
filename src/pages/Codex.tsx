import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import * as db from '@/services/supabaseDB';
import type { LoreEntry, Classification, JournalEntry } from '@/types';
import { isSupabaseConfigured } from '@/services/supabase';
import '@/styles/PremiumPage.css';

const CLASSIFICATIONS: Classification[] = ['FACTION_INTEL', 'SECTOR_REPORT', 'HISTORICAL_RECORD', 'ANOMALY_LOG', 'NPC_DOSSIER'];

type CodexTab = 'ARCHIVE' | 'CHRONICLE' | 'PENDING';

export const Codex: React.FC = () => {
    const { user } = useGameStore();
    const [activeTab, setActiveTab] = useState<CodexTab>('ARCHIVE');
    const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Drafting State
    const [draftTitle, setDraftTitle] = useState('');
    const [draftContent, setDraftContent] = useState('');
    const [draftClass, setDraftClass] = useState<Classification>('HISTORICAL_RECORD');
    const [draftTags, setDraftTags] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Journal Integration
    const [journals, setJournals] = useState<JournalEntry[]>([]);
    const [showJournalModal, setShowJournalModal] = useState(false);

    useEffect(() => {
        if (activeTab === 'ARCHIVE') {
            fetchLore('CANON');
        } else if (activeTab === 'PENDING') {
            fetchLore('PENDING');
        }
    }, [activeTab]);

    const fetchLore = async (status: 'CANON' | 'PENDING') => {
        setIsLoading(true);
        try {
            const entries = await db.getLoreEntries(status);
            setLoreEntries(status === 'CANON' ? entries : entries.filter(e => e.status === 'PENDING' && e.authorId === user?.id));
        } catch (err) {
            console.error("Failed to load lore:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenJournalModal = async () => {
        if (!user) return;
        const data = await db.getJournal(user.id);
        setJournals(data);
        setShowJournalModal(true);
    };

    const importJournal = (j: JournalEntry) => {
        setDraftTitle(`LOG ENTRY: ${j.title}`);
        setDraftContent(j.content);
        setShowJournalModal(false);
    };

    const submitLore = async () => {
        if (!draftTitle.trim() || !draftContent.trim() || !user || !isSupabaseConfigured) return;
        setIsSubmitting(true);
        try {
            const newEntry: Partial<LoreEntry> = {
                title: draftTitle,
                content: draftContent,
                classification: draftClass,
                tags: draftTags.split(',').map(t => t.trim()).filter(Boolean),
                authorId: user.id,
                status: 'PENDING',
                clearanceLevel: 'INITIATE',
            };
            console.log('Submitting lore to database queue:', newEntry);
            await db.submitLoreEntry(newEntry);
            alert('Lore sequence transmitted to the pending cache for review.');
            setDraftTitle('');
            setDraftContent('');
            setDraftTags('');
            setActiveTab('PENDING');
        } catch (e) {
            console.error(e);
            alert('Lore transmission failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return <div className="ppage"><div className="ppage__empty">ARCHITECT PROFILE NOT FOUND.</div></div>;
    }

    return (
        <div className="ppage">
            <div className="ppage__title">THE CODEX</div>
            <div className="ppage__title-divider" />

            <div className="ppage__tabs ppage__flex-wrap">
                {(['ARCHIVE', 'CHRONICLE', 'PENDING'] as CodexTab[]).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`ppage__tab ${activeTab === tab ? 'ppage__tab--active' : ''}`}>
                        [{tab}]
                    </button>
                ))}
            </div>

            {/* JOURNAL IMPORT MODAL */}
            {showJournalModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)'
                }}>
                    <div className="ppage__card" style={{ width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div className="ppage__flex-between" style={{ marginBottom: 16 }}>
                            <div style={{ color: 'var(--text-bright)', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>IMPORT PERSONAL JOURNAL</div>
                            <button className="ppage__btn" onClick={() => setShowJournalModal(false)}>✕</button>
                        </div>
                        {journals.length === 0 ? (
                            <div className="ppage__empty">NO JOURNAL ENTRIES FOUND.</div>
                        ) : (
                            <div className="ppage__flex-col">
                                {journals.map(j => (
                                    <div key={j.id} className="ppage__card ppage__card--interactive" onClick={() => importJournal(j)}>
                                        <div style={{ color: 'var(--text-bright)', fontSize: '13px', fontWeight: 700 }}>{j.title}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '10px', margin: '4px 0' }}>{new Date(j.createdAt).toLocaleDateString()}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.content}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'ARCHIVE' && (
                <div>
                    <h3 className="ppage__section">THE CHRONOMETER (CANONIZED LORE)</h3>
                    {isLoading ? (
                        <div className="ppage__muted">ACCESSING MAINFRAME DATABANKS...</div>
                    ) : (
                        loreEntries.length > 0 ? (
                            <div style={{ position: 'relative', paddingLeft: '24px', marginTop: '16px' }}>
                                {/* Central Timeline Axis */}
                                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '7px', width: '2px', background: 'var(--border-terminal)' }}></div>

                                {loreEntries.map(entry => (
                                    <div key={entry.id} style={{ position: 'relative', marginBottom: '32px' }}>
                                        {/* Glowing Timeline Node */}
                                        <div style={{
                                            position: 'absolute', left: '-20px', top: '16px',
                                            width: '8px', height: '8px', borderRadius: '50%',
                                            background: 'var(--accent-info)',
                                            boxShadow: '0 0 12px var(--accent-info)',
                                            zIndex: 2
                                        }}></div>

                                        <div className="ppage__card ppage__card--interactive" style={{ position: 'relative', overflow: 'hidden' }}>
                                            {/* Watermark Stamp */}
                                            <div style={{
                                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-15deg)',
                                                fontSize: '48px', fontWeight: 900, color: 'rgba(0, 255, 65, 0.03)', pointerEvents: 'none',
                                                whiteSpace: 'nowrap', textShadow: '0 0 8px rgba(0,255,65,0.05)'
                                            }}>
                                                [ OFFICIAL CANON ]
                                            </div>

                                            <div className="ppage__flex-between" style={{ marginBottom: 8, position: 'relative', zIndex: 1 }}>
                                                <div style={{ color: 'var(--faction-active)', fontWeight: 700, fontSize: '15px', textShadow: '0 0 8px rgba(0, 255, 65, 0.2)' }}>{entry.title}</div>
                                                <span className="ppage__badge" style={{ borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }}>{entry.classification}</span>
                                            </div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
                                                {entry.content}
                                            </div>
                                            <div className="ppage__flex-between" style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '10px', color: 'var(--text-muted)', position: 'relative', zIndex: 1 }}>
                                                <span>AUTHOR: {entry.authorId || 'UNKNOWN'}</span>
                                                <span style={{ color: 'var(--accent-info)' }}>DATE: {new Date(entry.createdAt).toLocaleDateString()}</span>
                                                <span>CLEARANCE: {entry.clearanceLevel}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="ppage__empty">NO CANONIZED RECORDS FOUND.</div>
                        )
                    )}
                </div>
            )}

            {activeTab === 'CHRONICLE' && (
                <div>
                    <h3 className="ppage__section">THE CHRONICLE API — NEW ENTRY</h3>
                    <div className="ppage__card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {!isSupabaseConfigured ? (
                           <div className="ppage__empty" style={{ color: 'var(--accent-warning)' }}>⚠ GRID LINK OFFLINE. LOCAL ARCHIVING UNAVAILABLE.</div>
                        ) : (
                            <>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: 4 }}>RECORD CLASSIFICATION</div>
                                    <select className="ppage__select" value={draftClass} onChange={e => setDraftClass(e.target.value as Classification)}>
                                        {CLASSIFICATIONS.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <div className="ppage__flex-between" style={{ marginBottom: 4 }}>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>DATA_HEADER (TITLE)</div>
                                        <button className="ppage__btn" style={{ fontSize: '10px', padding: '2px 8px' }} onClick={handleOpenJournalModal}>
                                            + IMPORT FROM JOURNAL
                                        </button>
                                    </div>
                                    <input className="ppage__input" value={draftTitle} onChange={e => setDraftTitle(e.target.value)} placeholder="Entry Title..." maxLength={100} />
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: 4 }}>DATA_STREAM (CONTENT)</div>
                                    <textarea className="ppage__textarea" value={draftContent} onChange={e => setDraftContent(e.target.value)} placeholder="Record your findings in the Grid..." rows={12} />
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: 4 }}>INDEX TAGS (Comma separated)</div>
                                    <input className="ppage__input" value={draftTags} onChange={e => setDraftTags(e.target.value)} placeholder="e.g. anomaly, neon_wastes, artifact" />
                                </div>

                                <button className="ppage__btn ppage__btn--primary-solid ppage__btn--full" onClick={submitLore} disabled={isSubmitting || !draftTitle.trim() || !draftContent.trim()}>
                                    {isSubmitting ? '[ TRANSMITTING ]' : '▸ TRANSMIT TO ARCHIVES'}
                                </button>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', marginTop: -4 }}>
                                    All entries undergo review by High Command or CONSTRUCT_OS before canonization.
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'PENDING' && (
                <div>
                    <h3 className="ppage__section">PENDING LORE REVIEWS</h3>
                    {isLoading ? (
                        <div className="ppage__muted">ACCESSING PENDING QUEUE...</div>
                    ) : (
                        loreEntries.length > 0 ? (
                            <div className="ppage__flex-col">
                                {loreEntries.map(entry => (
                                    <div key={entry.id} className="ppage__card" style={{ 
                                        opacity: entry.status === 'REJECTED' ? 1 : 0.7, 
                                        borderColor: entry.status === 'REJECTED' ? 'var(--accent-danger)' : 'var(--accent-warning)',
                                        position: 'relative'
                                    }}>
                                        {entry.status === 'REJECTED' && (
                                            <div style={{
                                                position: 'absolute', top: 10, right: 10,
                                                color: 'var(--accent-danger)', fontSize: '24px', fontWeight: 900,
                                                opacity: 0.1, pointerEvents: 'none', transform: 'rotate(15deg)'
                                            }}>[ DECLASSIFICATION DENIED ]</div>
                                        )}
                                        <div className="ppage__flex-between" style={{ marginBottom: 8 }}>
                                            <div style={{ color: entry.status === 'REJECTED' ? 'var(--accent-danger)' : 'var(--accent-warning)', fontWeight: 700, fontSize: '14px' }}>{entry.title}</div>
                                            <span className="ppage__badge" style={{ color: entry.status === 'REJECTED' ? 'var(--accent-danger)' : 'var(--accent-warning)', borderColor: entry.status === 'REJECTED' ? 'var(--accent-danger)' : 'var(--accent-warning)' }}>
                                                {entry.status === 'REJECTED' ? 'REJECTED BY HIGH COMMAND' : 'AWAITING VERIFICATION'}
                                            </span>
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                                            {entry.content}
                                        </div>
                                        {entry.moderatorNotes && (
                                            <div style={{ marginTop: 12, paddingThop: 8, borderTop: '1px solid rgba(255,0,0,0.2)', color: 'var(--accent-danger)', fontSize: '11px' }}>
                                                <strong>MODERATOR NOTE:</strong> {entry.moderatorNotes}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="ppage__empty">NO PENDING ENTRIES OR INSUFFICIENT CLEARANCE.</div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};
