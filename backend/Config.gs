const CONFIG = {
  // Spreadsheet
  SPREADSHEET_ID: '', // Will be filled after sheet creation
  
  // Sheet Names
  SHEETS: {
    USERS: 'Users',
    MESSAGES: 'Messages',
    QUESTS: 'Quests',
    FACTIONS: 'Factions',
    SECTORS: 'Sectors',
    LEADERBOARD: 'Leaderboard',
    DAILY_QUESTS: 'DailyQuests',
    WAR_HISTORY: 'WarHistory',
    RATE_LIMITS: 'RateLimits',
    CONFIG: 'Config'
  },
  
  // AI Configuration
  AI: {
    GEMINI_MODEL: 'gemini-2.5-flash',
    GEMINI_RPM_LIMIT: 10,        // Stay under 10 RPM free tier for 2.5 Flash
    GEMINI_DAILY_LIMIT: 250,     // Stay under 250/day free tier for 2.5 Flash
    GROQ_MODEL: 'llama-3.3-70b-versatile',
    GROQ_RPM_LIMIT: 30,          // Stay under 30 RPM free tier
    GROQ_DAILY_LIMIT: 14000,     // Stay under 14400/day free tier
    MAX_CONTEXT_MESSAGES: 10,
    MAX_RESPONSE_TOKENS: 500,
    TEMPERATURE: 0.8
  },
  
  // Rate Limiting
  RATE_LIMITS: {
    CHAT_PER_MINUTE: 8,          // Per user
    CHAT_PER_HOUR: 60,           // Per user
    SYNC_PER_MINUTE: 5,          // Per user
    GLOBAL_PER_MINUTE: 50        // All users combined
  },
  
  // Game Constants
  GAME: {
    MAX_SECTORS: 50,
    MAX_MESSAGES_STORED: 100,    // Per user in sheets
    WAR_CYCLE_DAYS: 7,
    DAILY_QUEST_COUNT: 3,
    PRESTIGE_PER_CHAT: 5,
    PRESTIGE_PER_QUEST_COMPLETE: 50,
    XP_PER_CHAT: 10,
    XP_PER_QUEST_STAGE: 25
  },
  
  // Rank Thresholds
  RANKS: [
    { rank: 'INITIATE', prestige: 0, xpPerRank: 500, clearance: 1 },
    { rank: 'OPERATIVE', prestige: 500, xpPerRank: 1000, clearance: 2 },
    { rank: 'SPECIALIST', prestige: 2000, xpPerRank: 2500, clearance: 3 },
    { rank: 'SENTINEL', prestige: 5000, xpPerRank: 5000, clearance: 4 },
    { rank: 'WARDEN', prestige: 12000, xpPerRank: 10000, clearance: 5 },
    { rank: 'COMMANDER', prestige: 25000, xpPerRank: 20000, clearance: 6 },
    { rank: 'OVERLORD', prestige: 50000, xpPerRank: 40000, clearance: 7 },
    { rank: 'SOVEREIGN', prestige: 100000, xpPerRank: 0, clearance: 8 }
  ],
  
  // Faction Definitions
  FACTIONS: {
    TECHNOCRATS: { name: 'Technocrats', color: '#00D4FF', skills: ['HACKING', 'ENGINEERING', 'ARCANA'] },
    KEEPERS_OF_THE_VEIL: { name: 'Keepers of the Veil', color: '#00FF41', skills: ['ARCANA', 'DIPLOMACY', 'SURVIVAL'] },
    IRONBORN_COLLECTIVE: { name: 'Ironborn Collective', color: '#FF6600', skills: ['COMBAT', 'SURVIVAL', 'ENGINEERING'] }
  }
};

// Store API keys in PropertiesService — NEVER in code
function getGeminiKey() {
  return PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
}

function getGroqKey() {
  return PropertiesService.getScriptProperties().getProperty('GROQ_API_KEY');
}
