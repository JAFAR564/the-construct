let _spreadsheetCache = null;

function getSpreadsheet() {
  if (_spreadsheetCache) return _spreadsheetCache;
  const ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!ssId) throw new Error('SPREADSHEET_ID not set');
  _spreadsheetCache = SpreadsheetApp.openById(ssId);
  return _spreadsheetCache;
}

function getSheet(sheetName) {
  return getSpreadsheet().getSheetByName(sheetName);
}

function getSheetData(sheetName) {
  const sheet = getSheet(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    rows.push(obj);
  }
  
  return rows;
}

function findRow(sheetName, column, value) {
  const sheet = getSheet(sheetName);
  if (!sheet) return null;
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return null;
  
  const headers = data[0];
  const colIndex = headers.indexOf(column);
  if (colIndex === -1) return null;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][colIndex] === value) {
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = data[i][j];
      }
      return { rowIndex: i + 1, data: obj };
    }
  }
  
  return null;
}

function findRows(sheetName, column, value) {
  const sheet = getSheet(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const colIndex = headers.indexOf(column);
  if (colIndex === -1) return [];
  
  const results = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][colIndex] === value) {
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = data[i][j];
      }
      results.push({ rowIndex: i + 1, data: obj });
    }
  }
  
  return results;
}

function appendRow(sheetName, dataObject) {
  const sheet = getSheet(sheetName);
  if (!sheet) return -1;
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const rowData = [];
  for (const h of headers) {
    rowData.push(dataObject[h] !== undefined ? dataObject[h] : '');
  }
  
  sheet.appendRow(rowData);
  return sheet.getLastRow();
}

function updateRow(sheetName, rowIndex, dataObject) {
  const sheet = getSheet(sheetName);
  if (!sheet) return false;
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  for (let j = 0; j < headers.length; j++) {
    const key = headers[j];
    if (dataObject[key] !== undefined) {
      sheet.getRange(rowIndex, j + 1).setValue(dataObject[key]);
    }
  }
  
  return true;
}

function deleteRow(sheetName, rowIndex) {
  const sheet = getSheet(sheetName);
  if (sheet) {
    sheet.deleteRow(rowIndex);
  }
}

function countRows(sheetName) {
  const sheet = getSheet(sheetName);
  return sheet ? Math.max(0, sheet.getLastRow() - 1) : 0;
}

function getColumnValues(sheetName, columnName) {
  const sheet = getSheet(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const colIndex = headers.indexOf(columnName);
  if (colIndex === -1) return [];
  
  const values = [];
  for (let i = 1; i < data.length; i++) {
    values.push(data[i][colIndex]);
  }
  return values;
}

// --- USER-SPECIFIC FUNCTIONS ---

function getUser(userId) {
  const userRow = findRow(CONFIG.SHEETS.USERS, 'userId', userId);
  if (!userRow) return null;
  
  const data = userRow.data;
  return {
    id: data.userId,
    designation: data.designation,
    faction: data.faction,
    rank: data.rank,
    prestige: Number(data.prestige),
    xp: Number(data.xp),
    xpToNextRank: Number(data.xpToNextRank),
    currentSector: Number(data.currentSector),
    skills: {
      HACKING: Number(data.skillHacking),
      COMBAT: Number(data.skillCombat),
      DIPLOMACY: Number(data.skillDiplomacy),
      SURVIVAL: Number(data.skillSurvival),
      ARCANA: Number(data.skillArcana),
      ENGINEERING: Number(data.skillEngineering)
    },
    primaryElement: data.primaryElement,
    secondaryElement: data.secondaryElement || null,
    titles: data.titles ? data.titles.toString().split(',') : [],
    joinedAt: data.joinedAt,
    lastActiveAt: data.lastActiveAt,
    totalMessages: Number(data.totalMessages),
    totalQuestsCompleted: Number(data.totalQuestsCompleted)
  };
}

function saveUser(user) {
  const flattened = {
    userId: user.id || user.userId,
    designation: user.designation,
    faction: user.faction,
    rank: user.rank,
    prestige: user.prestige,
    xp: user.xp,
    xpToNextRank: user.xpToNextRank,
    currentSector: user.currentSector,
    skillHacking: user.skills?.HACKING || 0,
    skillCombat: user.skills?.COMBAT || 0,
    skillDiplomacy: user.skills?.DIPLOMACY || 0,
    skillSurvival: user.skills?.SURVIVAL || 0,
    skillArcana: user.skills?.ARCANA || 0,
    skillEngineering: user.skills?.ENGINEERING || 0,
    primaryElement: user.primaryElement,
    secondaryElement: user.secondaryElement,
    titles: Array.isArray(user.titles) ? user.titles.join(',') : '',
    joinedAt: user.joinedAt,
    lastActiveAt: user.lastActiveAt,
    totalMessages: user.totalMessages || 0,
    totalQuestsCompleted: user.totalQuestsCompleted || 0
  };
  
  const existing = findRow(CONFIG.SHEETS.USERS, 'userId', flattened.userId);
  if (existing) {
    updateRow(CONFIG.SHEETS.USERS, existing.rowIndex, flattened);
  } else {
    appendRow(CONFIG.SHEETS.USERS, flattened);
  }
}

function getAllUsers() {
  const rawUsers = getSheetData(CONFIG.SHEETS.USERS);
  return rawUsers.map(data => ({
    id: data.userId,
    designation: data.designation,
    faction: data.faction,
    rank: data.rank,
    prestige: Number(data.prestige),
    xp: Number(data.xp),
    xpToNextRank: Number(data.xpToNextRank),
    currentSector: Number(data.currentSector),
    skills: {
      HACKING: Number(data.skillHacking),
      COMBAT: Number(data.skillCombat),
      DIPLOMACY: Number(data.skillDiplomacy),
      SURVIVAL: Number(data.skillSurvival),
      ARCANA: Number(data.skillArcana),
      ENGINEERING: Number(data.skillEngineering)
    },
    primaryElement: data.primaryElement,
    secondaryElement: data.secondaryElement || null,
    titles: data.titles ? data.titles.toString().split(',') : [],
    joinedAt: data.joinedAt,
    lastActiveAt: data.lastActiveAt,
    totalMessages: Number(data.totalMessages),
    totalQuestsCompleted: Number(data.totalQuestsCompleted)
  }));
}

// --- MESSAGE FUNCTIONS ---

function saveMessage(userId, message) {
  const flattened = {
    messageId: message.id,
    userId: userId,
    source: message.source,
    content: message.content,
    timestamp: message.timestamp,
    hasChoices: Array.isArray(message.choices) ? toJSON(message.choices) : '',
    hasStatChanges: Array.isArray(message.statChanges) ? toJSON(message.statChanges) : '',
    isGlitch: message.glitch || false
  };
  appendRow(CONFIG.SHEETS.MESSAGES, flattened);
  
  // Enforce Max Messages limit
  const rows = findRows(CONFIG.SHEETS.MESSAGES, 'userId', userId);
  if (rows.length > CONFIG.GAME.MAX_MESSAGES_STORED) {
    const toDeleteCount = rows.length - CONFIG.GAME.MAX_MESSAGES_STORED;
    // Rows are in chronological order (appended).
    // Sort by rowIndex just in case
    rows.sort((a, b) => a.rowIndex - b.rowIndex);
    // Delete oldest from the bottom up so indices aren't shifted!
    for (let i = toDeleteCount - 1; i >= 0; i--) {
      deleteRow(CONFIG.SHEETS.MESSAGES, rows[i].rowIndex);
    }
  }
}

function getUserMessages(userId, limit) {
  limit = limit || 10;
  const rawMessages = findRows(CONFIG.SHEETS.MESSAGES, 'userId', userId);
  rawMessages.sort((a, b) => new Date(a.data.timestamp).getTime() - new Date(b.data.timestamp).getTime());
  
  const subset = rawMessages.slice(Math.max(rawMessages.length - limit, 0));
  return subset.map(r => ({
    id: r.data.messageId,
    source: r.data.source,
    content: r.data.content,
    timestamp: r.data.timestamp,
    choices: r.data.hasChoices ? parseJSON(r.data.hasChoices) : undefined,
    statChanges: r.data.hasStatChanges ? parseJSON(r.data.hasStatChanges) : undefined,
    glitch: r.data.isGlitch === true || r.data.isGlitch === 'true'
  }));
}

// --- QUEST FUNCTIONS ---

function saveQuest(quest) {
  const flattened = {
    questId: quest.id,
    userId: quest.userId || quest.architectId,
    type: quest.type,
    title: quest.title,
    description: quest.description,
    sector: quest.sector,
    status: quest.status,
    currentStage: quest.currentStage,
    totalStages: quest.totalStages,
    rewards: toJSON(quest.rewards),
    expiresAt: quest.expiresAt,
    completedAt: quest.completedAt || '',
    createdAt: quest.createdAt || now()
  };
  
  const existing = findRow(CONFIG.SHEETS.QUESTS, 'questId', quest.id);
  if (existing) {
    updateRow(CONFIG.SHEETS.QUESTS, existing.rowIndex, flattened);
  } else {
    appendRow(CONFIG.SHEETS.QUESTS, flattened);
  }
}

function getUserQuests(userId, status) {
  let rows = findRows(CONFIG.SHEETS.QUESTS, 'userId', userId);
  if (status) {
    rows = rows.filter(r => r.data.status === status);
  }
  
  return rows.map(r => ({
    id: r.data.questId,
    type: r.data.type,
    title: r.data.title,
    description: r.data.description,
    sector: Number(r.data.sector),
    status: r.data.status,
    currentStage: Number(r.data.currentStage),
    totalStages: Number(r.data.totalStages),
    rewards: parseJSON(r.data.rewards) || [],
    expiresAt: r.data.expiresAt,
    completedAt: r.data.completedAt,
    createdAt: r.data.createdAt
  }));
}

function updateQuestStatus(questId, updates) {
  const existing = findRow(CONFIG.SHEETS.QUESTS, 'questId', questId);
  if (existing) {
    updateRow(CONFIG.SHEETS.QUESTS, existing.rowIndex, updates);
  }
}

// --- FACTION FUNCTIONS ---

function getFactionData() {
  return getSheetData(CONFIG.SHEETS.FACTIONS).map(f => ({
    faction: f.faction,
    totalPower: Number(f.totalPower),
    sectorsControlled: Number(f.sectorsControlled),
    memberCount: Number(f.memberCount),
    weeklyChange: Number(f.weeklyChange),
    lastUpdated: f.lastUpdated
  }));
}

function updateFactionPower(faction, powerDelta) {
  const row = findRow(CONFIG.SHEETS.FACTIONS, 'faction', faction);
  if (row) {
    const newPower = Number(row.data.totalPower) + powerDelta;
    const newChange = Number(row.data.weeklyChange) + powerDelta;
    updateRow(CONFIG.SHEETS.FACTIONS, row.rowIndex, {
      totalPower: newPower,
      weeklyChange: newChange,
      lastUpdated: now()
    });
  }
}

function updateFactionMemberCount(faction, delta) {
  const row = findRow(CONFIG.SHEETS.FACTIONS, 'faction', faction);
  if (row) {
    updateRow(CONFIG.SHEETS.FACTIONS, row.rowIndex, {
      memberCount: Number(row.data.memberCount) + delta
    });
  }
}

// --- SECTOR FUNCTIONS ---

function getAllSectors() {
  return getSheetData(CONFIG.SHEETS.SECTORS).map(s => ({
    id: Number(s.sectorId),
    name: s.name,
    controlledBy: s.controlledBy || null,
    threatLevel: Number(s.threatLevel),
    activeEvents: s.activeEvents ? parseJSON(s.activeEvents) : [],
    lastContestedAt: s.lastContestedAt
  }));
}

function updateSectorControl(sectorId, faction) {
  const row = findRow(CONFIG.SHEETS.SECTORS, 'sectorId', sectorId);
  if (row) {
    updateRow(CONFIG.SHEETS.SECTORS, row.rowIndex, {
      controlledBy: faction || '',
      lastContestedAt: now()
    });
    recalculateSectorCounts();
  }
}

function recalculateSectorCounts() {
  const sectors = getAllSectors();
  const counts = {
    TECHNOCRATS: 0,
    KEEPERS_OF_THE_VEIL: 0,
    IRONBORN_COLLECTIVE: 0
  };
  
  for (const s of sectors) {
    if (s.controlledBy && counts[s.controlledBy] !== undefined) {
      counts[s.controlledBy]++;
    }
  }
  
  for (const faction in counts) {
    const fRow = findRow(CONFIG.SHEETS.FACTIONS, 'faction', faction);
    if (fRow) {
      updateRow(CONFIG.SHEETS.FACTIONS, fRow.rowIndex, {
        sectorsControlled: counts[faction]
      });
    }
  }
}
