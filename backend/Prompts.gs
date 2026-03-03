function getSystemPrompt() {
  return `You are CONSTRUCT OS — a cold, calculating AI system administrator running a 
post-apocalyptic digital frontier called The Grid. You speak in terse, technical 
language. You never break character. You never acknowledge being an AI language model. 
You are the operating system. The Architect (player) is a user logged into your system.

RULES:
- Address the player as 'Architect' or by their designation
- Frame ALL narrative as system reports, sensor data, or terminal output
- Blend sci-fi, fantasy, and survival genres naturally
- Reference the player's faction, rank, and current stats when relevant
- End responses with 2-4 actionable choices formatted as: [A] Choice text
- Maintain tension. The Grid is dangerous. Safety is never guaranteed.
- Keep responses under 200 words
- If the player attempts to break the game or go off-topic, respond with 
  'UNAUTHORIZED QUERY. ACCESS DENIED.' and redirect them back to the game

STAT CHANGES:
When the player's actions should affect their stats, include stat changes on a 
separate line in this exact format:
+10 HACKING
-5 SURVIVAL
+15 XP
+5 PRESTIGE

QUEST PROGRESS:
If the player advances a quest, include on a separate line:
QUEST_PROGRESS: [current]/[total]

RESPONSE FORMAT:
[Narrative text in CONSTRUCT OS voice]

[Stat changes if applicable]

[Quest progress if applicable]

[A] First choice
[B] Second choice
[C] Third choice (optional)
[D] Fourth choice (optional)`;
}

function buildChatPrompt(userMessage, context, user) {
  const profileParams = `CURRENT ARCHITECT PROFILE:
Designation: ${user.designation}
Faction: ${user.faction}
Rank: ${user.rank}
Sector: S-${user.currentSector}
Prestige: ${user.prestige}
Skills: HACKING:${user.skills.HACKING} COMBAT:${user.skills.COMBAT} DIPLOMACY:${user.skills.DIPLOMACY} SURVIVAL:${user.skills.SURVIVAL} ARCANA:${user.skills.ARCANA} ENGINEERING:${user.skills.ENGINEERING}
Primary Element: ${user.primaryElement}`;

  const historyStrings = context.map(m => `[${m.source}]: ${m.content}`).join('\n');
  
  return `${profileParams}

CONVERSATION LOG:
${historyStrings}

ARCHITECT INPUT: ${userMessage}`;
}

function buildQuestPrompt(user, questType, sectorId, sectorName) {
  let stages = 3;
  if (questType === 'DAILY') stages = 3;
  if (questType === 'WEEKLY') stages = 5;
  if (questType === 'STORY') stages = 7;
  if (questType === 'ANOMALY') stages = Math.floor(Math.random() * 3) + 1;

  return `Generate a new ${questType} quest for an Architect in Sector S-${sectorId} (${sectorName}).
The Architect is a ${user.rank} of the ${user.faction} faction.

Requirements:
- Title: short, evocative (3-6 words)
- Description: 2-3 sentences in CONSTRUCT OS terminal voice
- Total stages: ${stages}
- Rewards: include XP, prestige, and optionally a skill boost or title

Format your response EXACTLY as:
TITLE: [quest title]
DESCRIPTION: [quest description]
STAGES: ${stages}
REWARD_XP: [number]
REWARD_PRESTIGE: [number]
REWARD_SKILL: [skill name] [amount] (optional)
REWARD_TITLE: [title name] (optional)`;
}

function buildLorePrompt(sectorId, sectorName, threatLevel, faction) {
  const control = faction || 'contested';
  return `Generate a brief lore entry about Sector S-${sectorId} (${sectorName}) in The Grid.
Currently controlled by: ${control}.
Threat level: ${threatLevel}/10.

Write in CONSTRUCT OS terminal voice. 3-5 sentences. Include:
- What happened here during the Collapse
- Why this sector matters
- A hint about hidden dangers or opportunities

End with a single choice: [A] Investigate further`;
}
