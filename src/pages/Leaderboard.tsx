import React, { useEffect, useState } from 'react';
import { useFactionStore } from '@/stores/useFactionStore';
import { useGameStore } from '@/stores/useGameStore';
import { TerminalCard } from '@/components/ui/TerminalCard';
import { FACTIONS } from '@/constants/factions';
import type { LeaderboardEntry } from '@/types';

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
            mock.push({
                rank: 42,
                designation: user.designation || 'UNKNOWN',
                faction: user.faction || 'TECHNOCRATS',
                playerRank: user.rank || 'INITIATE',
                prestige: user.prestige || 0,
                isCurrentUser: true
            });
        }
        setEntries(mock);
    }, [fetchFactionData, user]);

    const safeFactionStatuses = Array.isArray(factionStatuses) ? factionStatuses : [];
    const maxPower = safeFactionStatuses.length > 0
        ? Math.max(...safeFactionStatuses.map(f => f?.totalPower || 0))
        : 1000;

    return (
        <TerminalCard title="POWER RANKINGS">
            <div style={{ marginBottom: 32 }}>
                <h3 style={{ color: 'var(--text-secondary)', marginBottom: 16, borderBottom: '1px dashed var(--border-terminal)', paddingBottom: 4 }}>FACTION DOMINANCE</h3>
                {safeFactionStatuses.length > 0 ? (
                    safeFactionStatuses.map(f => {
                        if (!f) return null;
                        const fd = FACTIONS.find(x => x.id === f.faction);
                        const color = fd ? fd.color : 'var(--text-primary)';
                        const power = f.totalPower || 0;
                        const pct = (power / maxPower) * 100;
                        return (
                            <div key={f.faction || 'unknown'} style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 4 }}>
                                    <span style={{ color }}>{fd?.name || f.faction || 'UNKNOWN FACTION'}</span>
                                    <span>{power.toLocaleString()} PWR</span>
                                </div>
                                <div style={{ height: 8, backgroundColor: 'var(--bg-elevated)' }}>
                                    <div style={{ width: `${pct}%`, backgroundColor: color, height: '100%' }} />
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ color: 'var(--text-muted)' }}>SIMULATED DATA — GRID LINK PENDING</div>
                )}
            </div>

            <div style={{ marginBottom: 32 }}>
                <h3 style={{ color: 'var(--text-secondary)', marginBottom: 16, borderBottom: '1px dashed var(--border-terminal)', paddingBottom: 4 }}>TOP ARCHITECTS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {(entries || []).map(e => {
                        if (!e) return null;
                        const fd = FACTIONS.find(x => x.id === e.faction);
                        const color = fd ? fd.color : 'var(--text-primary)';
                        return (
                            <div key={e.rank || Math.random()} style={{ display: 'flex', alignItems: 'center', backgroundColor: e.isCurrentUser ? 'var(--faction-active)' : 'transparent', color: e.isCurrentUser ? 'inherit' : 'inherit', padding: '4px 8px' }}>
                                <div style={{ width: 40, fontWeight: 'bold' }}>#{e.rank || '?'}</div>
                                <div style={{ flex: 1 }}>{e.designation || 'UNKNOWN'} <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>({e.playerRank || 'UNRANKED'})</span></div>
                                <div style={{ color: e.isCurrentUser ? 'inherit' : color, width: 40, textAlign: 'center' }}>{(e.faction || '??').substring(0, 2)}</div>
                                <div style={{ width: 80, textAlign: 'right' }}>{e.prestige || 0}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div>
                <h3 style={{ color: 'var(--text-secondary)', marginBottom: 16, borderBottom: '1px dashed var(--border-terminal)', paddingBottom: 4 }}>WEEKLY WAR STATUS</h3>
                <div style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>T-MINUS: {warTimeRemaining || 'UNKNOWN'}</div>
            </div>
        </TerminalCard>
    );
};
