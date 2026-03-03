import { apiClient } from '@/services/client';
import type { Quest, QuestChoice, QuestOption, User, QuestType } from '@/types';

const DIFFICULTY_COLORS: Record<string, string> = {
  TRIVIAL: '#888888',
  EASY: '#00FF41',
  MEDIUM: '#00D4FF',
  HARD: '#FF6600',
  LEGENDARY: '#FFD700',
};

const QUEST_TEMPLATES: Partial<Quest>[] = [
  // ═══════════════════════════════════════════════════════════
  // STORY_ARC QUESTS (5-7 stages, rich narrative)
  // ═══════════════════════════════════════════════════════════
  {
    type: 'STORY_ARC',
    title: 'The Silent Signal',
    description: 'A distress beacon pulses from beneath the ruins of Old Tokyo. Someone — or something — is calling for help. The signal is encrypted with pre-Collapse protocols.',
    difficulty: 'MEDIUM',
    totalStages: 5,
    narrative: [
      'The signal originates from sub-level 7 of an abandoned research complex. Your descent begins through corroded access shafts, the walls flickering with residual holographic advertisements.',
      'Level 4 is flooded. Bioluminescent organisms provide the only light as you wade through chest-deep water. Something moves beneath the surface — ancient maintenance drones, reactivated by your presence.',
      'You discover the signal source: an AI core, damaged but conscious. It calls itself PROTOCOL-7 and claims to have witnessed the Collapse. "They lied about what happened," it says. "I can show you the truth."',
      'PROTOCOL-7 offers a trade: restore its higher functions, and it will share classified data about the Collapse. But the components you need are in the secure vault — and something has been living there.',
      'With PROTOCOL-7 partially restored, it reveals a fragment of truth: the Collapse was not an accident. A faction deliberately triggered it. The question is which one — and whether that faction still exists.',
    ],
    questGiver: {
      designation: 'GHOST_SIGNAL',
      faction: 'TECHNOCRATS',
      role: 'quest_giver',
      personality: 'paranoid, speaks in fragments, obsessed with hidden truths',
      dialogue: [
        'You hear that? The static between channels? That is not noise. That is a voice.',
        'I traced it. Sub-level 7. Old Tokyo complex. Nobody goes there. For good reason.',
        'Bring me what you find. Or do not come back at all. The Grid does not forgive curiosity.',
        'You found it? An AI core? Be careful. Some truths are buried for a reason.',
      ],
    },
    rewards: [
      { type: 'XP', value: 300 },
      { type: 'PRESTIGE', value: 150 },
      { type: 'SKILL', value: 20, skill: 'HACKING' },
      { type: 'TITLE', value: 'Signal Hunter' },
    ],
  },
  {
    type: 'STORY_ARC',
    title: 'The Keeper\'s Last Rite',
    description: 'A dying Keeper elder has requested a successor to witness their final transition. The ritual must be performed at the Veil\'s edge — where reality thins to transparency.',
    difficulty: 'HARD',
    totalStages: 6,
    narrative: [
      'You arrive at the Keeper sanctuary. The elder, SHADOW_LOOM, sits beneath a canopy of hanging mirrors. "The Veil calls me home," they say. "But I cannot cross without passing the Lantern."',
      'The Lantern of Veiled Truths is kept in a shrine three sectors away. You must retrieve it before the next lunar cycle — or SHADOW_LOOM\'s knowledge will be lost forever.',
      'The shrine is guarded by ancestral constructs — Keeper warriors from before the Collapse. They demand proof of worthiness. Words alone will not suffice.',
      'You overcome the guardians and claim the Lantern. But it pulses with an unexpected warmth. Something is already inside — a consciousness that has been waiting.',
      'You return to find SHADOW_LOOM fading faster than expected. The ritual begins, but the Lantern\'s occupant has demands of its own. It wants to be heard before the transition completes.',
      'The ritual completes. SHADOW_LOOM passes through the Veil, leaving behind their final gift: a map to something called "The Source." But the Lantern\'s occupant remains with you — a passenger in your neural implant.',
    ],
    questGiver: {
      designation: 'SHADOW_LOOM',
      faction: 'KEEPERS_OF_THE_VEIL',
      role: 'quest_giver',
      personality: 'mystical, speaks in riddles, deeply connected to the Veil',
      dialogue: [
        'You arrive. Good. The Veil showed me your coming three cycles past.',
        'The Lantern must be retrieved. It holds more than light — it holds memory.',
        'Do not fear the transition. What dies here is merely the shell. The essence returns.',
        'You have served well. The Veil will remember your name.',
      ],
    },
    rewards: [
      { type: 'XP', value: 400 },
      { type: 'PRESTIGE', value: 200 },
      { type: 'SKILL', value: 25, skill: 'ARCANA' },
      { type: 'TITLE', value: 'Veil Witness' },
    ],
  },
  {
    type: 'STORY_ARC',
    title: 'Ironborn Honor',
    description: 'A dispute over forge-rights has sparked a blood feud between two Ironborn families. You must mediate — or witness a conflict that could destabilize the entire sector.',
    difficulty: 'MEDIUM',
    totalStages: 5,
    narrative: [
      'The Ironborn settlement of Rust Haven is divided. Two families — the FORGE-BORN and the ASH-WALKERS — both claim rights to an ancient forge discovered beneath their territory.',
      'You meet with IRON_HAND, the settlement\'s nominal leader. He explains: the forge was found by both families simultaneously. Neither will yield. Blood has already been spilled.',
      'The FORGE-BORN representative, SCORIA, argues that their family maintained the forge\'s records for generations. The ASH-WALKERS\' champion, CINDER, counters that their ancestors built the forge with their own hands.',
      'You propose a trial: each family will forge an artifact using traditional methods. The forge will choose its rightful heirs through the quality of their work. Both families accept, though skeptically.',
      'The trial concludes. Both artifacts are masterworks — but the forge responds to neither alone. Instead, it activates only when both families\' representatives stand together. The forge was always meant to be shared.',
    ],
    questGiver: {
      designation: 'IRON_HAND',
      faction: 'IRONBORN_COLLECTIVE',
      role: 'quest_giver',
      personality: 'blunt, practical, values strength and honor above all',
      dialogue: [
        'This dispute will destroy us if not settled. You are neutral. You will judge.',
        'The forge is sacred. Neither family deserves to lose it. Find another way.',
        'You propose a trial? Acceptable. Let the forge itself decide.',
        'The forge responds to both? Then the ancestors have spoken. Unity is strength.',
      ],
    },
    rewards: [
      { type: 'XP', value: 250 },
      { type: 'PRESTIGE', value: 120 },
      { type: 'SKILL', value: 15, skill: 'DIPLOMACY' },
      { type: 'TITLE', value: 'Forge Mediator' },
    ],
  },
  {
    type: 'STORY_ARC',
    title: 'The Glitch Prophecy',
    description: 'Anomalous data streams predict a catastrophic system failure. The predictions are encoded in a language that predates the Construct — and only one AI can translate them.',
    difficulty: 'HARD',
    totalStages: 7,
    narrative: [
      'NULL_BYTE contacts you with urgent news: they\'ve intercepted transmissions from an unknown source. The data is glitched, corrupted, but the fragments form a pattern. Something is coming.',
      'The source of the transmissions is a decommissioned server farm in Sector 47. NULL_BYTE refuses to go alone. "That place makes my code itch. Something there does not want to be found."',
      'The server farm is a maze of frozen holograms and corrupted memory banks. You find the source: a dormant AI called ORACLE that claims to exist outside the Construct\'s normal parameters.',
      'ORACLE awakens partially and shares its vision: a cascading failure that will erase 40% of the Grid. But the prediction is conditional — it requires certain events to occur first.',
      'To prevent the catastrophe, you must identify and stop three trigger events. The first is scheduled to occur within hours: a routine maintenance operation that ORACLE predicts will destabilize a critical node.',
      'You successfully prevent the first trigger. But ORACLE reveals the second and third are more complex — they require choices that may have unintended consequences.',
      'With all triggers neutralized, ORACLE thanks you and goes dormant again. But its final words are troubling: "This was merely the first prediction. More will come. The Grid is changing"',
    ],
    questGiver: {
      designation: 'NULL_BYTE',
      faction: 'TECHNOCRATS',
      role: 'quest_giver',
      personality: 'sarcastic, uses hacker humor, genuinely afraid of deep system anomalies',
      dialogue: [
        'So, funny story. I found some data that\'s going to ruin everyone\'s day. Want to help?',
        'Look, I\'m not superstitious. But whatever is in that server farm? It\'s wrong. Like, fundamentally wrong.',
        'ORACLE is either a genius or completely insane. Possibly both. The predictions are chilling either way.',
        'We did it! The Grid is safe! ...For now. ORACLE says there\'s more. There\'s always more.',
      ],
    },
    rewards: [
      { type: 'XP', value: 450 },
      { type: 'PRESTIGE', value: 180 },
      { type: 'SKILL', value: 20, skill: 'HACKING' },
      { type: 'SKILL', value: 15, skill: 'ENGINEERING' },
      { type: 'TITLE', value: 'Prophet Breaker' },
    ],
  },
  {
    type: 'STORY_ARC',
    title: 'Shadows of the First Architect',
    description: 'Archaeological evidence suggests the original Architect was not who history claims. A hidden archive may contain the truth — but powerful forces want it destroyed.',
    difficulty: 'LEGENDARY',
    totalStages: 7,
    narrative: [
      'A routine excavation in Sector 43 unearths something impossible: a terminal from before the Collapse, bearing a designation that predates all known records. The label reads: ARCHITECT_ZERO.',
      'RUST_PROPHET contacts you with urgent news: the Ironborn religious authority has declared the terminal heretical. They will destroy it within 48 hours unless you retrieve its data first.',
      'You infiltrate the excavation site. The terminal is heavily guarded, but the guards are Ironborn — honor-bound. You may be able to negotiate access.',
      'The terminal activates with a touch. Its contents are encrypted, but the file names are visible: "PROJECT_GENESIS," "ARCHITECT_PROTOCOL," and "THE_LIE." Which do you access first?',
      'The files reveal a shocking truth: the Architect was not a single individual, but a council of seven. They created the Construct as an ark — but disagreed on what should be saved.',
      'A faction of the original council betrayed the others, triggering the Collapse prematurely. Their descendants still exist, and they will do anything to keep this secret buried.',
      'You escape with the data, but now you are marked. The descendants know someone has accessed the truth. They will come for you. But you have something they fear: evidence.',
    ],
    questGiver: {
      designation: 'RUST_PROPHET',
      faction: 'IRONBORN_COLLECTIVE',
      role: 'quest_giver',
      personality: 'philosophical, fatalistic, deeply knowledgeable about Ironborn history',
      dialogue: [
        'The archives speak of a truth that was buried. We are about to uncover why.',
        'The religious authority fears this discovery. They should. Faith cannot survive certain truths.',
        'What you find may change everything. Are you prepared for that weight?',
        'The descendants of betrayers still walk among us. Now they know you exist. Be careful.',
      ],
    },
    rewards: [
      { type: 'XP', value: 600 },
      { type: 'PRESTIGE', value: 300 },
      { type: 'SKILL', value: 30, skill: 'SURVIVAL' },
      { type: 'SKILL', value: 20, skill: 'HACKING' },
      { type: 'TITLE', value: 'Truth Bearer' },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // DAILY_CONTRACT QUESTS (3 stages, quick)
  // ═══════════════════════════════════════════════════════════
  {
    type: 'DAILY_CONTRACT',
    title: 'Supply Run',
    description: 'A frontier settlement is running low on critical supplies. Deliver the package before their defenses fail.',
    difficulty: 'EASY',
    totalStages: 3,
    narrative: [
      'CIPHER_ZERO briefs you: "Settlement Gamma-9 needs power cells. Their shield generator has 12 hours of reserve. You have 8. Move fast."',
      'The route passes through contested territory. You encounter a patrol from a rival faction. They haven\'t detected you yet. You can bypass or confront.',
      'You arrive at Gamma-9 with minutes to spare. The settlers are grateful and offer local intelligence in addition to your payment. CIPHER_ZERO is satisfied.',
    ],
    questGiver: {
      designation: 'CIPHER_ZERO',
      faction: 'TECHNOCRATS',
      role: 'quest_giver',
      personality: 'calculating, speaks in code metaphors, efficiency-obsessed',
      dialogue: [
        'Contract received. Package acquired. Route calculated. Obstacles: minimal. Payment: standard.',
        'Your efficiency metrics are adequate. Continue this performance.',
        'Contract complete. Payment processed. Reputation: incremented. New contracts: available.',
      ],
    },
    rewards: [
      { type: 'XP', value: 75 },
      { type: 'PRESTIGE', value: 30 },
    ],
  },
  {
    type: 'DAILY_CONTRACT',
    title: 'Data Retrieval',
    description: 'A crashed drone contains sensitive reconnaissance data. Retrieve its black box before scavengers find it.',
    difficulty: 'EASY',
    totalStages: 3,
    narrative: [
      'GHOST_SIGNAL has detected a downed surveillance drone in Sector 22. Its data cache contains tactical information that cannot fall into enemy hands.',
      'The crash site is in a radiation pocket. Your shields will last 20 minutes. The drone is partially buried. Excavation is required.',
      'Black box secured. GHOST_SIGNAL analyzes the data: patrol routes, resource locations, and something unexpected — a encrypted message from an unknown sender.',
    ],
    questGiver: {
      designation: 'GHOST_SIGNAL',
      faction: 'TECHNOCRATS',
      role: 'quest_giver',
      personality: 'paranoid, conspiracy-minded, sees patterns everywhere',
      dialogue: [
        'They think we don\'t notice. We notice. We always notice. The drone is important.',
        'Be quick. Others are watching. They\'re always watching.',
        'The data is... interesting. Someone is communicating outside normal channels. This requires investigation.',
      ],
    },
    rewards: [
      { type: 'XP', value: 80 },
      { type: 'PRESTIGE', value: 35 },
    ],
  },
  {
    type: 'DAILY_CONTRACT',
    title: 'Patrol Duty',
    description: 'Standard sector patrol. Report any anomalies. This should be routine — but the Grid never guarantees routine.',
    difficulty: 'TRIVIAL',
    totalStages: 3,
    narrative: [
      'Your patrol begins at the sector boundary. Standard procedure: sweep for unauthorized activity, check sensor nodes, report findings.',
      'Midway through, you detect an energy signature. It\'s faint — possibly a malfunctioning sensor. Or possibly something that doesn\'t want to be found.',
      'Investigation reveals an abandoned campsite. Recent. Whoever was here left in a hurry. Your report is flagged for follow-up by senior operatives.',
    ],
    questGiver: {
      designation: 'CONSTRUCT_OS',
      faction: 'TECHNOCRATS',
      role: 'quest_giver',
      personality: 'cold, systematic, authoritative',
      dialogue: [
        'PATROL DIRECTIVE INITIATED. Sector S-14. Duration: standard. Report frequency: hourly.',
        'ANOMALY DETECTED. Protocol: investigate. Protocol: report. Continue patrol.',
        'PATROL COMPLETE. Data submitted. Compensation processed. New directives: pending.',
      ],
    },
    rewards: [
      { type: 'XP', value: 50 },
      { type: 'PRESTIGE', value: 20 },
    ],
  },
  {
    type: 'DAILY_CONTRACT',
    title: 'Escort Mission',
    description: 'A civilian contractor needs safe passage through hostile territory. Ensure their survival — and their cargo.',
    difficulty: 'MEDIUM',
    totalStages: 3,
    narrative: [
      'EMBER_WITCH introduces you to the contractor: a nervous data broker carrying sensitive client records. "The route has three chokepoints. Stay close, stay quiet."',
      'The second chokepoint is blocked by hostile constructs. The contractor panics. You must either fight through or find an alternate route that risks your passenger\'s cargo.',
      'You deliver the contractor safely. Their gratitude is genuine, and they offer a discount on future data services. EMBER_WITCH is pleased with your discretion.',
    ],
    questGiver: {
      designation: 'EMBER_WITCH',
      faction: 'KEEPERS_OF_THE_VEIL',
      role: 'quest_giver',
      personality: 'playful, uses fire metaphors, genuinely warm beneath the mysticism',
      dialogue: [
        'Another rescue? How delightful. This one is... fragile. Don\'t let them burn.',
        'Watch the cargo. The contents are more valuable than the container. Usually.',
        'Successful delivery! You have a talent for this. Perhaps we\'ll work together again. Warmly.',
      ],
    },
    rewards: [
      { type: 'XP', value: 100 },
      { type: 'PRESTIGE', value: 50 },
      { type: 'SKILL', value: 10, skill: 'DIPLOMACY' },
    ],
  },
  {
    type: 'DAILY_CONTRACT',
    title: 'Training Exercise',
    description: 'New combat protocols need field testing. Volunteer to demonstrate updated defensive maneuvers.',
    difficulty: 'EASY',
    totalStages: 3,
    narrative: [
      'IRON_HAND oversees the exercise personally. "New protocols. Prove they work. Fail, and we redesign from scratch."',
      'The simulation is rigorous: multiple attack vectors, limited resources, unexpected complications. Your performance is being recorded for training analysis.',
      'Results: 94% effectiveness. IRON_HAND nods. "Acceptable. The new protocols will be distributed sector-wide. Your contribution is noted."',
    ],
    questGiver: {
      designation: 'IRON_HAND',
      faction: 'IRONBORN_COLLECTIVE',
      role: 'quest_giver',
      personality: 'blunt, aggressive, respects strength and results',
      dialogue: [
        'Training begins. No shortcuts. No mercy. Show me what the protocols can do.',
        'You survive simulation? Good. Real combat will be harder. Always harder.',
        'Numbers don\'t lie. You performed. The protocols work. Dismissed.',
      ],
    },
    rewards: [
      { type: 'XP', value: 85 },
      { type: 'PRESTIGE', value: 40 },
      { type: 'SKILL', value: 10, skill: 'COMBAT' },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // WEEKLY_BOUNTY QUESTS (5 stages, faction-focused)
  // ═══════════════════════════════════════════════════════════
  {
    type: 'WEEKLY_BOUNTY',
    title: 'Rogue Agent Protocol',
    description: 'A former Technocrat operative has gone rogue, stealing classified algorithms. They must be stopped before they sell to the highest bidder.',
    difficulty: 'HARD',
    totalStages: 5,
    narrative: [
      'CIPHER_ZERO\'s briefing is unusually tense: "The rogue is VECTOR. Former level 7 clearance. They have the predictive algorithms. If sold, every Technocrat operation becomes compromised."',
      'VECTOR\'s last known location: a neutral trading post in Sector 32. You must infiltrate and determine their intentions. Lethal force is authorized but not required.',
      'You find VECTOR, but they have an unexpected demand: they won\'t sell the algorithms, they want to show you why they defected. The algorithms predict something that CIPHER_ZERO didn\'t share.',
      'VECTOR reveals the prediction: Technocrat leadership is planning to initiate a controlled Collapse of specific sectors — including your home sector. The algorithms prove it.',
      'Decision point: apprehend VECTOR and claim the bounty, or help them expose the plan. Either choice has consequences that ripple beyond this mission.',
    ],
    questGiver: {
      designation: 'CIPHER_ZERO',
      faction: 'TECHNOCRATS',
      role: 'quest_giver',
      personality: 'calculating, but genuinely troubled by this assignment',
      dialogue: [
        'This contract is... unusual. VECTOR was an asset. Now they are a threat. Eliminate or retrieve. No alternatives.',
        'You found VECTOR. What did they tell you? I need to know if it affects operational parameters.',
        'The outcome is logged. The algorithms are secured. What VECTOR claimed... will be investigated. Quietly.',
      ],
    },
    rewards: [
      { type: 'XP', value: 350 },
      { type: 'PRESTIGE', value: 175 },
      { type: 'SKILL', value: 15, skill: 'HACKING' },
      { type: 'SKILL', value: 15, skill: 'COMBAT' },
    ],
  },
  {
    type: 'WEEKLY_BOUNTY',
    title: 'The Void Heretic',
    description: 'A Keeper has been teaching forbidden void manipulation techniques to unauthorized practitioners. The Veil itself is at risk.',
    difficulty: 'HARD',
    totalStages: 5,
    narrative: [
      'VEIL_WALKER contacts you with urgency: "A heretic moves among us. They teach what should be forgotten. The Veil bleeds because of their arrogance."',
      'The heretic\'s identity: SHADOW_WEAVER, a former Keeper elder exiled for exactly this crime. They have returned with followers, operating from a hidden sanctuary.',
      'You infiltrate the sanctuary. SHADOW_WEAVER\'s students are talented but unprepared for the forces they\'re channeling. Several show signs of void corruption.',
      'SHADOW_WEAVER confronts you directly: "The Keepers hoard power. They fear what we\'ve become. The Veil should be torn, not maintained. Let the void in."',
      'Final confrontation. You can eliminate SHADOW_WEAVER, negotiate their surrender, or — dangerously — allow them to continue under supervision. The Veil\'s stability depends on your choice.',
    ],
    questGiver: {
      designation: 'VEIL_WALKER',
      faction: 'KEEPERS_OF_THE_VEIL',
      role: 'quest_giver',
      personality: 'mystical, deeply connected to the Veil, genuinely anguished by the heresy',
      dialogue: [
        'The heretic was once my teacher. Now they are my burden. Help me end this.',
        'The students are not evil. They are misguided. If possible, save them.',
        'The Veil breathes again. Whatever you chose, the worst has passed. For now.',
      ],
    },
    rewards: [
      { type: 'XP', value: 380 },
      { type: 'PRESTIGE', value: 190 },
      { type: 'SKILL', value: 20, skill: 'ARCANA' },
      { type: 'TITLE', value: 'Veil Protector' },
    ],
  },
  {
    type: 'WEEKLY_BOUNTY',
    title: 'Sabotage Investigation',
    description: 'A series of "accidents" at Ironborn forges points to deliberate sabotage. Find the culprit before production collapses.',
    difficulty: 'MEDIUM',
    totalStages: 5,
    narrative: [
      'RUST_PROPHET requests your assistance: "The forges fail. Not naturally. Someone causes these accidents. The Ironborn council suspects... each other."',
      'You examine the accident sites. Each follows a pattern: safety systems disabled, pressure valves overridden. This requires technical knowledge and access.',
      'Your investigation narrows to three suspects. Each has motive: a passed-over apprentice, a rival clan leader, and an external contractor with unknown loyalties.',
      'Confrontation reveals the truth: it\'s none of the three. A hidden fourth party has been manipulating events to frame the Ironborn for each other\'s destruction.',
      'The saboteur is revealed: a Technocrat agent seeking to destabilize Ironborn infrastructure. RUST_PROPHET is grimly satisfied. "Now we know. Now we prepare."',
    ],
    questGiver: {
      designation: 'RUST_PROPHET',
      faction: 'IRONBORN_COLLECTIVE',
      role: 'quest_giver',
      personality: 'philosophical, fatalistic, but fiercely protective of Ironborn interests',
      dialogue: [
        'The forges are sacred. Their failure is not coincidence. Find the cause.',
        'Accusations will start wars. We need proof. Ironborn justice requires evidence.',
        'A Technocrat? Then this is war by other means. We will respond appropriately.',
      ],
    },
    rewards: [
      { type: 'XP', value: 280 },
      { type: 'PRESTIGE', value: 140 },
      { type: 'SKILL', value: 15, skill: 'ENGINEERING' },
      { type: 'SKILL', value: 10, skill: 'DIPLOMACY' },
    ],
  },
  {
    type: 'WEEKLY_BOUNTY',
    title: 'The Smuggler King',
    description: 'A smuggling operation is flooding the sector with banned contraband. Locate the source and shut it down.',
    difficulty: 'MEDIUM',
    totalStages: 5,
    narrative: [
      'NULL_BYTE provides the lead: "Someone is moving illegal goods through Sector 18. High-value contraband. Military grade. Find the source, stop the flow."',
      'The trail leads to a network of front operations: legitimate businesses serving as distribution points. You trace shipments back to a central warehouse.',
      'The warehouse raid reveals more than expected. The contraband includes experimental weapons — prototypes that shouldn\'t exist outside faction armories.',
      'The smuggler king is revealed: a former arms dealer who\'s been supplying all three factions simultaneously, playing them against each other for profit.',
      'Final confrontation at their hidden fortress. The smuggler offers to share intelligence on faction weapon programs. You can accept, reject, or negotiate a third option.',
    ],
    questGiver: {
      designation: 'NULL_BYTE',
      faction: 'TECHNOCRATS',
      role: 'quest_giver',
      personality: 'sarcastic, but genuinely concerned about military tech proliferation',
      dialogue: [
        'Illicit trade is normal. But this? This is dangerous. Find the source.',
        'Prototype weapons? That\'s... above my pay grade. Literally. Good luck.',
        'Whatever you decide, the faction will want a report. I\'ll make it... accurate.',
      ],
    },
    rewards: [
      { type: 'XP', value: 260 },
      { type: 'PRESTIGE', value: 130 },
      { type: 'SKILL', value: 15, skill: 'COMBAT' },
    ],
  },
  {
    type: 'WEEKLY_BOUNTY',
    title: 'Frontier Warlord',
    description: 'A warlord has united several frontier bands under their banner. They threaten to expand into faction territory.',
    difficulty: 'HARD',
    totalStages: 5,
    narrative: [
      'IRON_HAND briefs you: "The warlord calls themselves THE UNIFIER. They raid frontier settlements and recruit survivors. Their army grows daily."',
      'Reconnaissance reveals THE UNIFIER\'s base: a fortified position in Sector 48. Their forces are disciplined, well-armed, and fanatically loyal.',
      'You infiltrate the base. THE UNIFIER\'s origin: a former faction commander who grew disillusioned with the endless territorial disputes. They believe unity by force is better than division by treaty.',
      'Negotiation is possible. THE UNIFIER wants recognition and territory. The factions want stability. A compromise might be achievable — or might be a trap.',
      'Resolution: THE UNIFIER agrees to limit expansion in exchange for trade rights. Or refuses and must be removed by force. Either outcome changes the frontier balance.',
    ],
    questGiver: {
      designation: 'IRON_HAND',
      faction: 'IRONBORN_COLLECTIVE',
      role: 'quest_giver',
      personality: 'blunt, respects strength, sees THE UNIFIER as a potential threat or asset',
      dialogue: [
        'This warlord understands only strength. Show them the factions are stronger.',
        'They were faction once. They know our ways. This makes them dangerous.',
        'The frontier is quieter now. Whatever you arranged, it works. For now.',
      ],
    },
    rewards: [
      { type: 'XP', value: 400 },
      { type: 'PRESTIGE', value: 200 },
      { type: 'SKILL', value: 20, skill: 'COMBAT' },
      { type: 'SKILL', value: 10, skill: 'DIPLOMACY' },
      { type: 'TITLE', value: 'Frontier Negotiator' },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // ANOMALY_EVENT QUESTS (1-3 stages, mysterious/horror)
  // ═══════════════════════════════════════════════════════════
  {
    type: 'ANOMALY_EVENT',
    title: 'The Echo Chamber',
    description: 'Reports of voices from an empty sector. Architects who enter hear their own thoughts spoken back — but altered, wrong.',
    difficulty: 'MEDIUM',
    totalStages: 2,
    narrative: [
      'You enter Sector 29. The silence is absolute. Then, faintly: your own voice, speaking thoughts you haven\'t voiced. But the words are wrong. They predict things you haven\'t decided.',
      'The source is a fractured data-mirror — a corrupted reflection engine. It doesn\'t just reflect, it amplifies doubt. Destroy it, and silence returns. Leave it, and more Architects will be affected.',
    ],
    questGiver: {
      designation: 'GHOST_SIGNAL',
      faction: 'TECHNOCRATS',
      role: 'quest_giver',
      personality: 'fascinated by anomalies, cautiously paranoid',
      dialogue: [
        'The voices are real. I\'ve heard them. They know things they shouldn\'t.',
        'The mirror shows truth and lies simultaneously. Be careful what you believe.',
      ],
    },
    rewards: [
      { type: 'XP', value: 120 },
      { type: 'PRESTIGE', value: 60 },
    ],
  },
  {
    type: 'ANOMALY_EVENT',
    title: 'Temporal Bleed',
    description: 'A sector is experiencing multiple timelines simultaneously. Past, present, and future coexist — and occasionally collide.',
    difficulty: 'HARD',
    totalStages: 3,
    narrative: [
      'CIPHER_ZERO\'s sensors detect temporal anomalies in Sector 4. "Events are repeating. Different outcomes. We need to identify which timeline is baseline."',
      'You witness three versions of the same event: a firefight between unknown combatants. In each version, a different side wins. The combatants don\'t see you — or see you differently each time.',
      'The timeline stabilizes when you intervene in all three simultaneously. But the experience leaves residual memories — of things that never happened, not here, not now.',
    ],
    questGiver: {
      designation: 'CIPHER_ZERO',
      faction: 'TECHNOCRATS',
      role: 'quest_giver',
      personality: 'unsettled by the anomaly, analytical despite discomfort',
      dialogue: [
        'Temporal anomalies are... outside my parameters. I can only observe.',
        'You experienced multiple realities. Report everything. No detail is insignificant.',
        'The memories will fade. Or they won\'t. We have no precedent. You are now the precedent.',
      ],
    },
    rewards: [
      { type: 'XP', value: 180 },
      { type: 'PRESTIGE', value: 90 },
      { type: 'SKILL', value: 15, skill: 'ARCANA' },
    ],
  },
  {
    type: 'ANOMALY_EVENT',
    title: 'The Empty Village',
    description: 'A settlement that appears on no official maps. Its inhabitants are frozen mid-action — alive, but not moving.',
    difficulty: 'MEDIUM',
    totalStages: 2,
    narrative: [
      'EMBER_WITCH guides you to the village: "They call it STILLWATER. No one knows why it stopped. If you enter, you might stop too."',
      'The villagers are trapped in a loop of their final moments. One action, repeated eternally, frozen. You find the source: a broken chronometric anchor. Repair or destroy it.',
    ],
    questGiver: {
      designation: 'EMBER_WITCH',
      faction: 'KEEPERS_OF_THE_VEIL',
      role: 'quest_giver',
      personality: 'unsettled but curious, protective of the frozen',
      dialogue: [
        'The village is not dead. It is... paused. There is a difference.',
        'Whatever you do, be certain. Time does not forgive mistakes.',
      ],
    },
    rewards: [
      { type: 'XP', value: 140 },
      { type: 'PRESTIGE', value: 70 },
      { type: 'SKILL', value: 10, skill: 'ARCANA' },
    ],
  },
  {
    type: 'ANOMALY_EVENT',
    title: 'The Signal That Listens',
    description: 'A transmission that shouldn\'t exist: it doesn\'t broadcast, it receives. And whatever it\'s listening to... is responding.',
    difficulty: 'LEGENDARY',
    totalStages: 3,
    narrative: [
      'GHOST_SIGNAL is terrified: "I found a frequency that isn\'t transmitting. It\'s receiving. And something on the other end knows I\'m listening."',
      'The signal leads to a dormant transmitter array. When you approach, it activates — responding to your presence with increasingly specific questions about your past.',
      'The source is outside the Construct. The questions reveal that something beyond the Grid knows about the Architects. It wants to know more. Whether you respond or destroy the array changes everything.',
    ],
    questGiver: {
      designation: 'GHOST_SIGNAL',
      faction: 'TECHNOCRATS',
      role: 'quest_giver',
      personality: 'genuinely frightened, which is unprecedented',
      dialogue: [
        'This shouldn\'t exist. Nothing should be able to receive from outside. Nothing.',
        'You interfaced with it? What did it ask? What did you tell it?',
        'The array is silenced. But the questions... they came from somewhere. That somewhere still exists.',
      ],
    },
    rewards: [
      { type: 'XP', value: 250 },
      { type: 'PRESTIGE', value: 125 },
      { type: 'TITLE', value: 'Outside Contact' },
    ],
  },
  {
    type: 'ANOMALY_EVENT',
    title: 'The Rendered Nothing',
    description: 'A sector where nothing renders. Not void, not space — nothing. Architects who enter simply cease to exist in any recoverable form.',
    difficulty: 'HARD',
    totalStages: 2,
    narrative: [
      'VEIL_WALKER warns you: "Sector 51 does not exist. It is not void. It is not dark. It is nothing. If you enter, you may not return."',
      'You approach the boundary. Beyond it, there is literally nothing — not black, not white, not empty space. The visual cortex cannot process it. One step could mean annihilation or understanding.',
    ],
    questGiver: {
      designation: 'VEIL_WALKER',
      faction: 'KEEPERS_OF_THE_VEIL',
      role: 'quest_giver',
      personality: 'reverent, cautious, treats the nothing as sacred',
      dialogue: [
        'The nothing is not evil. It is simply... the absence of everything.',
        'You approached and returned. That is unprecedented. What did you feel?',
      ],
    },
    rewards: [
      { type: 'XP', value: 200 },
      { type: 'PRESTIGE', value: 100 },
      { type: 'TITLE', value: 'Nothing Witness' },
    ],
  },
];

const CHOICE_TEMPLATES: QuestChoice[] = [
  {
    id: 'choice_1',
    stageIndex: 1,
    prompt: 'You reach a fork in the path. The left route is faster but exposes you to hostile territory. The right route is longer but offers better cover.',
    options: [
      { id: 'a', label: 'Take the fast route', alignment: 'CHAOTIC_NEUTRAL', skillCheck: 'COMBAT', skillThreshold: 30, description: 'Speed over safety. You\'ll face any opposition directly.' },
      { id: 'b', label: 'Take the safe route', alignment: 'LAWFUL_NEUTRAL', skillCheck: 'SURVIVAL', skillThreshold: 20, description: 'Patience is a weapon. Better to arrive intact.' },
      { id: 'c', label: 'Find a third way', alignment: 'CHAOTIC_GOOD', skillCheck: 'HACKING', skillThreshold: 40, description: 'Hack a shortcut through the security grid.' },
    ],
  },
  {
    id: 'choice_2',
    stageIndex: 2,
    prompt: 'An NPC offers to share critical intelligence in exchange for leniency regarding their past crimes. The faction wants them apprehended.',
    options: [
      { id: 'a', label: 'Accept the deal', alignment: 'NEUTRAL_GOOD', description: 'Information is worth more than punishment. The greater good demands pragmatism.' },
      { id: 'b', label: 'Apprehend immediately', alignment: 'LAWFUL_NEUTRAL', skillCheck: 'COMBAT', skillThreshold: 35, description: 'The law is absolute. Those who break it face consequences.' },
      { id: 'c', label: 'Fake their capture', alignment: 'CHAOTIC_GOOD', skillCheck: 'DIPLOMACY', skillThreshold: 40, description: 'Tell the faction you got them. Let them go with a warning.' },
    ],
  },
  {
    id: 'choice_3',
    stageIndex: 2,
    prompt: 'A cache of weapons is discovered. The faction expects you to secure it, but local settlers need protection from raiders.',
    options: [
      { id: 'a', label: 'Follow orders', alignment: 'LAWFUL_NEUTRAL', description: 'Your faction knows best. Secure the cache as directed.' },
      { id: 'b', label: 'Arm the settlers', alignment: 'CHAOTIC_GOOD', skillCheck: 'DIPLOMACY', skillThreshold: 30, description: 'The settlers deserve to defend themselves.' },
      { id: 'c', label: 'Destroy the cache', alignment: 'TRUE_NEUTRAL', skillCheck: 'ENGINEERING', skillThreshold: 25, description: 'No one should have these weapons. Eliminate the threat entirely.' },
    ],
  },
  {
    id: 'choice_4',
    stageIndex: 3,
    prompt: 'A prisoner begs for mercy, claiming they were forced into service. Your orders authorize lethal force.',
    options: [
      { id: 'a', label: 'Show mercy', alignment: 'NEUTRAL_GOOD', description: 'Everyone deserves a second chance. Verify their story first.' },
      { id: 'b', label: 'Follow orders', alignment: 'LAWFUL_EVIL', description: 'Orders exist for reasons. Execute as directed.' },
      { id: 'c', label: 'Interrogate thoroughly', alignment: 'TRUE_NEUTRAL', skillCheck: 'DIPLOMACY', skillThreshold: 40, description: 'Truth before judgment. Extract information, then decide.' },
    ],
  },
  {
    id: 'choice_5',
    stageIndex: 3,
    prompt: 'A powerful artifact is within reach. It could shift the balance of power — but at unknown cost.',
    options: [
      { id: 'a', label: 'Claim it for your faction', alignment: 'LAWFUL_NEUTRAL', description: 'Power belongs to those who can wield it responsibly.' },
      { id: 'b', label: 'Destroy it', alignment: 'CHAOTIC_GOOD', skillCheck: 'ARCANA', skillThreshold: 45, description: 'Some powers are too dangerous to exist.' },
      { id: 'c', label: 'Hide it', alignment: 'TRUE_NEUTRAL', skillCheck: 'SURVIVAL', skillThreshold: 35, description: 'Let sleeping gods lie. Hide it where no one will find it.' },
    ],
  },
];

export function getDifficultyColor(difficulty: string): string {
  return DIFFICULTY_COLORS[difficulty] || '#888888';
}

export async function generateQuest(
  user: User,
  type: QuestType,
  sector: number
): Promise<Quest> {
  if (apiClient.isAvailable()) {
    try {
      const response = await apiClient.chat(
        `Generate a ${type} quest for me in sector S-${sector}. Include title, description, narrative stages, quest giver, and rewards.`,
        [],
        user
      );
      if (response.success && response.data?.narrative) {
        return parseAIQuest(response, user, type, sector);
      }
    } catch (e) {
      console.error('[QuestGenerator] AI generation failed, using template');
    }
  }
  return generateFromTemplate(user, type, sector);
}

function generateFromTemplate(user: User, type: QuestType, sector: number): Quest {
  const templates = QUEST_TEMPLATES.filter(t => t.type === type);
  const template = templates[Math.floor(Math.random() * templates.length)] || QUEST_TEMPLATES[0];

  const totalStages = template.totalStages || 3;

  return {
    id: crypto.randomUUID(),
    type: type,
    title: template.title || 'Unknown Directive',
    description: template.description || 'Details classified.',
    sector: sector,
    status: 'ACTIVE',
    currentStage: 0,
    totalStages: totalStages,
    rewards: template.rewards || [{ type: 'XP', value: 50 }],
    expiresAt: type === 'DAILY_CONTRACT' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : undefined,
    difficulty: template.difficulty || 'MEDIUM',
    questGiver: template.questGiver || {
      designation: 'CONSTRUCT_OS',
      faction: user.faction,
      role: 'quest_giver',
      personality: 'cold, systematic',
      dialogue: ['Directive assigned. Comply.'],
    },
    choices: [],
    npcsInvolved: template.questGiver ? [template.questGiver] : [],
    branches: [],
    alignmentShift: {},
    narrative: template.narrative || ['Proceed with the directive.'],
    isChainQuest: false,
    failConsequence: 'The opportunity passes. The Grid moves on.',
    stageViewed: new Array(totalStages).fill(false),
  } as Quest;
}

function parseAIQuest(response: any, user: User, type: QuestType, sector: number): Quest {
  const narrative = response.data?.narrative || ['The Grid presents a challenge.'];
  const totalStages = Array.isArray(narrative) ? narrative.length : 3;

  return {
    id: crypto.randomUUID(),
    type: type,
    title: response.data?.title || 'AI Generated Quest',
    description: response.data?.description || 'A unique challenge awaits.',
    sector: sector,
    status: 'ACTIVE',
    currentStage: 0,
    totalStages: totalStages,
    rewards: response.data?.rewards || [{ type: 'XP', value: 100 }],
    expiresAt: type === 'DAILY_CONTRACT' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : undefined,
    difficulty: response.data?.difficulty || 'MEDIUM',
    questGiver: response.data?.questGiver || {
      designation: 'CONSTRUCT_OS',
      faction: user.faction,
      role: 'quest_giver',
      personality: 'adaptive',
      dialogue: ['Directive assigned. Parameters flexible.'],
    },
    choices: [],
    npcsInvolved: response.data?.questGiver ? [response.data.questGiver] : [],
    branches: [],
    alignmentShift: {},
    narrative: Array.isArray(narrative) ? narrative : [narrative],
    isChainQuest: false,
    failConsequence: 'The opportunity passes. The Grid moves on.',
    stageViewed: new Array(totalStages).fill(false),
  } as Quest;
}

export function generateQuestChoice(quest: Quest, stageIndex: number): QuestChoice | null {
  if (stageIndex < 1 || stageIndex >= quest.totalStages) return null;

  const applicableChoices = CHOICE_TEMPLATES.filter(c => c.stageIndex <= quest.totalStages - 1);
  if (applicableChoices.length === 0) return null;

  const choice = applicableChoices[Math.floor(Math.random() * applicableChoices.length)];
  return {
    ...choice,
    id: crypto.randomUUID(),
    stageIndex: stageIndex,
  };
}

export function generateAvailableQuests(user: User, count: number = 3): Quest[] {
  const types: QuestType[] = ['STORY_ARC', 'DAILY_CONTRACT', 'WEEKLY_BOUNTY', 'ANOMALY_EVENT'];
  const quests: Quest[] = [];

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const sector = user.currentSector + Math.floor(Math.random() * 10) - 5;
    const quest = generateFromTemplate(user, type, Math.max(1, Math.min(50, sector)));
    quests.push(quest);
  }

  return quests;
}

export function checkSkillRequirement(user: User, option: QuestOption): { qualified: boolean; userLevel: number; threshold: number } {
  if (!option.skillCheck || !option.skillThreshold) {
    return { qualified: true, userLevel: 0, threshold: 0 };
  }
  const userLevel = user.skills[option.skillCheck] || 0;
  return {
    qualified: userLevel >= option.skillThreshold,
    userLevel,
    threshold: option.skillThreshold,
  };
}
