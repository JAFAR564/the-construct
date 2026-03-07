import React, { useEffect, useState } from 'react';
import { useFactionStore } from '@/stores/useFactionStore';
import { useGameStore } from '@/stores/useGameStore';
import { FACTIONS } from '@/constants/factions';
import type { LeaderboardEntry } from '@/types';
import '@/styles/PremiumPage.css';

export const Leaderboard: React.FC = () => {
    const { factionStatuses, fetchFactionData, warTimeRemaining } = useFactionStore();
    const user = useGameStore(state => state.user);
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        fetchFactionData();
        const mock: LeaderboardEntry[] = [
            { rank: 1, designation: 'CYPHER_0X', faction: 'TECHNOCRATS', playerRank: 'SOVEREIGN', prestige: 142050, isCurrentUser: false },
            { rank: 2, designation: 'VOIDWALKER', faction: 'KEEPERS_OF_THE_VEIL', playerRank: 'OVERLORD', prestige: 89000, isCurrentUser: false },
            { rank: 3, designation: 'RUST_HOUND', faction: 'IRONBORN_COLLECTIVE', playerRank: 'COMMANDER', prestige: 45200, isCurrentUser: false },
        ];
        if (user) {
            mock.push({ rank: 42, designation: user.designation || 'UNKNOWN', faction: user.faction || 'TECHNOCRATS', playerRank: user.rank || 'INITIATE', prestige: user.prestige || 0, isCurrentUser: true });
        }
        setEntries(mock);
    }, [fetchFactionData, user]);

    const safeFactionStatuses = Array.isArray(factionStatuses) ? factionStatuses : [];
    const maxPower = safeFactionStatuses.length > 0 ? Math.max(...safeFactionStatuses.map(f => f?.totalPower || 0)) : 1000;

    return (
        <div className="ppage">
            <div className="ppage__title">POWER RANKINGS</div>
            <div className="ppage__title-divider" />

            {/* Faction Dominance */}
            <div style={{ marginBottom: 32 }}>
                <h3 className="ppage__section">FACTION DOMINANCE</h3>
                {safeFactionStatuses.length > 0 ? (
                    <div className="ppage__flex-col">
                        {safeFactionStatuses.map(f => {
                            if (!f) return null;
                            const fd = FACTIONS.find(x => x.id === f.faction);
                            const color = fd ? fd.color : 'var(--text-primary)';
                            const power = f.totalPower || 0;
                            const pct = (power / maxPower) * 100;
                            return (
                                <div key={f.faction || 'unknown'} className="ppage__card" style={{ padding: '12px 14px' }}>
                                    <div className="ppage__flex-between" style={{ marginBottom: 6 }}>
                                        <span style={{ color, fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-ui)' }}>{fd?.name || f.faction || 'UNKNOWN'}</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-bright)' }}>{power.toLocaleString()} PWR</span>
                                    </div>
                                    <div className="ppage__power-track">
                                        <div className="ppage__power-fill" style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="ppage__muted">SIMULATED DATA — GRID LINK PENDING</div>
                )}
            </div>

            {/* Top Architects */}
            <div style={{ marginBottom: 32 }}>
                <h3 className="ppage__section">TOP ARCHITECTS</h3>
                <div className="ppage__flex-col ppage__gap-sm">
                    {(entries || []).map(e => {
                        if (!e) return null;
                        const fd = FACTIONS.find(x => x.id === e.faction);
                        const color = fd ? fd.color : 'var(--text-primary)';
                        return (
                            <div key={e.rank || Math.random()} className={`ppage__rank-row ${e.isCurrentUser ? 'ppage__rank-row--self' : ''}`}>
                                <div className="ppage__rank-num">#{e.rank || '?'}</div>
                                <div className="ppage__rank-name">
                                    {e.designation || 'UNKNOWN'}
                                    <span className="ppage__rank-sub">({e.playerRank || 'UNRANKED'})</span>
                                </div>
                                <div className="ppage__rank-faction" style={{ color }}>{(e.faction || '??').substring(0, 2)}</div>
                                <div className="ppage__rank-score">{e.prestige || 0}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Weekly War */}
            <div>
                <h3 className="ppage__section">WEEKLY WAR STATUS</h3>
                <div className="ppage__war-timer">T-MINUS: {warTimeRemaining || 'UNKNOWN'}</div>
            </div>
        </div>
    );
};
