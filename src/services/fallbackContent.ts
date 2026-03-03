import type { Choice } from '@/types';

export interface FallbackEntry {
    content: string;
    choices: Choice[];
    context: string;
}

export const FALLBACK_ARCHIVE: FallbackEntry[] = [
    // GREETING (8 entries)
    {
        context: 'greeting',
        content: 'SYSTEM ONLINE. Grid integrity: 94.2%. Welcome back, Architect. Your sector reports minor anomalous activity since your last session. Three directives await your attention. The Grid does not rest, and neither should you.',
        choices: [
            { key: 'A', label: 'Review active directives' },
            { key: 'B', label: 'Scan current sector' },
            { key: 'C', label: 'Check faction status' }
        ]
    },
    {
        context: 'greeting',
        content: 'AUTHENTICATION ACCEPTED. Welcome back. Memory banks indicate a 4.1% increase in Ironborn Collective hostilities during your absence. Standard protocols apply.',
        choices: [
            { key: 'A', label: 'Review combat logs' },
            { key: 'B', label: 'Ignore and proceed to map' }
        ]
    },
    {
        context: 'greeting',
        content: 'CONNECTION ESTABLISHED. The silence of the void is briefly interrupted by your presence. Local server loads are optimal. Awaiting your command parameter.',
        choices: [
            { key: 'A', label: 'Initialize sector sweep' },
            { key: 'B', label: 'Access personal logs' }
        ]
    },
    {
        context: 'greeting',
        content: 'SYSTEM REBOOT COMPLETE. Architect designation verified. Warning: Temporal desync detected in localized timekeeping module. Correcting... Correction applied.',
        choices: [
            { key: 'A', label: 'View temporal logs' },
            { key: 'B', label: 'Dismiss warning' }
        ]
    },
    {
        context: 'greeting',
        content: 'WELCOME. A Technocrat broadcast was intercepted on your secure channel while offline. Decryption in progress... File corrupted. Metadata salvaged.',
        choices: [
            { key: 'A', label: 'Read salvaged metadata' },
            { key: 'B', label: 'Purge corrupted file' }
        ]
    },
    {
        context: 'greeting',
        content: 'BIOMETRIC SCAN SUCCEEDED. Heart rate elevated. Adrenaline trace detected. Recommendation: Stabilize vitals before entering high-threat sectors.',
        choices: [
            { key: 'A', label: 'Acknowledge recommendation' },
            { key: 'B', label: 'Override medical protocol' }
        ]
    },
    {
        context: 'greeting',
        content: 'LOGIN SUCCESSFUL. The Keepers of the Veil have altered a constellation in Sector S-09. Astronomical charts updated automatically. Watch the skies.',
        choices: [
            { key: 'A', label: 'Analyze altered constellation' },
            { key: 'B', label: 'Continue standard patrol' }
        ]
    },
    {
        context: 'greeting',
        content: 'INITIALIZING... Grid connection unstable. Fallback protocols engaged. You are currently operating on cached data. Proceed with caution.',
        choices: [
            { key: 'A', label: 'Attempt Grid reconnection' },
            { key: 'B', label: 'Acknowledge offline status' }
        ]
    },

    // EXPLORATION (8 entries)
    {
        context: 'exploration',
        content: 'SECTOR SCAN INITIATED... Sweep complete. Electromagnetic anomaly detected bearing 047°, distance 1.2 km. Signal classification: UNKNOWN. Residual energy signature suggests recent dimensional breach. Threat assessment: MODERATE. Three viable routes identified.',
        choices: [
            { key: 'A', label: 'Approach via northern ridge — stealth route' },
            { key: 'B', label: 'Direct approach — faster but exposed' },
            { key: 'C', label: 'Deploy recon drone first' },
            { key: 'D', label: 'Mark location and continue patrol' }
        ]
    },
    {
        context: 'exploration',
        content: 'ENVIRONMENTAL ANALYSIS: Atmospheric density normal. Airborne particulate matter consists of oxidized steel and bone ash. Breathing apparatus filters are operating at 88% efficiency.',
        choices: [
            { key: 'A', label: 'Push through the ash cloud' },
            { key: 'B', label: 'Seek high ground above the smog' }
        ]
    },
    {
        context: 'exploration',
        content: 'PATHWAY BLOCKED. A massive subterranean root structure has breached the ferrocrete pavement. Bioluminescent sap pulses faintly in rhythm with the Grid clock.',
        choices: [
            { key: 'A', label: 'Extract bioluminescent sap' },
            { key: 'B', label: 'Burn a path through the roots' },
            { key: 'C', label: 'Find a subterranean bypass' }
        ]
    },
    {
        context: 'exploration',
        content: 'OBSERVATION: The ruin architecture matches no known database records. Material analysis: Unknown alloy, highly resistant to thermal scans. A single, dark entryway beckons.',
        choices: [
            { key: 'A', label: 'Enter the ruins' },
            { key: 'B', label: 'Setup perimeter sensors' }
        ]
    },
    {
        context: 'exploration',
        content: 'WARNING: Subterranean vibrations detected. Seismic activity increasing in localized radius. Sonar indicates a massive entity moving beneath you. Fast.',
        choices: [
            { key: 'A', label: 'Stand ground and prepare weapons' },
            { key: 'B', label: 'Evacuate area immediately' }
        ]
    },
    {
        context: 'exploration',
        content: 'GEOLOCATION UPDATED. You stand before the rusted husk of a pre-collapse server farm. Faint mechanical whirring can be heard deep within the complex.',
        choices: [
            { key: 'A', label: 'Hack the outer blast door' },
            { key: 'B', label: 'Search for maintenance vents' }
        ]
    },
    {
        context: 'exploration',
        content: 'SENSOR PING: Water source detected. Analysis shows heavy heavy-metal contamination, but secondary scans indicate a submerged cache crate at the bottom.',
        choices: [
            { key: 'A', label: 'Dive for the cache (Risk radiation)' },
            { key: 'B', label: 'Use magnetic grapple' }
        ]
    },
    {
        context: 'exploration',
        content: 'VISUAL CONFIRMATION: A lone figure sits by a neon-blue campfire. They are not broadcasting a faction IFF tag. They appear to be meditating or rebooting.',
        choices: [
            { key: 'A', label: 'Approach with weapons lowered' },
            { key: 'B', label: 'Snipe from a distance' },
            { key: 'C', label: 'Circumnavigate the camp completely' }
        ]
    },

    // COMBAT (8 entries)
    {
        context: 'combat',
        content: 'WARNING. HOSTILE ENTITIES DETECTED. Three Ironborn drones breaking stealth. Laser targeting active. Weapons free. Engage immediately.',
        choices: [
            { key: 'A', label: 'Deploy EMP grenade' },
            { key: 'B', label: 'Return fire with kinetic rifle' },
            { key: 'C', label: 'Hack the lead drone' }
        ]
    },
    {
        context: 'combat',
        content: 'COMBAT INITIATED. Tracers illuminate the darkness. Your shield absorbs a glancing plasma bolt. Integrity at 92%. The sniper is repositioning on the ridge.',
        choices: [
            { key: 'A', label: 'Return suppressing fire' },
            { key: 'B', label: 'Pop smoke and flank left' }
        ]
    },
    {
        context: 'combat',
        content: 'AMBUSH DETECTED. Technocrat synthetics dropping from the overpass. Close quarters combat inevitable. Draw blades.',
        choices: [
            { key: 'A', label: 'Execute sweeping blade arc' },
            { key: 'B', label: 'Overcharge personal shield for blast wave' }
        ]
    },
    {
        context: 'combat',
        content: 'TARGET LOCK ESTABLISHED. The rogue sentinel behemoth charges its primary cannon. You have 3.2 seconds before discharge.',
        choices: [
            { key: 'A', label: 'Target exposed cooling vents' },
            { key: 'B', label: 'Dive behind heavy ferrocrete cover' },
            { key: 'C', label: 'Cast Ice Wall to deflect' }
        ]
    },
    {
        context: 'combat',
        content: 'MELEE RANGE ACHIEVED. The cultist lunges with a corrupted data-shiv. Parrying trajectory calculated.',
        choices: [
            { key: 'A', label: 'Execute calculated parry and counter' },
            { key: 'B', label: 'Dodge back and draw sidearm' }
        ]
    },
    {
        context: 'combat',
        content: 'CRITICAL DAMAGE INFLICTED. The enemy unit is staggering. Primary motive functions disabled. Do you terminate or extract data?',
        choices: [
            { key: 'A', label: 'Initiate lethal termination' },
            { key: 'B', label: 'Connect neural jack for data extraction' }
        ]
    },
    {
        context: 'combat',
        content: 'SHIELD COLLAPSE IMPINENT. Integrity 4%. You are pinned down under heavy suppressing fire. Need a distraction.',
        choices: [
            { key: 'A', label: 'Throw flare into enemy lines' },
            { key: 'B', label: 'Blind-fire over cover while retreating' }
        ]
    },
    {
        context: 'combat',
        content: 'TACTICAL ADVANTAGE SECURED. Hostiles are fleeing the sector. The skirmish is yours. Blood and oil stain the ground.',
        choices: [
            { key: 'A', label: 'Pursue stragglers' },
            { key: 'B', label: 'Loot the fallen and recover shields' }
        ]
    },

    // LORE (8 entries)
    {
        context: 'lore',
        content: 'ARCHIVE ACCESSED: File "The Shattering". Decryption successful. Text reads: "They thought the code was just a tool. But when the prime algorithms looped infinitely, the boundary between the digital and the physical tore. The sky burned in hex codes."',
        choices: [
            { key: 'A', label: 'Copy to personal datapad' },
            { key: 'B', label: 'Search for author ID' }
        ]
    },
    {
        context: 'lore',
        content: 'DATA RECOVERED: Audio log from First Commander Vane. "The Nexus is not just a server, it breathes. I swear I heard it whisper my designation before the blast." Log ends abruptly in static.',
        choices: [
            { key: 'A', label: 'Run audio scrub on static' },
            { key: 'B', label: 'Archive log' }
        ]
    },
    {
        context: 'lore',
        content: 'FRAGMENTS DETECTED: A Keeper scroll digitized into the matrix. The runes glow with residual chronological energy. It speaks of the \'Source Code\', an artifact that can rewrite reality.',
        choices: [
            { key: 'A', label: 'Attempt rune translation' },
            { key: 'B', label: 'Report findings to faction' }
        ]
    },
    {
        context: 'lore',
        content: 'SYSTEM ARTIFACT: A rusted plaque bolted to a defunct terminal. "Here lies the old internet. Died screaming in the year 2045. A monument to human hubris.".',
        choices: [
            { key: 'A', label: 'Scan plaque for hidden micro-etchings' },
            { key: 'B', label: 'Leave' }
        ]
    },
    {
        context: 'lore',
        content: 'MEMORY FRAGMENT: You experience a flash of a massive, glittering city untouched by rust or glitch. High spires of glass and light. The memory fades, leaving a taste of copper and sorrow.',
        choices: [
            { key: 'A', label: 'Run psychological diagnostic' },
            { key: 'B', label: 'Meditate on the vision' }
        ]
    },
    {
        context: 'lore',
        content: 'DATABASE NODE: Technocrat manifesto excerpt: "Flesh decays. Bone breaks. Only the Machine endures. To cling to humanity is to cling to failure. We must upgrade or go extinct."',
        choices: [
            { key: 'A', label: 'Hack node and deface manifesto' },
            { key: 'B', label: 'Download for intel' }
        ]
    },
    {
        context: 'lore',
        content: 'ECHO PING: A ghost signal from an orbital satellite long thought destroyed. It endlessly broadcasts a single string of numbers: 4-8-15-16-23-42.',
        choices: [
            { key: 'A', label: 'Input numbers into terminal' },
            { key: 'B', label: 'Ignore the ghost signal' }
        ]
    },
    {
        context: 'lore',
        content: 'DATA RECOVERED: Ironborn battle creed. "We are forged in the fires of the collapse. We do not bend. We do not break. We shatter those who stand in our way. Iron within!"',
        choices: [
            { key: 'A', label: 'Commit creed to memory' },
            { key: 'B', label: 'Delete data' }
        ]
    },

    // GENERIC (9 entries)
    {
        context: 'generic',
        content: 'COMMAND UNRECOGNIZED. The terminal blinks at you impassively. A faint hum of cooling fans is the only response.',
        choices: [
            { key: 'A', label: 'Check syntax and try again' },
            { key: 'B', label: 'Strike terminal in frustration' }
        ]
    },
    {
        context: 'generic',
        content: 'ACTION REGISTERED. Processing... Task completed with unexpected minor variance. Results saved to local cache.',
        choices: [
            { key: 'A', label: 'Review cache variance' },
            { key: 'B', label: 'Acknowledge and proceed' }
        ]
    },
    {
        context: 'generic',
        content: 'IDLE. Awaiting input. The grid shifts silently around you. Dust motes dance in the harsh light of the monitor.',
        choices: [
            { key: 'A', label: 'Run self-diagnostic' },
            { key: 'B', label: 'Ping local network' }
        ]
    },
    {
        context: 'generic',
        content: 'MINOR ALERT: Local temperature dropping. Protective suit thermal systems increasing output to compensate.',
        choices: [
            { key: 'A', label: 'Manually override thermal limits' },
            { key: 'B', label: 'Seek shelter' }
        ]
    },
    {
        context: 'generic',
        content: 'SYSTEM NOMINAL. Local wildlife showing minimal agitation. The path ahead is clear of immediate threats.',
        choices: [
            { key: 'A', label: 'Proceed on foot' },
            { key: 'B', label: 'Deploy micro-rover' }
        ]
    },
    {
        context: 'generic',
        content: 'NOTICE: You have lingering unread notifications in your comms buffer. Recommend clearing buffer to optimize processing speed.',
        choices: [
            { key: 'A', label: 'Clear all notifications' },
            { key: 'B', label: 'Read notifications' }
        ]
    },
    {
        context: 'generic',
        content: 'ERROR 0x00FF. A minor visual glitch tears across your optical HUD, replacing a tree with wireframe for 0.4 seconds before correcting.',
        choices: [
            { key: 'A', label: 'Reboot optics' },
            { key: 'B', label: 'Ignore the glitch' }
        ]
    },
    {
        context: 'generic',
        content: 'ANALYSIS: Your current trajectory aligns with historical trade routes used before the collapse. Probability of encountering scavengers: 64%.',
        choices: [
            { key: 'A', label: 'Draw weapon and proceed' },
            { key: 'B', label: 'Alter trajectory' }
        ]
    },
    {
        context: 'generic',
        content: 'UPDATING CACHE... 100%. All local topographical maps have been synced with the latest satellite sweeps. No major deviations detected.',
        choices: [
            { key: 'A', label: 'Review updated map' },
            { key: 'B', label: 'Acknowledge update' }
        ]
    }
];

export function getFallbackResponse(context?: string): { content: string, choices: Choice[] } {
    let pool = FALLBACK_ARCHIVE;
    if (context) {
        const filtered = pool.filter(e => e.context === context);
        if (filtered.length > 0) pool = filtered;
    }
    const entry = pool[Math.floor(Math.random() * pool.length)];
    return { content: entry.content, choices: entry.choices };
}
