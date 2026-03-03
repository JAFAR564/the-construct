/*
DEPLOYMENT INSTRUCTIONS:

1. Create a new Google Apps Script project at https://script.google.com

2. Create all .gs files listed in this project and paste the code.

3. Run setupAPIKeys() and replace the placeholder values:
   - Get a free Gemini API key from https://aistudio.google.com/apikey
   - Get a free Groq API key from https://console.groq.com/keys
   - Set both keys in the function

4. Run setupSpreadsheet() — this creates the Google Sheet database with all tabs.
   Copy the logged Spreadsheet ID and set it in setupAPIKeys().

5. Run setupTriggers() — this creates all time-driven triggers.

6. Deploy as Web App:
   - Click Deploy → New Deployment
   - Type: Web App
   - Execute as: Me
   - Who has access: Anyone
   - Click Deploy
   - Copy the deployment URL

7. Set the deployment URL as VITE_API_ENDPOINT in the frontend .env file:
   VITE_API_ENDPOINT=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

8. Test by visiting the deployment URL in a browser — you should see:
   "CONSTRUCT OS v3.0 — BACKEND OPERATIONAL"

9. Test the API with a POST request:
   curl -X POST YOUR_DEPLOYMENT_URL \
     -H "Content-Type: application/json" \
     -d '{"action":"GET_FACTION_STATUS","userId":"test","payload":{}}'

COST: $0/month. Everything runs on Google's free tier.

LIMITS:
- Google Apps Script: 6 min/execution, 90 min/day total, 20,000 URL fetches/day
- Gemini Free: 60 RPM, 1,500 RPD
- Groq Free: 30 RPM, 14,400 RPD
- Google Sheets: 10 million cells per spreadsheet

These limits support approximately 200-500 daily active users comfortably
with the three-tier AI fallback system.
*/

function setupAPIKeys() {
  PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', 'YOUR_KEY_HERE');
  PropertiesService.getScriptProperties().setProperty('GROQ_API_KEY', 'YOUR_KEY_HERE');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', 'YOUR_ID_HERE');
  Logger.log('API Keys and Spreadsheet ID property keys configured. Please manually set their values in Project Settings or via script before executing setupSpreadsheet.');
}

function setupSpreadsheet() {
  const ss = SpreadsheetApp.create('The Construct — Database');
  const ssId = ss.getId();
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ssId);
  
  // Clear default Sheet1
  const defaultSheet = ss.getSheets()[0];
  defaultSheet.setName('TempSheet');
  
  // Sheet: Users
  const usersSheet = ss.insertSheet('Users');
  usersSheet.appendRow(['userId', 'designation', 'faction', 'rank', 'prestige', 'xp', 'xpToNextRank', 'currentSector', 'skillHacking', 'skillCombat', 'skillDiplomacy', 'skillSurvival', 'skillArcana', 'skillEngineering', 'primaryElement', 'secondaryElement', 'titles', 'joinedAt', 'lastActiveAt', 'totalMessages', 'totalQuestsCompleted']);

  // Sheet: Messages
  const messagesSheet = ss.insertSheet('Messages');
  messagesSheet.appendRow(['messageId', 'userId', 'source', 'content', 'timestamp', 'hasChoices', 'hasStatChanges', 'isGlitch']);

  // Sheet: Quests
  const questsSheet = ss.insertSheet('Quests');
  questsSheet.appendRow(['questId', 'userId', 'type', 'title', 'description', 'sector', 'status', 'currentStage', 'totalStages', 'rewards', 'expiresAt', 'completedAt', 'createdAt']);

  // Sheet: Factions
  const factionsSheet = ss.insertSheet('Factions');
  factionsSheet.appendRow(['faction', 'totalPower', 'sectorsControlled', 'memberCount', 'weeklyChange', 'lastUpdated']);

  // Sheet: Sectors
  const sectorsSheet = ss.insertSheet('Sectors');
  sectorsSheet.appendRow(['sectorId', 'name', 'controlledBy', 'threatLevel', 'activeEvents', 'lastContestedAt']);

  // Sheet: Leaderboard
  const leaderboardSheet = ss.insertSheet('Leaderboard');
  leaderboardSheet.appendRow(['rank', 'userId', 'designation', 'faction', 'playerRank', 'prestige', 'lastUpdated']);

  // Sheet: DailyQuests
  const dailyQuestsSheet = ss.insertSheet('DailyQuests');
  dailyQuestsSheet.appendRow(['questId', 'type', 'title', 'description', 'sector', 'totalStages', 'rewards', 'generatedAt', 'expiresAt']);

  // Sheet: WarHistory
  const warHistorySheet = ss.insertSheet('WarHistory');
  warHistorySheet.appendRow(['cycleId', 'startDate', 'endDate', 'winner', 'technocratScore', 'keepersScore', 'ironbornScore', 'totalParticipants']);

  // Sheet: RateLimits
  const rateLimitsSheet = ss.insertSheet('RateLimits');
  rateLimitsSheet.appendRow(['userId', 'endpoint', 'requestCount', 'windowStart', 'lastRequest']);

  // Sheet: Config
  const configSheet = ss.insertSheet('Config');
  configSheet.appendRow(['key', 'value', 'updatedAt']);

  // Cleanup: delete temp sheet
  ss.deleteSheet(defaultSheet);
  
  // Initialize Sectors
  const activeEvents = JSON.stringify([]);
  const sectorNames = [
    "Neon Abyss", "Chrono Wastes", "The Shattered Prism", "Iron Citadel", "Rift of Echoes",
    "Obsidian Reach", "Veilstorm Basin", "Datafall Canyon", "The Burned Lattice", "Quantum Mire",
    "Crimson Spire", "Silent Grid", "Epsilon Sector", "Ghost Relay", "Null Zone",
    "Whispering Matrix", "Solar Forge", "Frozen Expanse", "Echo Chamber", "Fractured Monolith",
    "The Dark Web", "Vertex Point", "Chrome Desert", "Helios Core", "Aether Node",
    "Synthetic Jungle", "Ashen Steppes", "Digital Mirage", "Cybernetic Ruins", "Void Terminus",
    "The Glowing Maw", "Steel Labyrinth", "Binary Falls", "Rust Valley", "Tachyon Field",
    "Holographic Slums", "Neon Spire", "Clockwork Enclave", "The Glass Ocean", "Crystalline Caverns",
    "Pulse Junction", "Shadow Protocol", "Rogue Algorithm", "Nexus Prime", "Subroutine Depths",
    "Endless Loop", "The Final Grid", "Terminus Station", "Starlight Bridge", "The Last Archive"
  ];
  
  const assignedSectors = [];
  const factionAssignments = [
    ...Array(18).fill('TECHNOCRATS'),
    ...Array(15).fill('KEEPERS_OF_THE_VEIL'),
    ...Array(12).fill('IRONBORN_COLLECTIVE'),
    ...Array(5).fill('')
  ];
  
  // Shuffle faction assignment
  for (let i = factionAssignments.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [factionAssignments[i], factionAssignments[j]] = [factionAssignments[j], factionAssignments[i]];
  }

  for (let i = 0; i < 50; i++) {
    const controlledBy = factionAssignments[i];
    const threatLevel = Math.min(10, Math.ceil((i + 1) / 5)); // Threat 1-10
    assignedSectors.push([i + 1, sectorNames[i], controlledBy, threatLevel, activeEvents, new Date().toISOString()]);
  }
  
  // Write Sectors
  sectorsSheet.getRange(2, 1, 50, 6).setValues(assignedSectors);

  // Initialize Factions
  const nowStr = new Date().toISOString();
  factionsSheet.appendRow(['TECHNOCRATS', 1000, 18, 0, 0, nowStr]);
  factionsSheet.appendRow(['KEEPERS_OF_THE_VEIL', 800, 15, 0, 0, nowStr]);
  factionsSheet.appendRow(['IRONBORN_COLLECTIVE', 700, 12, 0, 0, nowStr]);

  // Initialize Config
  const cycleStart = new Date();
  const cycleEnd = new Date(cycleStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  configSheet.appendRow(['currentWarCycleStart', cycleStart.toISOString(), nowStr]);
  configSheet.appendRow(['currentWarCycleEnd', cycleEnd.toISOString(), nowStr]);
  configSheet.appendRow(['totalUsersRegistered', 0, nowStr]);
  configSheet.appendRow(['systemVersion', '3.0.1', nowStr]);
  configSheet.appendRow(['gemini_daily_count', 0, nowStr]);
  configSheet.appendRow(['groq_daily_count', 0, nowStr]);
  configSheet.appendRow(['daily_count_date', cycleStart.toISOString().split('T')[0], nowStr]);

  Logger.log('Spreadsheet created successfully! URL: ' + ss.getUrl());
  Logger.log('Spreadsheet ID: ' + ssId);
}

function setupTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    ScriptApp.deleteTrigger(trigger);
  }

  ScriptApp.newTrigger('generateDailyQuests')
    .timeBased()
    .everyDays(1)
    .atHour(0)
    .create();

  ScriptApp.newTrigger('expireQuests')
    .timeBased()
    .everyHours(1)
    .create();

  ScriptApp.newTrigger('generateLeaderboard')
    .timeBased()
    .everyMinutes(15)
    .create();

  ScriptApp.newTrigger('processWeeklyWar')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(0)
    .create();

  ScriptApp.newTrigger('cleanupRateLimits')
    .timeBased()
    .everyDays(1)
    .atHour(3)
    .create();

  Logger.log('Triggers created successfully!');
}

function cleanupRateLimits() {
  const sheet = getSheet('RateLimits');
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;
  
  const headers = data[0];
  const windowStartIdx = headers.indexOf('windowStart');
  
  if (windowStartIdx === -1) return;
  
  const now = new Date().getTime();
  const ONE_HOUR = 60 * 60 * 1000;
  
  // Delete from bottom up to maintain indices
  let deletedRows = 0;
  for (let i = data.length - 1; i > 0; i--) {
    const row = data[i];
    const windowStart = new Date(row[windowStartIdx]).getTime();
    
    if (now - windowStart > ONE_HOUR) {
      sheet.deleteRow(i + 1);
      deletedRows++;
    }
  }
  
  Logger.log('Cleaned up ' + deletedRows + ' old rate limit records.');
}
