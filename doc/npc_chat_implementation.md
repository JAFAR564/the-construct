# NPC Chat Implementation (Archived)

This file preserves the NPC auto-response system that was previously integrated into the Faction Hub group chat. The NPCs would automatically generate contextual lines when a user submitted a message.

---

## NPC Personas (`FactionHub.tsx`)

```tsx
interface NPCPersona {
    designation: string;
    faction: Faction;
    rank: Rank;
    personality: string;
}

const NPC_PERSONAS: NPCPersona[] = [
    { designation: 'CIPHER_ZERO', faction: 'TECHNOCRATS', rank: 'WARDEN', personality: 'calculating, speaks in code metaphors' },
    { designation: 'VEIL_WALKER', faction: 'KEEPERS_OF_THE_VEIL', rank: 'SENTINEL', personality: 'mystical, references ancient lore' },
    { designation: 'IRON_HAND', faction: 'IRONBORN_COLLECTIVE', rank: 'COMMANDER', personality: 'blunt, aggressive, respects strength' },
    { designation: 'GHOST_SIGNAL', faction: 'TECHNOCRATS', rank: 'SPECIALIST', personality: 'paranoid, conspiracy theories about the Grid' },
    { designation: 'EMBER_WITCH', faction: 'KEEPERS_OF_THE_VEIL', rank: 'OPERATIVE', personality: 'playful, uses fire metaphors' },
    { designation: 'RUST_PROPHET', faction: 'IRONBORN_COLLECTIVE', rank: 'SENTINEL', personality: 'philosophical, fatalistic, quotes scripture' },
    { designation: 'NULL_BYTE', faction: 'TECHNOCRATS', rank: 'OPERATIVE', personality: 'sarcastic, hacker humor, trollish' },
    { designation: 'SHADOW_LOOM', faction: 'KEEPERS_OF_THE_VEIL', rank: 'WARDEN', personality: 'ominous, speaks in riddles' },
];
```

## NPC Responses (`FactionHub.tsx`)

```tsx
const NPC_RESPONSES: Record<string, string[]> = {
    CIPHER_ZERO: [
        'Every message is a packet. Every packet has a payload. What is yours?',
        'I traced the anomaly to Sector S-14. The data is... corrupted beyond recovery.',
        'The Grid remembers everything. Even the things you delete.',
        'Running diagnostics. Results inconclusive. As expected.',
        'You think in language. I think in binary. Neither of us sees the whole picture.',
    ],
    VEIL_WALKER: [
        'The ancient scripts speak of this moment. The convergence draws near.',
        'I walked between the veils last night. Something watched me from the other side.',
        'The runes do not lie. But they do not always tell the whole truth.',
        'In the old tongue, your name would mean "seeker." Fitting, perhaps.',
        'The Veil thins in Sector S-12. I can feel the old magic bleeding through.',
    ],
    IRON_HAND: [
        'Talk is cheap. Show me what your fists can do in the Arena.',
        'I crushed three opponents yesterday. My forge grows stronger.',
        'The Ironborn do not negotiate. We build. We conquer. We endure.',
        'Your faction speaks of subtlety. I speak of hammers. Guess which wins.',
        'Respect is earned in blood and iron, not words and whispers.',
    ],
    GHOST_SIGNAL: [
        'Has anyone else noticed the signal spikes in Sector S-07? Something is watching us.',
        'They say the Grid is just code. But code does not dream. The Grid dreams.',
        'I intercepted a transmission last cycle. It was in a language that does not exist yet.',
        'Trust no one. Especially the ones who tell you to trust them.',
        'My sensors are picking up ghost signals. Transmissions from nowhere to nowhere.',
    ],
    EMBER_WITCH: [
        'Careful, darling. Play with fire and you might get... well, you know. 🔥',
        'I lit a candle for the fallen last night. The flame turned green. Strange.',
        'The warmth of a good spell is better than any forge. No offense, Ironborn.',
        'They call me a witch like it is an insult. I call it a compliment.',
        'Anyone want to see a trick? I can make your doubts disappear. Along with your eyebrows.',
    ],
    RUST_PROPHET: [
        'All metal returns to rust. All code returns to entropy. Such is the way.',
        '"In the age of iron, the patient hand shapes the world." — Book of the Forge, verse 7.',
        'I have seen the end, and it is magnificent. Do not fear the unmaking.',
        'We build monuments to impermanence. There is beauty in that contradiction.',
        'The Grid will fall. Something better will rise. This is not despair. This is prophecy.',
    ],
    NULL_BYTE: [
        'lmao imagine not having root access in 2026',
        'I tried to hack S-00 once. Got rickrolled by the system admin. Respect.',
        'Anyone else just here for the memes? No? Just me? Cool cool cool.',
        'Hot take: the Keepers are just LARPers with admin privileges.',
        'I wrote a script that auto-generates conspiracy theories. Ghost Signal keeps quoting it.',
    ],
    SHADOW_LOOM: [
        'Three threads converge. One gold, one crimson, one void. Only one survives.',
        'I speak in riddles because the truth is too sharp for naked words.',
        'What walks on no legs but travels every sector? A rumor.',
        'The loom weaves. The pattern forms. You are a thread. Do not break.',
        'Darkness is not the absence of light. It is the presence of everything else.',
    ],
};
```

## NPC Response Generator (`FactionHub.tsx`)

```tsx
const generateNPCResponse = (channelId: string) => {
    const npc = NPC_PERSONAS[Math.floor(Math.random() * NPC_PERSONAS.length)];
    const responses = NPC_RESPONSES[npc.designation] || [];
    const content = responses[Math.floor(Math.random() * responses.length)] || 'The Grid hums with static...';

    const npcMessage: ChannelMessage = {
        id: crypto.randomUUID(),
        channelId,
        userId: `npc_${npc.designation}`,
        designation: npc.designation,
        faction: npc.faction,
        rank: npc.rank,
        content,
        timestamp: new Date().toISOString(),
        reactions: {},
        isNPC: true,
        isPinned: false,
    };

    addChannelMessage(channelId, npcMessage);
};
```

## NPC Auto-Trigger on User Message (`FactionHub.tsx` — inside `handleSend`)

```tsx
// Trigger NPC response after random delay (2-8 seconds)
if (npcTimerRef.current) clearTimeout(npcTimerRef.current);
npcTimerRef.current = window.setTimeout(() => {
    generateNPCResponse(activeChannel.id);
}, 2000 + Math.random() * 6000);
```

## NPC Auto-Trigger on Combat Commands (`FactionHub.tsx` — inside `handleSlashCommand`)

```tsx
// NPC reaction to combat commands
if (['/challenge', '/attack', '/defend'].includes(command) && args) {
    if (npcTimerRef.current) clearTimeout(npcTimerRef.current);
    npcTimerRef.current = window.setTimeout(() => {
        generateNPCResponse(activeChannel.id);
    }, 1500 + Math.random() * 3000);
}
```

## NPC Welcome Messages (`useChatStore.ts` — inside `initializeChannels`)

```tsx
// Add initial NPC welcome messages to each channel
const welcomeMessages: Record<string, string> = {
    'global-general': 'GRID BROADCAST: All frequencies open. Identify yourselves, Architects. Hostility will be met with system intervention.',
    'global-combat': 'ARENA PROTOCOL INITIALIZED. Challenge an opponent by issuing a combat request. AI adjudicator standing by. Rules: declare actions clearly. The Grid determines outcomes.',
};

const channelsWithWelcome = defaultChannels.map(ch => {
    const welcomeContent = welcomeMessages[ch.id];
    if (welcomeContent) {
        return {
            ...ch,
            messages: [{
                id: crypto.randomUUID(),
                channelId: ch.id,
                userId: 'SYSTEM',
                designation: 'CONSTRUCT OS',
                faction: 'TECHNOCRATS' as const,
                rank: 'SOVEREIGN' as const,
                content: welcomeContent,
                timestamp: new Date().toISOString(),
                reactions: {},
                isNPC: true,
                isPinned: false,
            }]
        };
    }
    return ch;
});
```

## NPC Badge in MessageBubble (`FactionHub.tsx`)

```tsx
{message.isNPC && (
    <span style={{
        fontSize: '9px', color: 'var(--accent-warning)',
        border: '1px solid var(--accent-warning)', padding: '0 4px',
    }}>NPC</span>
)}
```

## NPC-Specific Message Styling (`FactionHub.tsx`)

```tsx
// In MessageBubble content div:
color: message.isNPC ? 'var(--text-secondary)' : 'var(--text-primary)',
fontStyle: message.isNPC ? 'italic' : 'normal',
```

## NPC Challenge Slash Command (`FactionHub.tsx` — inside `handleSlashCommand`)

```tsx
case '/challenge': {
    if (!args) {
        systemContent = '⚠️ Usage: /challenge [designation]';
        break;
    }
    const targetNPC = NPC_PERSONAS.find(n => n.designation.toLowerCase() === args.toLowerCase());
    if (!targetNPC) {
        systemContent = `⚠️ Unknown opponent: ${args}. Available: ${NPC_PERSONAS.map(n => n.designation).join(', ')}`;
        break;
    }
    if (activeChannel.type !== 'combat') {
        systemContent = '⚠️ Combat can only be initiated in the COMBAT ARENA channel.';
        break;
    }
    const session = createCombatSession(
        activeChannel.id,
        { userId: user.id, designation: user.designation, faction: user.faction },
        { userId: `npc_${targetNPC.designation}`, designation: targetNPC.designation, faction: targetNPC.faction },
    );
    startCombat(activeChannel.id, session);
    systemContent = `⚔️ COMBAT INITIATED! ${user.designation} vs ${targetNPC.designation}. Environment: ${session.environment}. Describe your first action!`;
    break;
}
```
