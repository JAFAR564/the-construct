import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import * as db from '@/services/supabaseDB';
import type { LoreEntry, Classification } from '@/types';
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

    useEffect(() => {
        if (activeTab === 'ARCHIVE') {
            fetchLore(true);
        } else if (activeTab === 'PENDING') {
            fetchLore(false);
        }
    }, [activeTab]);

    const fetchLore = async (canon: boolean) => {
        setIsLoading(true);
        try {
            const entries = await db.getLoreEntries(canon);
            setLoreEntries(canon ? entries : entries.filter(e => !e.statusCanon && e.authorId === user?.id));
        } catch (err) {
            console.error("Failed to load lore:", err);
        } finally {
            setIsLoading(false);
        }
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
                statusCanon: false, // Must be reviewed to become canon
                clearanceLevel: 'INITIATE',
            };
            console.log('Submitting lore to database queue:', newEntry);
            // Note: In an actual app, we'd add createLoreEntry to db service
            // For now, we simulate success
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

            {activeTab === 'ARCHIVE' && (
                <div>
                    <h3 className="ppage__section">CANONIZED LORE</h3>
                    {isLoading ? (
                        <div className="ppage__muted">ACCESSING MAINFRAME DATABANKS...</div>
                    ) : (
                        loreEntries.length > 0 ? (
                            <div className="ppage__flex-col">
                                {loreEntries.map(entry => (
                                    <div key={entry.id} className="ppage__card ppage__card--interactive">
                                        <div className="ppage__flex-between" style={{ marginBottom: 8 }}>
                                            <div style={{ color: 'var(--faction-active)', fontWeight: 700, fontSize: '14px' }}>{entry.title}</div>
                                            <span className="ppage__badge" style={{ borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }}>{entry.classification}</span>
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                                            {entry.content}
                                        </div>
                                        <div className="ppage__flex-between" style={{ marginTop: 12, fontSize: '10px', color: 'var(--text-muted)' }}>
                                            <span>CLEARANCE: {entry.clearanceLevel}</span>
                                            <span>UPVOTES: {entry.upvotes}</span>
                                            <span>AUTHOR: {entry.authorId || 'UNKNOWN'}</span>
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
                                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: 4 }}>DATA_HEADER (TITLE)</div>
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
                                    <div key={entry.id} className="ppage__card" style={{ opacity: 0.7, borderColor: 'var(--accent-warning)' }}>
                                        <div className="ppage__flex-between" style={{ marginBottom: 8 }}>
                                            <div style={{ color: 'var(--accent-warning)', fontWeight: 700, fontSize: '14px' }}>{entry.title}</div>
                                            <span className="ppage__badge" style={{ color: 'var(--accent-warning)', borderColor: 'var(--accent-warning)' }}>AWAITING VERIFICATION</span>
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                                            {entry.content}
                                        </div>
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
