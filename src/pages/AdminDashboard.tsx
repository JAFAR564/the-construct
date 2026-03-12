import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import * as db from '@/services/supabaseDB';
import type { AuditLog, UserRole } from '@/types';
import '@/styles/PremiumPage.css';

export const AdminDashboard: React.FC = () => {
    const user = useGameStore(state => state.user);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [targetUserId, setTargetUserId] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole>('PLAYER');
    const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
    
    // Hardcoded discrete permission flags
    const AVAILABLE_FLAGS = [
        'USER_WARN', 'USER_MUTE', 'USER_BAN', 'READ_ALL_CHATS',
        'TRIGGER_EVENT', 'GRANT_QUEST', 'MODIFY_SECTOR', 'GRANT_TITLE',
        'GRANT_XP', 'GRANT_ITEM', 'MODIFY_STATS'
    ];

    const loadAuditLogs = useCallback(async () => {
        const logs = await db.getAuditLogs(50);
        setAuditLogs(logs);
    }, []);

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadAuditLogs();
        }
    }, [user, loadAuditLogs]);

    const handleElevate = async () => {
        if (!targetUserId) return;
        setLoading(true);
        const success = await db.updateUserRole(targetUserId, selectedRole, selectedFlags);
        if (success) {
            await db.addAuditLog(user!.id, 'STAFF_ELEVATION', { targetRole: selectedRole, flags: selectedFlags }, targetUserId);
            alert(`User ${targetUserId} successfully elevated to ${selectedRole}.`);
            setTargetUserId('');
            setSelectedFlags([]);
            setSelectedRole('PLAYER');
            loadAuditLogs();
        } else {
            alert('Elevation failed. Check console for details.');
        }
        setLoading(false);
    };

    const toggleFlag = (flag: string) => {
        setSelectedFlags(prev => prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]);
    };

    if (user?.role !== 'ADMIN') {
        return <div style={{ color: 'var(--accent-danger)', padding: 20, fontFamily: 'var(--font-mono)' }}>[ACCESS_DENIED]</div>;
    }

    return (
        <div className="ppage">
            <div className="ppage__title" style={{ color: 'var(--accent-warning)' }}>[SYS_ADMIN_OVERSIGHT]</div>
            <div className="ppage__title-divider" style={{ background: 'var(--accent-warning)' }} />

            <div className="ppage__flex-col ppage__gap-lg">
                {/* Staff Manager */}
                <div className="ppage__setting">
                    <div className="ppage__setting-label" style={{ color: 'var(--accent-warning)' }}>STAFF ELEVATION PROTOCOL</div>
                    <div className="ppage__setting-desc" style={{ marginBottom: 12 }}>Promote standard users to Moderator status and assign discrete permission flags.</div>
                    
                    <div className="ppage__card" style={{ background: 'rgba(0,0,0,0.3)', padding: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) auto', gap: 12, marginBottom: 16 }}>
                            <input 
                                className="ppage__input" 
                                placeholder="Target User ID (UUID)" 
                                value={targetUserId} 
                                onChange={(e) => setTargetUserId(e.target.value)} 
                            />
                            <select 
                                className="ppage__input" 
                                value={selectedRole} 
                                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                            >
                                <option value="PLAYER">PLAYER (Demote)</option>
                                <option value="MODERATOR">MODERATOR</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                        </div>
                        
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 8 }}>PERMISSION FLAGS:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                            {AVAILABLE_FLAGS.map(flag => (
                                <button 
                                    key={flag}
                                    onClick={() => toggleFlag(flag)}
                                    style={{
                                        background: selectedFlags.includes(flag) ? 'var(--accent-info)' : 'transparent',
                                        color: selectedFlags.includes(flag) ? '#000' : 'var(--text-muted)',
                                        border: `1px solid ${selectedFlags.includes(flag) ? 'var(--accent-info)' : 'rgba(255,255,255,0.2)'}`,
                                        padding: '4px 8px',
                                        fontSize: '10px',
                                        fontFamily: 'var(--font-mono)',
                                        cursor: 'pointer',
                                        borderRadius: 2
                                    }}
                                >
                                    {flag}
                                </button>
                            ))}
                        </div>

                        <button 
                            className="ppage__btn" 
                            style={{ borderColor: 'var(--accent-warning)', color: 'var(--accent-warning)' }}
                            onClick={handleElevate}
                            disabled={loading || !targetUserId}
                        >
                            {loading ? 'EXECUTING...' : 'CONFIRM ELEVATION'}
                        </button>
                    </div>
                </div>

                {/* Audit Log Table */}
                <div className="ppage__setting">
                    <div className="ppage__setting-label" style={{ color: 'var(--text-bright)' }}>GLOBAL AUDIT LOG</div>
                    <div className="ppage__setting-desc" style={{ marginBottom: 12 }}>Append-only ledger of all oversight operations.</div>
                    
                    <div className="ppage__card" style={{ background: 'rgba(0,0,0,0.3)', overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '11px', fontFamily: 'var(--font-mono)', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>TIMESTAMP</th>
                                    <th style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>ACTOR</th>
                                    <th style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>ACTION</th>
                                    <th style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>TARGET</th>
                                    <th style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>DETAILS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '16px 4px', textAlign: 'center', color: 'var(--text-muted)' }}>No logs strictly recorded.</td>
                                    </tr>
                                ) : auditLogs.map(log => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '8px 4px', color: 'var(--text-bright)', whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString()}</td>
                                        <td style={{ padding: '8px 4px', color: 'var(--accent-warning)' }}>{log.actorId.substring(0,8)}...</td>
                                        <td style={{ padding: '8px 4px' }}>{log.actionType}</td>
                                        <td style={{ padding: '8px 4px', color: 'var(--accent-info)' }}>{log.targetId ? log.targetId.substring(0,8) + '...' : '-'}</td>
                                        <td style={{ padding: '8px 4px', color: 'var(--text-muted)', fontSize: '10px' }}>{JSON.stringify(log.details)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
