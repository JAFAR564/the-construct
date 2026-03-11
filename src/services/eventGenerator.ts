import type { WorldEvent, EventType } from '@/types';

// Predefined fallback events for when AI is unavailable or offline
const FALLBACK_EVENTS = [
    {
        title: 'Quantum Resonance Cascade',
        description: 'A massive energy spike has destabilized the local grid. Communications are spotty and automated defenses are acting erratic.',
        threatLevel: 7,
        eventType: 'ANOMALY' as EventType,
    },
    {
        title: 'Technocrat Data Purge',
        description: 'The Technocrats have initiated a sector-wide data purge to eliminate a rogue AI. Collateral damage is expected.',
        threatLevel: 6,
        eventType: 'FACTION_WAR' as EventType,
    },
    {
        title: 'Ironborn Forge Ignition',
        description: 'The Ironborn Collective has fired up an ancient subterranean forge. The resulting seismic activity is disrupting travel.',
        threatLevel: 5,
        eventType: 'FACTION_WAR' as EventType,
    },
    {
        title: 'Veil Rupture',
        description: 'The Keepers of the Veil have lost control of a ritual. A tear in reality has spawned hostile shadow constructs.',
        threatLevel: 8,
        eventType: 'INVASION' as EventType,
    },
    {
        title: 'Merchant Caravan Ambush',
        description: 'Scavengers have ambushed a high-value supply convoy. The sector is littered with dropped loot and desperate mercenaries.',
        threatLevel: 4,
        eventType: 'DISCOVERY' as EventType,
    }
];

export function generateLocalEvent(activeSectors: number[]): WorldEvent {
    const template = FALLBACK_EVENTS[Math.floor(Math.random() * FALLBACK_EVENTS.length)];
    
    return {
        id: crypto.randomUUID(),
        title: template.title,
        description: template.description,
        threatLevel: template.threatLevel,
        activeSectors: activeSectors.length > 0 ? activeSectors : [Math.floor(Math.random() * 50) + 1],
        isActive: true,
        eventType: template.eventType,
        createdAt: new Date().toISOString(),
    };
}
